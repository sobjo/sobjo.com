/*
 * SOBJO workshop: the playable hero on the home page.
 *
 * A robot claw hangs from a trolley along the top of the hero and follows the pointer anywhere in it.
 * Press on (or tap) a project on the desk: the claw reaches in, grabs it, lifts it up
 * off the top of the screen, the room blurs, and the project's page fades in.
 *
 * Easter egg: W A S D walks the Microduck around the room.
 *
 * The static room is drawn once (./scenery.ts); the desk items, the duck and the arm
 * are redrawn every frame as SVG strings (./svg.ts), which is far cheaper than
 * reconciling a few hundred React elements at 60fps.
 *
 *   geometry.ts  positions, sizes, the isometric projection and the track
 *   svg.ts       helpers that write SVG markup
 *   scenery.ts   the room, furniture and cats
 *   items.ts     the projects on the desk and where they link to
 *   duck.ts      the Microduck and its WASD controls
 *   arm.ts       the robot claw drawn over the whole hero
 *   engine.ts    this file: input, the grab sequence and per-frame drawing
 */

import { drawArm } from './arm'
import { createDuck, drawDuck, stepDuck, type DuckKeys } from './duck'
import { DESK_Z, iso, n1 } from './geometry'
import { buildDeskItems, type DeskItem, type DeskProject } from './items'
import { FLOOR_PLANT, drawBackLayer, drawFrontLayer, drawPlantLayer } from './scenery'
import { escapeXml, finishLayer, raw, setIdleAnimations, startLayer } from './svg'

export interface WorkshopOptions {
  /** The whole hero. The arm follows the pointer anywhere over it. */
  stage: HTMLElement
  /** The isometric room drawing, with its layer groups. */
  room: SVGSVGElement
  /** The <svg> over the whole hero that the arm is drawn on. */
  overlay: SVGSVGElement
  projects: DeskProject[]
  /** Called once the grabbed project is off screen; should open `href`. */
  onPick: (href: string) => void
  /** Live region for screen reader announcements. */
  status?: HTMLElement | null
}

/** How long the claw takes to close on an item, in seconds. */
const GRIP_TIME = 0.22
/** How long the room blurs before the page changes, in ms. */
const BLUR_MS = 320

type Phase = 'follow' | 'reach' | 'grip' | 'lift' | 'leave'

