/*
 * SOBJO workshop: the playable hero on the home page.
 *
 * The arm follows the pointer. Press on (or tap) an item riding the belt to
 * pick it up, then release (or tap again) over the cardboard box. Whatever
 * lands in the box takes you to its page.
 *
 * The static room is drawn once (./scenery.ts); the arm, the belt and the
 * items are redrawn every frame as SVG strings (./svg.ts), which is far
 * cheaper than reconciling a few hundred React elements at 60fps.
 *
 *   geometry.ts  positions, sizes and the isometric projection
 *   svg.ts       helpers that write SVG markup
 *   scenery.ts   the room, furniture and cats
 *   items.ts     the things riding the belt and where they link to
 *   engine.ts    this file: input, physics and per-frame drawing
 */

import {
  BELT_D,
  BELT_X0,
  BELT_X1,
  BELT_Y,
  BELT_Z,
  BOX_H,
  BOX_SIZE,
  BOX_X,
  BOX_Y,
  FOREARM_LEN,
  GRIP_OFFSET,
  HOVER_Z,
  PALM_OFFSET,
  REACH,
  ROOM_W,
  SHOULDER,
  UPPER_ARM_LEN,
  clamp,
  iso,
  n1,
  unproject,
  type Vec3,
} from './geometry'
import { WORKSHOP_ITEMS, type WorkshopItemDef } from './items'
import { drawBackLayer, drawFrontLayer, drawMiddleLayer } from './scenery'
import {
  circle,
  escapeXml,
  finishLayer,
  line,
  opacityAttr,
  polygon,
  raw,
  setIdleAnimations,
  shadow,
  startLayer,
} from './svg'

export interface WorkshopOptions {
  /** Called once an item lands in the box. */
  onSorted: (href: string) => void
  /** Live region for screen reader announcements. */
  status?: HTMLElement | null
}

/** How far an item rides before slipping under the IN machine's hidden return. */
const VISIBLE = BELT_X1 - BELT_X0 - 1.0
/** Gap between items on the belt. */
const SPACING = 2.2
/** One full lap of the belt, including the hidden return. */
const LOOP = SPACING * WORKSHOP_ITEMS.length
/** Gravity for dropped items, in workshop units per second squared. */
const GRAVITY = 26
/** How long a dropped item lies on the floor before it slips back onto the belt, in seconds. */
const FLOOR_TIME = 1.4
/** Pause between an item landing in the box and the page changing, so the toast can show. */
const NAVIGATE_DELAY_MS = 650

/**
 * Where an item is right now:
 *   belt   riding the belt (`pos` is how far along it is)
 *   held   in the gripper
 *   fall   dropped and falling toward `dest`
 *   sorted landed in the box
 *   floor  landed on the floor; slips back onto the belt when `timer` runs out
 */
type Mode = 'belt' | 'held' | 'fall' | 'sorted' | 'floor'

interface Item {
  def: WorkshopItemDef
  mode: Mode
  pos: number
  /** Position while falling, sorted or on the floor. */
  x: number
  y: number
  z: number
  /** Vertical speed while falling. */
  vz: number
  /** The height it stops falling at. */
  zEnd: number
  dest: 'box' | 'belt' | 'floor' | null
  timer: number
}