/** Draws the workshop and starts it. Returns a cleanup function. */
export function mountWorkshop(opts: WorkshopOptions): () => void {
  const { stage, room, overlay } = opts
  const layer = (id: string) => room.querySelector<SVGGElement>(`#${id}`)!
  const layerItems = layer('ws-items')
  const layerDuck = layer('ws-duck')
  const layerPlant = layer('ws-plant')
  const layerTop = layer('ws-top')

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const items = buildDeskItems(opts.projects)
  const duck = createDuck()
  const keys: DuckKeys = { up: false, down: false, left: false, right: false }

  // ------------------------------------------------------------------ sizes and coordinates
  let W = 1
  let H = 1
  function resize() {
    const r = stage.getBoundingClientRect()
    W = Math.max(1, r.width)
    H = Math.max(1, r.height)
    overlay.setAttribute('viewBox', `0 0 ${n1(W)} ${n1(H)}`)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(stage)

  /** Maps room drawing coordinates to hero pixels: scale `s`, then offset. */
  function roomToStage() {
    const m = room.getScreenCTM()
    const r = stage.getBoundingClientRect()
    if (!m) return { s: 1, ox: 0, oy: 0 }
    return { s: m.a, ox: m.e - r.left, oy: m.f - r.top }
  }
  /** Where an item's middle is, in hero pixels. */
  function itemPoint(it: DeskItem, map = roomToStage()) {
    const p = iso(it.x, it.y, DESK_Z + it.h * 0.45)
    return [map.ox + p[0] * map.s, map.oy + p[1] * map.s] as [number, number]
  }

  // ------------------------------------------------------------------ state
  /** Where the claw's fingertips are, and where the pointer wants them. */
  const tip: [number, number] = [W * 0.6, H * 0.55]
  let pointer: [number, number] | null = null
  let hover: DeskItem | null = null
  let phase: Phase = 'follow'
  /** The item being reached for or carried, and how long the current phase has run. */
  let picked: DeskItem | null = null
  let phaseT = 0
  let liftV = 0
  let time = 0
  /** How far the rod leans, following the trolley's sideways speed. */
  let tilt = 0
  let lastTipX = 0
  const timeouts: number[] = []

  function setPhase(p: Phase) {
    phase = p
    phaseT = 0
  }

  // ------------------------------------------------------------------ input
  function localPoint(e: PointerEvent): [number, number] {
    const r = stage.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }
  /** The project under hero point `p`, if any. */
  function itemAt(p: [number, number]) {
    const map = roomToStage()
    let best: DeskItem | null = null
    let bd = 44 * Math.max(0.7, map.s)
    for (const it of items) {
      if (!it.href) continue
      const q = itemPoint(it, map)
      const d = Math.hypot(q[0] - p[0], q[1] - p[1])
      if (d < bd) {
        bd = d
        best = it
      }
    }
    return best
  }
  function onMove(e: PointerEvent) {
    if (phase !== 'follow') return
    pointer = localPoint(e)
    hover = itemAt(pointer)
    stage.style.cursor = hover ? 'grab' : ''
  }
  function onLeave() {
    if (phase === 'follow') hover = null
  }
  function onDown(e: PointerEvent) {
    if (phase !== 'follow' || (e.button && e.button !== 0)) return
    pointer = localPoint(e)
    const it = itemAt(pointer)
    if (!it || !it.href) return
    picked = it
    hover = it
    stage.style.cursor = 'grabbing'
    if (opts.status) opts.status.textContent = `Grabbing ${it.name}. Opening the project.`
    if (reduceMotion) {
      opts.onPick(it.href)
      return
    }
    setPhase('reach')
  }

  /** W A S D steer the duck, unless you're typing somewhere. */
  function keyFor(e: KeyboardEvent): keyof DuckKeys | null {
    if (e.ctrlKey || e.metaKey || e.altKey) return null
    const t = e.target as HTMLElement | null
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return null
    switch (e.key.toLowerCase()) {
      case 'w':
        return 'up'
      case 's':
        return 'down'
      case 'a':
        return 'left'
      case 'd':
        return 'right'
    }
    return null
  }
  function onKeyDown(e: KeyboardEvent) {
    const k = keyFor(e)
    if (!k || !visible) return
    keys[k] = true
  }
  function onKeyUp(e: KeyboardEvent) {
    const k = keyFor(e)
    if (k) keys[k] = false
  }
  function onBlur() {
    keys.up = keys.down = keys.left = keys.right = false
  }

  stage.addEventListener('pointermove', onMove)
  stage.addEventListener('pointerdown', onDown)
  stage.addEventListener('pointerleave', onLeave)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)

  // ------------------------------------------------------------------ simulation
  function ease(goal: [number, number], rate: number, dt: number) {
    const k = Math.min(1, dt * rate)
    tip[0] += (goal[0] - tip[0]) * k
    tip[1] += (goal[1] - tip[1]) * k
  }

  function step(dt: number) {
    time += dt
    phaseT += dt
    stepDuck(duck, dt, keys, reduceMotion)
    // the claw swings back a little when the trolley moves sideways, then settles
    if (dt > 0) {
      const vx = (tip[0] - lastTipX) / dt
      tilt += (Math.max(-14, Math.min(14, -vx * 0.012)) - tilt) * Math.min(1, dt * 6)
    }
    lastTipX = tip[0]
    if (phase === 'follow') {
      // with no pointer yet (or on touch screens), hover over the desk and drift a little
      const map = roomToStage()
      const idle: [number, number] = [map.ox + 960 * map.s + Math.sin(time * 0.6) * 30, map.oy + 360 * map.s + Math.sin(time * 0.9) * 14]
      ease(pointer ?? idle, pointer ? 14 : 2.5, dt)
    } else if (phase === 'reach' && picked) {
      const goal = itemPoint(picked)
      ease(goal, 9, dt)
      if (Math.hypot(goal[0] - tip[0], goal[1] - tip[1]) < 4 || phaseT > 0.9) setPhase('grip')
    } else if (phase === 'grip' && picked) {
      ease(itemPoint(picked), 20, dt)
      if (phaseT > GRIP_TIME) {
        liftV = 0
        setPhase('lift')
      }
    } else if (phase === 'lift' && picked) {
      // up and off the top of the screen, speeding up as it goes
      liftV += 2600 * dt
      tip[1] -= liftV * dt
      if (tip[1] < -80 || phaseT > 1.4) {
        setPhase('leave')
        stage.dataset.leaving = 'true'
        const href = picked.href!
        timeouts.push(window.setTimeout(() => opts.onPick(href), BLUR_MS))
      }
    }
  }

  // ------------------------------------------------------------------ per-frame drawing
  /** The rounded name tag above a project. */
  function tag(it: DeskItem) {
    const p = iso(it.x, it.y, DESK_Z + it.h + 0.45)
    const label = `${it.name.toUpperCase()} →`
    const wpx = label.length * 6.6 + 20
    raw(
      `<rect x="${n1(p[0] - wpx / 2)}" y="${n1(p[1] - 20)}" width="${n1(wpx)}" height="19" rx="9.5" fill="#F2BE22"/>` +
        `<text x="${n1(p[0])}" y="${n1(p[1] - 7)}" text-anchor="middle" class="mono" font-size="9.5" font-weight="700" fill="#1C2128">${escapeXml(label)}</text>`,
    )
  }

  /** The project being carried, drawn on the arm's layer at the claw. */
  function heldMarkup(map: ReturnType<typeof roomToStage>) {
    if (!picked || (phase !== 'lift' && phase !== 'leave')) return ''
    const anchor = iso(picked.x, picked.y, DESK_Z + picked.h * 0.45)
    startLayer()
    picked.draw(time, 0)
    return `<g transform="scale(${map.s.toFixed(3)}) translate(${n1(-anchor[0])} ${n1(-anchor[1])})">${finishLayer()}</g>`
  }

  function render() {
    const carried = picked && (phase === 'lift' || phase === 'leave') ? picked : null
    startLayer()
    for (const it of items) {
      if (it === carried) continue
      if (it === hover && phase === 'follow') {
        const g = iso(it.x, it.y, DESK_Z)
        raw(`<ellipse cx="${n1(g[0])}" cy="${n1(g[1])}" rx="34" ry="17" fill="#F2BE22" opacity="0.35"/>`)
      }
      it.draw(time, 0)
    }
    layerItems.innerHTML = finishLayer()

    startLayer()
    drawDuck(duck)
    layerDuck.innerHTML = finishLayer()
    // whichever of the duck and the big plant is nearer the viewer is drawn on top
    const duckInFront = duck.x + duck.y > FLOOR_PLANT[0] + FLOOR_PLANT[1]
    if (duckInFront !== (layerPlant.compareDocumentPosition(layerDuck) === Node.DOCUMENT_POSITION_FOLLOWING))
      room.insertBefore(duckInFront ? layerPlant : layerDuck, duckInFront ? layerDuck : layerPlant)

    startLayer()
    if (hover && hover !== carried && phase !== 'leave') tag(hover)
    layerTop.innerHTML = finishLayer()

    const map = roomToStage()
    const grip = phase === 'grip' ? Math.min(1, phaseT / GRIP_TIME) : phase === 'lift' || phase === 'leave' ? 1 : 0
    overlay.innerHTML = `<g class="ws-arm">${drawArm({ w: W, tip, grip, tilt, clawScale: map.s }, heldMarkup(map))}</g>`
  }

  // ------------------------------------------------------------------ boot
  setIdleAnimations(!reduceMotion)
  layer('ws-back').innerHTML = drawBackLayer()
  layer('ws-front').innerHTML = drawFrontLayer()
  layerPlant.innerHTML = drawPlantLayer()
  tip[0] = W * 0.62
  tip[1] = H * 0.45

  // Only animate while the hero is on screen.
  let last: number | null = null
  let visible = true
  let raf = 0
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting
  })
  io.observe(stage)
  function frame(now: number) {
    if (last === null) last = now
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (visible) {
      step(dt)
      render()
    }
    raf = requestAnimationFrame(frame)
  }
  render()
  raf = requestAnimationFrame(frame)

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    timeouts.forEach((t) => window.clearTimeout(t))
    delete stage.dataset.leaving
    stage.style.cursor = ''
    stage.removeEventListener('pointermove', onMove)
    stage.removeEventListener('pointerdown', onDown)
    stage.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
  }
}