/** Draws the workshop into `svg` and starts the simulation. Returns a cleanup function. */
export function mountWorkshop(svg: SVGSVGElement, opts: WorkshopOptions): () => void {
  const layer = (id: string) => svg.querySelector<SVGGElement>(`#${id}`)!
  const layerArm = layer('ws-arm')
  const layerItems = layer('ws-items')
  const layerTop = layer('ws-top')

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Belt speed in workshop units per second. The belt stands still for visitors who prefer reduced motion.
  const SPEED = reduceMotion ? 0 : 0.55

  const items: Item[] = WORKSHOP_ITEMS.map((def, i) => ({
    def,
    mode: 'belt',
    pos: i * SPACING,
    x: 0,
    y: 0,
    z: 0,
    vz: 0,
    zEnd: 0,
    dest: null,
    timer: 0,
  }))
  /** Items ride centered across the belt. */
  function beltY(it: Item) {
    return BELT_Y + (BELT_D - it.def.d) / 2
  }
  /** Items fade in as they come out of the IN machine and fade out before the end of the belt. */
  function beltOpacity(it: Item) {
    const end = VISIBLE - it.def.w
    if (it.pos < 0 || it.pos > end + 0.01) return 0
    if (it.pos < 0.5) return it.pos / 0.5
    if (it.pos > end - 0.5) return Math.max(0, (end - it.pos) / 0.5)
    return 1
  }
  /** Where an item's back-left-bottom corner is right now. */
  function itemBase(it: Item): Vec3 {
    if (it.mode === 'belt') return [BELT_X0 + it.pos, beltY(it), BELT_Z]
    if (it.mode === 'held') return [fingertip.x - it.def.w / 2, fingertip.y - it.def.d / 2, fingertip.z + 0.35 - it.def.h]
    return [it.x, it.y, it.z]
  }

  // ------------------------------------------------------------------ arm state
  /** Where the gripper's fingertips are. Everything else about the arm is worked out from this. */
  const fingertip = { x: BOX_X + BOX_SIZE / 2, y: 7.4, z: HOVER_Z }
  /** Where the pointer wants the fingertips to go. */
  let target = { x: BOX_X + BOX_SIZE / 2, y: 7.4 }
  /** The item in the gripper. */
  let holding: Item | null = null
  /** The item the arm is reaching for. */
  let chase: Item | null = null
  /** Drop the held item once the arm reaches `target`. */
  let pendingDrop = false
  /** Set once an item lands in the box; the page changes shortly after. */
  let navigating: { item: Item; t: number } | null = null
  /** The current press, to tell a tap from a drag. */
  let press = { down: false, x: 0, y: 0, moved: false, grabbedDuring: false }
  /** The item under the pointer, which gets a name tag. */
  let hover: Item | null = null
  const timeouts: number[] = []

  /** How high the fingertips ride: higher when carrying something tall. */
  function holdZ() {
    return holding ? Math.max(HOVER_Z, 3.9 + holding.def.h - 0.35) : HOVER_Z
  }
  /** Keeps the pointer target over the belt, the box and the floor around them. */
  function clampTarget(p: { x: number; y: number }) {
    // the belt, the box and the floor around them; not over the desk by the left wall
    let x = clamp(p.x, BELT_X0, ROOM_W - 1.2)
    let y = clamp(p.y, 5.0, 11.5)
    // keep the fingertips where the arm can actually reach
    const dx = x - SHOULDER[0]
    const dy = y - SHOULDER[1]
    const d = Math.hypot(dx, dy)
    if (d > REACH) {
      x = SHOULDER[0] + (dx / d) * REACH
      y = SHOULDER[1] + (dy / d) * REACH
    }
    return { x, y }
  }

  /**
   * Finds the elbow joint for a given wrist position: the point that is UPPER_ARM_LEN from the
   * shoulder and FOREARM_LEN from the wrist (two-link inverse kinematics).
   */
  function solveElbow(W: Vec3): Vec3 {
    const dx = W[0] - SHOULDER[0]
    const dy = W[1] - SHOULDER[1]
    const dz = W[2] - SHOULDER[2]
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
    const dc = clamp(d, Math.abs(UPPER_ARM_LEN - FOREARM_LEN) + 0.1, UPPER_ARM_LEN + FOREARM_LEN - 0.05)
    const ux = dx / d
    const uy = dy / d
    const uz = dz / d
    const a = (UPPER_ARM_LEN * UPPER_ARM_LEN - FOREARM_LEN * FOREARM_LEN + dc * dc) / (2 * dc)
    const hgt = Math.sqrt(Math.max(0, UPPER_ARM_LEN * UPPER_ARM_LEN - a * a))
    // bend the elbow up and back (toward the back wall) so the two links never fold onto each other on screen
    const px = 0
    const py = -0.55
    const pz = 1
    const pd = px * ux + py * uy + pz * uz
    let vx = px - pd * ux
    let vy = py - pd * uy
    let vz = pz - pd * uz
    const vl = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1
    vx /= vl
    vy /= vl
    vz /= vl
    return [SHOULDER[0] + ux * a + vx * hgt, SHOULDER[1] + uy * a + vy * hgt, SHOULDER[2] + uz * a + vz * hgt]
  }

  // ------------------------------------------------------------------ input
  /** The pointer's position in the SVG's own coordinates. */
  function svgPoint(e: PointerEvent) {
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const m = svg.getScreenCTM()
    return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }
  }
  function itemScreen(it: Item) {
    const b = itemBase(it)
    return iso(b[0] + it.def.w / 2, b[1] + it.def.d / 2, b[2] + it.def.h * 0.6)
  }
  /** The visible belt item closest to screen point `p`, within 64px. */
  function itemAt(p: { x: number; y: number }) {
    let best: Item | null = null
    let bd = 64
    for (const it of items) {
      if (it.mode !== 'belt' || beltOpacity(it) < 0.5) continue
      const s = itemScreen(it)
      const dd = Math.hypot(s[0] - p.x, s[1] - p.y)
      if (dd < bd) {
        bd = dd
        best = it
      }
    }
    return best
  }
  function overBox(x: number, y: number) {
    return x > BOX_X + 0.1 && x < BOX_X + BOX_SIZE - 0.1 && y > BOX_Y + 0.1 && y < BOX_Y + BOX_SIZE - 0.1
  }

  function onMove(e: PointerEvent) {
    if (navigating) return
    const p = svgPoint(e)
    target = clampTarget(unproject(p.x, p.y, holdZ()))
    hover = holding ? null : itemAt(p)
    svg.style.cursor = holding ? 'grabbing' : hover ? 'grab' : 'default'
    if (press.down && Math.hypot(p.x - press.x, p.y - press.y) > 10) press.moved = true
  }
  function onDown(e: PointerEvent) {
    if (navigating || (e.button && e.button !== 0)) return
    const p = svgPoint(e)
    press = { down: true, x: p.x, y: p.y, moved: false, grabbedDuring: false }
    target = clampTarget(unproject(p.x, p.y, holdZ()))
    if (holding) {
      pendingDrop = true // second tap: drop where you tapped
      return
    }
    const it = itemAt(p)
    if (it) {
      chase = it
      try {
        svg.setPointerCapture(e.pointerId)
      } catch {
        // pointer may already be gone
      }
    }
  }
  function onUp() {
    if (holding && press.down && press.grabbedDuring && press.moved) pendingDrop = true // drag-and-drop
    press.down = false
  }
  function onCancel() {
    press.down = false
  }
  svg.addEventListener('pointermove', onMove)
  svg.addEventListener('pointerdown', onDown)
  svg.addEventListener('pointerup', onUp)
  svg.addEventListener('pointercancel', onCancel)

  /** Lets go of the held item. It falls into the box, back onto the belt, or onto the floor. */
  function drop() {
    const it = holding
    if (!it) return
    const b = itemBase(it)
    holding = null
    pendingDrop = false
    it.mode = 'fall'
    it.x = b[0]
    it.y = b[1]
    it.z = b[2]
    it.vz = 0
    if (overBox(fingertip.x, fingertip.y)) {
      it.dest = 'box'
      it.zEnd = 0.3
      it.x = clamp(it.x, BOX_X + 0.15, BOX_X + BOX_SIZE - it.def.w - 0.15)
      it.y = clamp(it.y, BOX_Y + 0.15, BOX_Y + BOX_SIZE - it.def.d - 0.15)
    } else if (fingertip.y > BELT_Y + 0.2 && fingertip.y < BELT_Y + BELT_D - 0.2 && fingertip.x > BELT_X0 + 0.4 && fingertip.x < BELT_X1 - 0.6) {
      it.dest = 'belt'
      it.zEnd = BELT_Z
      it.y = beltY(it)
    } else {
      it.dest = 'floor'
      it.zEnd = 0
    }
  }

  /** An item landed in the box: show the toast, announce it, then open its page. */
  function goTo(it: Item) {
    navigating = { item: it, t: 0 }
    svg.style.cursor = 'default'
    if (opts.status) opts.status.textContent = `Sorted: ${it.def.name}. Opening the page.`
    timeouts.push(window.setTimeout(() => opts.onSorted(it.def.href), NAVIGATE_DELAY_MS))
  }

  // ------------------------------------------------------------------ simulation
  /** Slides the belt's ridges along so the belt looks like it is moving. */
  let beltOffset = 0

  /** Advances everything by `dt` seconds. */
  function step(dt: number) {
    beltOffset = (beltOffset + SPEED * dt) % 0.9
    moveItems(dt)
    moveFingertip(dt)
    if (pendingDrop && holding && Math.hypot(fingertip.x - target.x, fingertip.y - target.y) < 0.3) drop()
    if (navigating) navigating.t += dt
  }

  function moveItems(dt: number) {
    for (const it of items) {
      if (it.mode === 'belt') {
        it.pos += SPEED * dt
        if (it.pos > LOOP) it.pos -= LOOP
      } else if (it.mode === 'fall') {
        it.vz -= GRAVITY * dt
        it.z += it.vz * dt
        if (it.z <= it.zEnd) {
          it.z = it.zEnd
          if (it.dest === 'box') {
            it.mode = 'sorted'
            if (!navigating) goTo(it)
          } else if (it.dest === 'belt') {
            it.mode = 'belt'
            it.pos = it.x - BELT_X0
          } else {
            it.mode = 'floor'
            it.timer = FLOOR_TIME
          }
        }
      } else if (it.mode === 'floor') {
        it.timer -= dt
        if (it.timer <= 0) {
          it.mode = 'belt' // slips back onto the line
          it.pos = LOOP - 0.6
        }
      }
    }
  }

  /** Eases the fingertips toward the item being chased (grabbing it on arrival) or toward the pointer. */
  function moveFingertip(dt: number) {
    let goal: { x: number; y: number; z: number }
    if (chase && chase.mode !== 'belt') chase = null
    if (chase) {
      const b = itemBase(chase)
      const cx = b[0] + chase.def.w / 2
      const cy = b[1] + chase.def.d / 2
      const close = Math.hypot(fingertip.x - cx, fingertip.y - cy) < 0.3
      goal = { x: cx, y: cy, z: close ? b[2] + chase.def.h - 0.15 : HOVER_Z }
      if (close && fingertip.z < b[2] + chase.def.h + 0.05) {
        holding = chase
        holding.mode = 'held'
        chase = null
        press.grabbedDuring = press.down
        svg.style.cursor = 'grabbing'
      }
    } else {
      goal = { x: target.x, y: target.y, z: holdZ() }
    }
    const k = Math.min(1, dt * (chase ? 9 : 12))
    fingertip.x += (goal.x - fingertip.x) * k
    fingertip.y += (goal.y - fingertip.y) * k
    fingertip.z += (goal.z - fingertip.z) * Math.min(1, dt * 14)
  }

  // ------------------------------------------------------------------ per-frame drawing
  /** The rounded name tag that floats above an item. */
  function tag(it: Item, highlight: boolean) {
    const b = itemBase(it)
    const p = iso(b[0] + it.def.w / 2, b[1] + it.def.d / 2, b[2] + it.def.h + 0.55)
    const label = it.def.name.toUpperCase()
    const wpx = label.length * 6.6 + 18
    const o = it.mode === 'belt' ? beltOpacity(it) : 1
    raw(
      `<g${opacityAttr(Math.round(o * 100) / 100)}><rect x="${n1(p[0] - wpx / 2)}" y="${n1(p[1] - 18)}" width="${n1(wpx)}" height="17" rx="8.5" fill="${highlight ? '#F2BE22' : '#1C2128'}"/>` +
        `<text x="${n1(p[0])}" y="${n1(p[1] - 6)}" text-anchor="middle" class="mono" font-size="9" font-weight="700" fill="${highlight ? '#1C2128' : '#F7F9FB'}">${escapeXml(label)}</text></g>`,
    )
  }

  /** Redraws the three moving layers. */
  function render() {
    const W: Vec3 = [fingertip.x, fingertip.y, fingertip.z + GRIP_OFFSET]
    const El = solveElbow(W)
    const sh = iso(SHOULDER[0], SHOULDER[1], SHOULDER[2])
    const el = iso(El[0], El[1], El[2])
    const wr = iso(W[0], W[1], W[2])
    const gp = iso(fingertip.x, fingertip.y, fingertip.z + PALM_OFFSET)

    // layer: upper arm (sits behind the belt)
    startLayer()
    line([sh[0] + 4, sh[1] + 2.7], [el[0] + 4, el[1] + 2.7], 23, '#D9A40F')
    line(sh, el, 21, '#F2BE22')
    line([sh[0] - 6, sh[1]], [el[0] - 6, el[1]], 3.5, '#F8D664')
    const c1 = iso(
      SHOULDER[0] + (El[0] - SHOULDER[0]) * 0.25 + 0.27,
      SHOULDER[1] + (El[1] - SHOULDER[1]) * 0.25,
      SHOULDER[2] + (El[2] - SHOULDER[2]) * 0.25,
    )
    const c2 = iso(
      SHOULDER[0] + (El[0] - SHOULDER[0]) * 0.7 + 0.27,
      SHOULDER[1] + (El[1] - SHOULDER[1]) * 0.7,
      SHOULDER[2] + (El[2] - SHOULDER[2]) * 0.7,
    )
    line(c1, c2, 2, '#2A2F36')
    circle(sh, 13.5, '#8C97A4')
    circle(sh, 5.5, '#5E6875')
    layerArm.innerHTML = finishLayer()

    // layer: belt surface, items on the belt, things falling into the box
    startLayer()
    for (let sx = BELT_X0 + 0.6 - beltOffset; sx < BELT_X1; sx += 0.9)
      if (sx > BELT_X0 + 0.05) line(iso(sx, BELT_Y + 0.1, 2.6), iso(sx, BELT_Y + BELT_D - 0.1, 2.6), 1.5, '#4A515C')
    line(iso(BELT_X0, BELT_Y + BELT_D, 2.6), iso(BELT_X1, BELT_Y + BELT_D, 2.6), 1.5, '#A3ADB9')
    line(iso(BELT_X0, BELT_Y, 2.6), iso(BELT_X1, BELT_Y, 2.6), 3, '#5E6875')
    for (const it of items) {
      if (it.mode === 'belt') {
        const o = beltOpacity(it)
        if (o <= 0) continue
        const b = itemBase(it)
        raw(`<g${opacityAttr(Math.round(o * 100) / 100)}>`)
        it.def.draw(b[0], b[1], b[2])
        raw('</g>')
      } else if (it.mode === 'fall' || it.mode === 'sorted' || it.mode === 'floor') {
        if (it.mode === 'floor' || (it.mode === 'fall' && it.dest === 'floor')) shadow(it.x, it.y, it.def.w, it.def.d, 0.12)
        const fo = it.mode === 'floor' ? Math.min(1, it.timer / 0.5) : 1
        raw(`<g${opacityAttr(Math.round(fo * 100) / 100)}>`)
        it.def.draw(it.x, it.y, it.z)
        raw('</g>')
      }
    }
    if (holding) {
      const on = overBox(fingertip.x, fingertip.y)
      polygon(
        [
          iso(BOX_X + 0.1, BOX_Y + 0.1, BOX_H + 0.02),
          iso(BOX_X + BOX_SIZE - 0.1, BOX_Y + 0.1, BOX_H + 0.02),
          iso(BOX_X + BOX_SIZE - 0.1, BOX_Y + BOX_SIZE - 0.1, BOX_H + 0.02),
          iso(BOX_X + 0.1, BOX_Y + BOX_SIZE - 0.1, BOX_H + 0.02),
        ],
        '#F2BE22',
        on ? 0.55 : 0.2,
      )
    }
    layerItems.innerHTML = finishLayer()

    // layer: forearm, gripper, held item, labels, toast
    startLayer()
    line([el[0] + 2.7, el[1] + 4], [wr[0] + 2.7, wr[1] + 4], 16, '#D9A40F')
    line(el, wr, 15, '#F2BE22')
    line([el[0] - 1.3, el[1] - 5.3], [wr[0] - 1.3, wr[1] - 5.3], 3, '#F8D664')
    circle(el, 10, '#8C97A4')
    circle(el, 4, '#5E6875')
    circle(wr, 7.5, '#2A2F36')
    line(wr, gp, 5.5, '#5E6875')
    const spread = holding ? Math.max(10, holding.def.w * 9) : chase ? 15 : 17.5
    line([gp[0] - spread - 3, gp[1]], [gp[0] + spread + 3, gp[1]], 6.5, '#2A2F36')
    if (holding) {
      const hb = itemBase(holding)
      holding.def.draw(hb[0], hb[1], hb[2])
    }
    line([gp[0] - spread, gp[1]], [gp[0] - spread, gp[1] + 26], 4.5, '#8C97A4')
    line([gp[0] + spread, gp[1]], [gp[0] + spread, gp[1] + 26], 4.5, '#8C97A4')
    // drop shadow marker under the gripper so you can tell where you are aiming
    const floorZ = overBox(fingertip.x, fingertip.y)
      ? BOX_H
      : fingertip.y > BELT_Y && fingertip.y < BELT_Y + BELT_D && fingertip.x > BELT_X0 && fingertip.x < BELT_X1
        ? BELT_Z
        : 0
    const aim = iso(fingertip.x, fingertip.y, floorZ)
    raw(
      `<ellipse cx="${n1(aim[0])}" cy="${n1(aim[1])}" rx="13" ry="6.5" fill="none" stroke="${holding && overBox(fingertip.x, fingertip.y) ? '#C2523C' : '#1C2128'}" stroke-width="2" opacity="${holding ? 0.7 : 0.25}" stroke-dasharray="4 3"/>`,
    )

    // name tags only for the item under the pointer or the one the arm is going for
    for (const it of items) if (it.mode === 'belt' && (it === hover || it === chase) && beltOpacity(it) > 0.05) tag(it, true)
    if (holding) tag(holding, true)

    if (navigating) {
      const bp = iso(BOX_X + BOX_SIZE / 2, BOX_Y + BOX_SIZE / 2, BOX_H + 3.2)
      const name = `→ ${navigating.item.def.name.toUpperCase()}`
      const tw = name.length * 9 + 36
      const s = Math.min(1, navigating.t / 0.25)
      raw(
        `<g opacity="${n1(s)}"><rect x="${n1(bp[0] - tw / 2)}" y="${n1(bp[1] - 24)}" width="${n1(tw)}" height="34" rx="17" fill="#1C2128"/>` +
          `<text x="${n1(bp[0])}" y="${n1(bp[1] - 2)}" text-anchor="middle" class="mono" font-size="13" font-weight="700" fill="#F8D664">${escapeXml(name)}</text></g>`,
      )
    }
    layerTop.innerHTML = finishLayer()
  }

  // ------------------------------------------------------------------ boot
  setIdleAnimations(!reduceMotion)
  layer('ws-back').innerHTML = drawBackLayer()
  layer('ws-mid').innerHTML = drawMiddleLayer()
  layer('ws-front').innerHTML = drawFrontLayer()

  // Only animate while the workshop is on screen.
  let last: number | null = null
  let visible = true
  let raf = 0
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting
  })
  io.observe(svg)
  /** One animation frame. `dt` is capped so a background tab does not make items jump. */
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
    timeouts.forEach((t) => window.clearTimeout(t))
    svg.removeEventListener('pointermove', onMove)
    svg.removeEventListener('pointerdown', onDown)
    svg.removeEventListener('pointerup', onUp)
    svg.removeEventListener('pointercancel', onCancel)
  }
}
