/*
 * The parts of the workshop that never move. They are drawn once, into two layers,
 * so the projects on the desk and the Microduck can slot between them:
 *
 *   back layer (room, desk, rug, track) → desk items → front layer (stools, bookcases, plant, cats) → Microduck
 */

import {
  DESK_BACK_LEN,
  DESK_D,
  DESK_LEFT_LEN,
  DESK_TOP,
  DESK_Z,
  ROOM_D,
  ROOM_W,
  RUG,
  TRACK_LEN,
  TRACK_W,
  WALL_H,
  WHITE,
  WOOD,
  iso,
  n1,
  trackAt,
  type Pt,
} from './geometry'
import { box, circle, finishLayer, line, onLeftWall, polygon, raw, rim, shadow, startLayer, sway } from './svg'

/** The pegboard hangs over the left arm of the desk, between these y positions. */
const PEG_Y0 = 4.1
const PEG_Y1 = 8.9
/** How far below its original height the pegboard (and the tools on it) hangs. */
const PEG_DROP = 1.25
const PEG_BOARD = '#F1E8D8'

/** A spot on the pegboard. `x` runs 1.0 to 5.8 along the board from its front end; `z` is height. */
function onBoard(x: number, z: number): Pt {
  return iso(0, PEG_Y1 + 1.0 - x, z - PEG_DROP)
}

/**
 * The tools hanging on the pegboard over the desk. Drawn twice: first as soft
 * gray outlines (`asShadow`), then for real on top, slightly offset.
 */
function drawTools(asShadow: boolean) {
  /** A point on a tool, nudged down and right when drawing its shadow. */
  const W = (x: number, z: number): Pt => {
    const p = onBoard(x, z)
    return asShadow ? [p[0] + 2, p[1] + 2.5] : p
  }
  /** The tool's color, or flat gray for the shadow pass. */
  const c = (color: string) => (asShadow ? '#D9CBB3' : color)
  const board = PEG_BOARD
  const peg = (x: number, z: number) => {
    if (!asShadow) circle(onBoard(x, z), 1.8, '#76818E')
  }
  // hammer
  peg(1.55, 7.6)
  line(W(1.55, 7.25), W(1.55, 5.55), 4.5, c('#B9844A'))
  line(W(1.55, 6.05), W(1.55, 5.55), 5.5, c('#3A414B'))
  line(W(1.25, 7.35), W(1.85, 7.35), 8, c('#5E6875'))
  line(W(1.25, 7.35), W(1.12, 7.15), 4, c('#5E6875'))
  // two screwdrivers
  for (const [x, handle, tip] of [
    [2.2, '#3B6FB6', 5.6],
    [2.65, '#C2523C', 5.95],
  ] as const) {
    peg(x, 7.6)
    line(W(x, 7.35), W(x, 6.75), 7, c(handle))
    line(W(x, 6.75), W(x, 6.6), 4, c('#A3ADB9'))
    line(W(x, 6.6), W(x, tip), 2, c('#A3ADB9'))
  }
  // wrench
  peg(3.25, 7.6)
  line(W(3.25, 7.15), W(3.25, 5.75), 4, c('#8C97A4'))
  circle(W(3.25, 7.3), 6, c('#8C97A4'))
  circle(W(3.25, 5.6), 4.5, c('#8C97A4'))
  if (!asShadow) {
    circle(W(3.25, 7.48), 2.6, board)
    circle(W(3.25, 5.6), 2, board)
  }
  // pliers
  peg(3.9, 7.6)
  line(W(3.9, 7.35), W(3.9, 6.7), 4, c('#5E6875'))
  line(W(3.86, 6.7), W(3.72, 5.65), 4, c('#F2BE22'))
  line(W(3.94, 6.7), W(4.08, 5.65), 4, c('#F2BE22'))
  circle(W(3.9, 6.72), 2.6, c('#3A414B'))
  // spool of solder wire
  peg(4.65, 7.6)
  raw(`<circle cx="${n1(W(4.65, 6.85)[0])}" cy="${n1(W(4.65, 6.85)[1])}" r="9" fill="none" stroke="${c('#C2523C')}" stroke-width="4"/>`)
  circle(W(4.65, 6.85), 3.5, c('#5E6875'))
  // tape measure
  peg(5.35, 7.6)
  polygon([W(5.12, 7.35), W(5.58, 7.35), W(5.58, 6.8), W(5.12, 6.8)], c('#F2BE22'))
  circle(W(5.35, 7.08), 3.2, c('#2A2F36'))
  line(W(5.58, 6.86), W(5.66, 6.86), 3, c('#A3ADB9'))
}

/** Book colors, picked in turn so neighboring books differ. */
const BOOKS = ['#7FA88C', '#E9C46A', '#D88C6A', '#9DB4CF', '#2A2F36', '#C9B79C', '#B79BC9', '#E07A5F', '#F2EDE4', '#5E8B6B', '#A3B8C8', '#E8D9B5']

/** A slightly darker version of a #RRGGBB color, for the shaded side of a book. */
function shade(hex: string, k: number) {
  const v = parseInt(hex.slice(1), 16)
  const c = (sh: number) => Math.round(((v >> sh) & 255) * k)
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, '0')}`
}

/**
 * An open white bookcase against a wall, its shelves packed with books. `along` says which
 * wall: 'x' for the back wall (it runs along x and opens toward +y), 'y' for the left wall
 * (runs along y, opens toward +x). It is drawn back to front like a real cabinet: back
 * panel, far side, then each shelf with its books, then the near side and the top.
 */
function drawBookcase(along: 'x' | 'y', start: number, len: number, seed: number) {
  const DEPTH = 1.25
  const H = 5.6
  const SIDE = 0.12
  const BOARD = 0.12
  const PLINTH = 0.25
  const TOP = 0.14
  const SHELVES = 4
  /** A box in bookcase space: `u` along the wall, `d` out from the wall, `z` up. */
  const lbox = (u0: number, d0: number, z0: number, lu: number, ld: number, h: number, top: string, front: string, side: string) => {
    if (along === 'y') box(d0, start + u0, z0, ld, lu, h, top, side, front)
    else box(start + u0, d0, z0, lu, ld, h, top, front, side)
  }
  if (along === 'y') shadow(0, start, DEPTH, len, 0.12)
  else shadow(start, 0, len, DEPTH, 0.12)

  lbox(0, 0, 0, len, 0.06, H, '#FFFFFF', '#E6E0D6', '#E6E0D6')
  lbox(0, 0, 0, SIDE, DEPTH, H, '#FFFFFF', '#FBFAF7', '#F1EDE6')
  const comp = (H - PLINTH - TOP - BOARD * (SHELVES - 1)) / SHELVES
  let k = seed * 5
  for (let sIdx = 0; sIdx < SHELVES; sIdx++) {
    const zb = sIdx === 0 ? 0 : PLINTH + sIdx * comp + (sIdx - 1) * BOARD
    const bh = sIdx === 0 ? PLINTH : BOARD
    lbox(SIDE, 0, zb, len - SIDE * 2, DEPTH, bh, '#F4F1EB', '#FFFFFF', '#F1EDE6')
    const z0 = zb + bh
    // books standing on this shelf, left to right, with the odd gap, a lying-down stack, or a little plant
    let u = SIDE + 0.04
    const end = len - SIDE - 0.04
    const plantHere = (sIdx + seed) % 4 === 1
    while (u < end - 0.12) {
      k++
      if (plantHere && u > len * 0.55) {
        const pu = Math.min(u + 0.35, end - 0.35)
        const [px, py] = along === 'y' ? [DEPTH * 0.55, start + pu] : [start + pu, DEPTH * 0.55]
        drawPottedPlant(px, py, z0, 0.42, 'small')
        break
      }
      if (k % 9 === 4) {
        // a short stack of books lying flat
        const sw = Math.min(0.7, end - u)
        for (let j = 0; j < 3; j++) {
          const c = BOOKS[(k + j * 3) % BOOKS.length]
          lbox(u + j * 0.03, 0.2, z0 + j * 0.13, sw - j * 0.06, DEPTH - 0.32, 0.13, shade(c, 1.08), c, shade(c, 0.8))
        }
        u += sw + 0.08
        continue
      }
      if (k % 11 === 7) {
        u += 0.25 // a gap
        continue
      }
      const w = 0.12 + ((k * 37) % 5) * 0.025
      if (u + w > end) break
      const h = comp * (0.62 + ((k * 53) % 6) * 0.06)
      const c = BOOKS[k % BOOKS.length]
      lbox(u, 0.15, z0, w, DEPTH - 0.24, h, shade(c, 1.1), c, shade(c, 0.78))
      u += w + 0.01
    }
  }
  lbox(len - SIDE, 0, 0, SIDE, DEPTH, H, '#FFFFFF', '#FBFAF7', '#ECE8E1')
  lbox(0, 0, H - TOP, len, DEPTH, TOP, '#FFFFFF', '#FBFAF7', '#ECE8E1')
}

/**
 * A white pot with broad, oval leaves fanning up out of it, centered on (x, y, z).
 * 'tall' is the big floor plant, 'small' a little one for a shelf or the top of a bookcase.
 */
function drawPottedPlant(x: number, y: number, z: number, s: number, kind: 'tall' | 'small') {
  const p = iso(x, y, z)
  const r = 17 * s
  const ph = (kind === 'tall' ? 30 : 24) * s
  raw(`<ellipse cx="${n1(p[0] + 3 * s)}" cy="${n1(p[1] + 2)}" rx="${n1(r * 1.25)}" ry="${n1(r * 0.55)}" fill="#1C2128" opacity="0.12"/>`)
  raw(
    `<path d="M${n1(p[0] - r)} ${n1(p[1] - ph)}L${n1(p[0] - r * 0.86)} ${n1(p[1])}A${n1(r * 0.86)} ${n1(r * 0.43)} 0 0 0 ${n1(p[0] + r * 0.86)} ${n1(p[1])}L${n1(p[0] + r)} ${n1(p[1] - ph)}Z" fill="#F4F1EA"/>` +
      `<path d="M${n1(p[0] + r * 0.15)} ${n1(p[1] - ph)}L${n1(p[0] + r * 0.15)} ${n1(p[1] + r * 0.42)}A${n1(r * 0.86)} ${n1(r * 0.43)} 0 0 0 ${n1(p[0] + r * 0.86)} ${n1(p[1])}L${n1(p[0] + r)} ${n1(p[1] - ph)}Z" fill="#E4DFD5"/>` +
      `<ellipse cx="${n1(p[0])}" cy="${n1(p[1] - ph)}" rx="${n1(r)}" ry="${n1(r * 0.5)}" fill="#ECE8E0"/>` +
      `<ellipse cx="${n1(p[0])}" cy="${n1(p[1] - ph + 1)}" rx="${n1(r * 0.82)}" ry="${n1(r * 0.38)}" fill="#6B4E35"/>`,
  )
  const base: Pt = [p[0], p[1] - ph]
  // [angle from straight up in degrees, length in px, color]
  const leaves: [number, number, string][] =
    kind === 'tall'
      ? [
          [-72, 52, '#8DB89A'],
          [70, 50, '#7FA88C'],
          [-48, 74, '#6E9E7E'],
          [44, 72, '#8DB89A'],
          [-22, 92, '#7FA88C'],
          [20, 88, '#6E9E7E'],
          [-2, 104, '#8DB89A'],
          [-35, 58, '#7FA88C'],
          [32, 56, '#7FA88C'],
        ]
      : [
          [-55, 40, '#8DB89A'],
          [50, 40, '#7FA88C'],
          [-20, 52, '#6E9E7E'],
          [18, 50, '#8DB89A'],
          [0, 44, '#7FA88C'],
        ]
  for (const [deg, len, c] of leaves) {
    const L = len * s
    const a = (deg * Math.PI) / 180
    const dx = Math.sin(a)
    const dy = -Math.cos(a)
    const stemEnd: Pt = [base[0] + dx * L * 0.42, base[1] + dy * L * 0.42]
    const mid: Pt = [base[0] + dx * L * 0.7, base[1] + dy * L * 0.7]
    const tipP: Pt = [base[0] + dx * L, base[1] + dy * L]
    const rot = deg - 90
    line(base, stemEnd, Math.max(1.5, 2.2 * s), '#5E8B6B')
    raw(
      `<ellipse cx="${n1(mid[0])}" cy="${n1(mid[1])}" rx="${n1(L * 0.31)}" ry="${n1(L * 0.13)}" transform="rotate(${n1(rot)} ${n1(mid[0])} ${n1(mid[1])})" fill="${c}"/>`,
    )
    line(stemEnd, tipP, 1, '#5E8B6B', 0.45)
  }
}

/** A round wooden stool at (x, y). */
function drawStool(x: number, y: number) {
  const SEAT = 1.75
  const ground = iso(x, y, 0)
  raw(`<ellipse cx="${n1(ground[0])}" cy="${n1(ground[1] + 2)}" rx="26" ry="12" fill="#1C2128" opacity="0.1"/>`)
  for (const [lx, ly] of [
    [-0.32, -0.1],
    [0.3, -0.25],
    [0.05, 0.36],
  ])
    line(iso(x + lx * 0.7, y + ly * 0.7, SEAT - 0.1), iso(x + lx, y + ly, 0), 3.5, '#B5855A')
  const top = iso(x, y, SEAT)
  const rx = 0.55 * 28 * 0.866 * 1.414
  const ry = rx / 1.732
  raw(
    `<path d="M${n1(top[0] - rx)} ${n1(top[1])}v6a${n1(rx)} ${n1(ry)} 0 0 0 ${n1(rx * 2)} 0v-6z" fill="${WOOD[1]}"/>` +
      `<ellipse cx="${n1(top[0])}" cy="${n1(top[1])}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${WOOD[0]}"/>`,
  )
}

/** Three drawers on the front face of a cabinet. `face(u, z)` is a point on that face. */
function drawDrawers(face: (u: number, z: number) => Pt, w: number, h: number) {
  for (let d = 1; d < 3; d++) line(face(0.08, (h * d) / 3), face(w - 0.08, (h * d) / 3), 1.5, '#D5CFC3')
  for (let d = 0; d < 3; d++) line(face(w / 2 - 0.25, (h * (d + 0.62)) / 3), face(w / 2 + 0.25, (h * (d + 0.62)) / 3), 3, WOOD[2])
}

/** The rug, and the Microduck's oval track on it. */
function drawRugAndTrack() {
  const { x0, y0, x1, y1 } = RUG
  polygon([iso(x0, y0, 0), iso(x1, y0, 0), iso(x1, y1, 0), iso(x0, y1, 0)], '#E8DCC7')
  polygon([iso(x0 + 0.3, y0 + 0.3, 0), iso(x1 - 0.3, y0 + 0.3, 0), iso(x1 - 0.3, y1 - 0.3, 0), iso(x0 + 0.3, y1 - 0.3, 0)], '#F1E9DB')
  const inset = [iso(x0 + 0.55, y0 + 0.55, 0), iso(x1 - 0.55, y0 + 0.55, 0), iso(x1 - 0.55, y1 - 0.55, 0), iso(x0 + 0.55, y1 - 0.55, 0)]
  raw(`<path d="M${inset.map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L')}Z" fill="none" stroke="#DCCBAE" stroke-width="2"/>`)

  const ring = (off: number) => {
    const pts: Pt[] = []
    for (let i = 0; i < 96; i++) {
      const p = trackAt((i / 96) * TRACK_LEN, off)
      pts.push(iso(p.x, p.y, 0))
    }
    return pts
  }
  const d = (pts: Pt[]) => `M${pts.map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L')}Z`
  const half = TRACK_W / 2
  // red and white curbs, then the asphalt, then the dashed center line
  raw(`<path d="${d(ring(half + 0.14))}${d(ring(-half - 0.14).reverse())}" fill="#FFFFFF" fill-rule="evenodd"/>`)
  raw(`<path d="${d(ring(half + 0.07))}" fill="none" stroke="#D2553F" stroke-width="5" stroke-dasharray="6 6"/>`)
  raw(`<path d="${d(ring(-half - 0.07))}" fill="none" stroke="#D2553F" stroke-width="5" stroke-dasharray="6 6"/>`)
  raw(`<path d="${d(ring(half))}${d(ring(-half).reverse())}" fill="#53565C" fill-rule="evenodd"/>`)
  raw(`<path d="${d(ring(0))}" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-dasharray="7 7" opacity="0.85"/>`)
  // checkered start line across the back straight
  const sx = 9.6
  const sy0 = 10.9 - 2.45 - half
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 2; j++) {
      const yy = sy0 + (i * TRACK_W) / 4
      const xx = sx + j * 0.22
      polygon(
        [iso(xx, yy, 0), iso(xx + 0.22, yy, 0), iso(xx + 0.22, yy + TRACK_W / 4, 0), iso(xx, yy + TRACK_W / 4, 0)],
        (i + j) % 2 ? '#1C2128' : '#FFFFFF',
      )
    }
}

/** A little traffic cone at (x, y). */
function drawCone(x: number, y: number) {
  const b = iso(x, y, 0)
  const t = iso(x, y, 0.75)
  raw(
    `<path d="M${n1(b[0] - 9)} ${n1(b[1])}l9 4l9 -4l-9 -4z" fill="#E8DCC7" stroke="#D2553F" stroke-width="2"/>` +
      `<path d="M${n1(b[0] - 6)} ${n1(b[1] - 1)}L${n1(t[0] - 1.2)} ${n1(t[1])}L${n1(t[0] + 1.2)} ${n1(t[1])}L${n1(b[0] + 6)} ${n1(b[1] - 1)}Z" fill="#EE7A3A"/>` +
      `<path d="M${n1(b[0] - 4)} ${n1(b[1] - 8)}L${n1(b[0] + 4)} ${n1(b[1] - 8)}L${n1(b[0] + 3)} ${n1(b[1] - 11)}L${n1(b[0] - 3)} ${n1(b[1] - 11)}Z" fill="#FFFFFF"/>`,
  )
}

/** The room behind everything else: walls, floor, window, poster, clock, pegboard, rug, track and the desk. */
export function drawBackLayer() {
  startLayer()
  const T = 0.45 // wall thickness
  const D = 0.9 // floor slab depth
  // walls: the inner faces, an L-shaped white cap, and cut ends down to the bottom of the floor slab
  polygon([iso(0, 0, 0), iso(ROOM_W, 0, 0), iso(ROOM_W, 0, WALL_H), iso(0, 0, WALL_H)], '#EAE6DF')
  polygon([iso(0, 0, 0), iso(0, ROOM_D, 0), iso(0, ROOM_D, WALL_H), iso(0, 0, WALL_H)], '#F1EEE8')
  polygon(
    [iso(-T, -T, WALL_H), iso(ROOM_W, -T, WALL_H), iso(ROOM_W, 0, WALL_H), iso(0, 0, WALL_H), iso(0, ROOM_D, WALL_H), iso(-T, ROOM_D, WALL_H)],
    '#FDFCFA',
  )
  polygon([iso(ROOM_W, -T, -D), iso(ROOM_W, 0, -D), iso(ROOM_W, 0, WALL_H), iso(ROOM_W, -T, WALL_H)], '#E2DDD4')
  polygon([iso(-T, ROOM_D, -D), iso(0, ROOM_D, -D), iso(0, ROOM_D, WALL_H), iso(-T, ROOM_D, WALL_H)], '#D9D3C9')
  // floor slab and its planks
  box(0, 0, -D, ROOM_W, ROOM_D, D, '#F7F5F0', '#DED8CE', '#E6E1D8')
  for (let g = 1.3; g < ROOM_D; g += 1.3) line(iso(0, g, 0), iso(ROOM_W, g, 0), 1, '#E6E1D8')
  for (let g = 1.3, k = 0; g < ROOM_D; g += 1.3, k++) {
    const jx = 2.5 + ((k * 4.7) % 11)
    line(iso(jx, g - 1.3, 0), iso(jx, g, 0), 1, '#E6E1D8')
  }
  // baseboards
  polygon([iso(0, 0, 0), iso(ROOM_W, 0, 0), iso(ROOM_W, 0, 0.35), iso(0, 0, 0.35)], '#FBFAF7')
  polygon([iso(0, 0, 0), iso(0, ROOM_D, 0), iso(0, ROOM_D, 0.35), iso(0, 0, 0.35)], '#FBFAF7')

  // window over the back arm of the desk, with a glint of light
  const WX0 = 4.4
  const WX1 = 9.7
  const WZ0 = 4.1
  const WZ1 = 7.9
  polygon([iso(WX0, 0, WZ0), iso(WX1, 0, WZ0), iso(WX1, 0, WZ1), iso(WX0, 0, WZ1)], '#FFFFFF')
  polygon([iso(WX0 + 0.25, 0, WZ0 + 0.25), iso(WX1 - 0.25, 0, WZ0 + 0.25), iso(WX1 - 0.25, 0, WZ1 - 0.25), iso(WX0 + 0.25, 0, WZ1 - 0.25)], '#D9E6EE')
  polygon([iso(WX0 + 0.6, 0, WZ0 + 0.6), iso(WX0 + 2.0, 0, WZ1 - 0.3), iso(WX0 + 2.6, 0, WZ1 - 0.3), iso(WX0 + 1.2, 0, WZ0 + 0.6)], '#FFFFFF', 0.55)
  polygon([iso(WX0 + 2.4, 0, WZ0 + 0.3), iso(WX0 + 3.2, 0, WZ0 + 1.6), iso(WX0 + 3.5, 0, WZ0 + 1.6), iso(WX0 + 2.7, 0, WZ0 + 0.3)], '#FFFFFF', 0.4)
  line(iso((WX0 + WX1) / 2, 0, WZ0 + 0.25), iso((WX0 + WX1) / 2, 0, WZ1 - 0.25), 4, '#FFFFFF')
  line(iso(WX0 + 0.25, 0, (WZ0 + WZ1) / 2), iso(WX1 - 0.25, 0, (WZ0 + WZ1) / 2), 4, '#FFFFFF')
  box(WX0 - 0.2, 0, WZ0 - 0.2, WX1 - WX0 + 0.4, 0.45, 0.2, '#FFFFFF', '#EEEBE5', '#E2DDD4')

  // framed poster right of the window
  const poster = (u: number, z: number) => iso(10.6 + u, 0, z)
  polygon([poster(0, 4.7), poster(1.3, 4.7), poster(1.3, 7.1), poster(0, 7.1)], '#2A2F36')
  polygon([poster(0.1, 4.8), poster(1.2, 4.8), poster(1.2, 7.0), poster(0.1, 7.0)], '#FBFAF7')
  const pc = poster(0.65, 6.25)
  raw(`<ellipse cx="${n1(pc[0])}" cy="${n1(pc[1])}" rx="11" ry="13" transform="rotate(-30 ${n1(pc[0])} ${n1(pc[1])})" fill="#E07A5F"/>`)
  line(poster(0.3, 5.3), poster(1.0, 5.3), 1.5, '#2A2F36')
  line(poster(0.3, 5.1), poster(0.8, 5.1), 1.5, '#2A2F36')

  // cat clock on the left wall, between the pegboard and the corner, tail swinging like a pendulum
  onLeftWall(
    iso(0, 2.0, 5.9),
    `<g transform="scale(1.15)">` +
      `<g id="clock-pendulum"><path d="M0 12Q6 22 1 30Q-2 34 3 36" stroke="#F2BE22" stroke-width="4" fill="none" stroke-linecap="round"/>${sway(0, 12, 14, 2)}</g>` +
      `<path d="M-14 -9L-13 -25L-2 -16Z" fill="#F2BE22"/><path d="M14 -9L13 -25L2 -16Z" fill="#F2BE22"/>` +
      `<path d="M-11.5 -12L-11 -21L-5 -16Z" fill="#F2A07B"/><path d="M11.5 -12L11 -21L5 -16Z" fill="#F2A07B"/>` +
      `<circle r="17" fill="#F2BE22"/><circle r="13.5" fill="#FFFFFF"/>` +
      `<path d="M-15 2l-9-1.5M-15 5l-9 1.5M15 2l9-1.5M15 5l9 1.5" stroke="#3A414B" stroke-width="1" stroke-linecap="round"/>` +
      `<circle cx="0" cy="-10.5" r="1.2" fill="#A3ADB9"/><circle cx="10.5" cy="0" r="1.2" fill="#A3ADB9"/>` +
      `<circle cx="0" cy="10.5" r="1.2" fill="#A3ADB9"/><circle cx="-10.5" cy="0" r="1.2" fill="#A3ADB9"/>` +
      `<path d="M-7.5 -4q2-2.4 4 0M3.5 -4q2-2.4 4 0" stroke="#2A2F36" stroke-width="1.3" fill="none" stroke-linecap="round"/>` +
      `<circle cx="-7" cy="4" r="2.1" fill="#F2A07B" opacity="0.7"/><circle cx="7" cy="4" r="2.1" fill="#F2A07B" opacity="0.7"/>` +
      `<path d="M0 0V-8" stroke="#2A2F36" stroke-width="2.2" stroke-linecap="round"/>` +
      `<path d="M0 0L6.5 3" stroke="#C2523C" stroke-width="1.6" stroke-linecap="round"/>` +
      `<circle r="1.7" fill="#2A2F36"/></g>`,
  )
  // pegboard over the left arm of the desk, with tools hanging on it
  polygon(
    [iso(0, PEG_Y0 - 0.15, 5.15 - PEG_DROP), iso(0, PEG_Y1 + 0.15, 5.15 - PEG_DROP), iso(0, PEG_Y1 + 0.15, 8.05 - PEG_DROP), iso(0, PEG_Y0 - 0.15, 8.05 - PEG_DROP)],
    '#DCCBAE',
  )
  polygon([iso(0, PEG_Y0, 5.3 - PEG_DROP), iso(0, PEG_Y1, 5.3 - PEG_DROP), iso(0, PEG_Y1, 7.9 - PEG_DROP), iso(0, PEG_Y0, 7.9 - PEG_DROP)], PEG_BOARD)
  for (let px = 1.3; px < 5.6; px += 0.5) for (let pz = 5.55; pz < 7.8; pz += 0.5) circle(onBoard(px, pz), 1.2, '#E0D2BA')
  drawTools(true)
  drawTools(false)

  drawRugAndTrack()
  drawCone(5.1, 8.1)
  drawCone(14.6, 13.8)

  // the L-shaped desk: back arm first, then the left arm in front of it
  const LEG = DESK_Z - DESK_TOP
  shadow(0, 0, DESK_BACK_LEN, DESK_D, 0.1)
  box(9.3, 0.15, 0, 1.9, 1.9, LEG, WHITE[0], WHITE[1], WHITE[2])
  drawDrawers((u, z) => iso(9.3 + u, 2.05, z), 1.9, LEG)
  box(5.6, 1.85, 0, 0.18, 0.18, LEG, WOOD[0], WOOD[1], WOOD[2])
  box(1.95, 1.85, 0, 0.18, 0.18, LEG, WOOD[0], WOOD[1], WOOD[2])
  box(0, 0, LEG, DESK_BACK_LEN, DESK_D, DESK_TOP, WOOD[0], WOOD[1], WOOD[2])
  rim(0, 0, DESK_Z, DESK_BACK_LEN, DESK_D)

  shadow(0, DESK_D, DESK_D, DESK_LEFT_LEN - DESK_D, 0.1)
  box(1.85, 5.6, 0, 0.18, 0.18, LEG, WOOD[0], WOOD[1], WOOD[2])
  box(0.15, DESK_LEFT_LEN - 2.05, 0, 1.9, 1.9, LEG, WHITE[0], WHITE[2], WHITE[1])
  drawDrawers((u, z) => iso(2.05, DESK_LEFT_LEN - 2.05 + u, z), 1.9, LEG)
  box(0, DESK_D, LEG, DESK_D, DESK_LEFT_LEN - DESK_D, DESK_TOP, WOOD[0], WOOD[2], WOOD[1])
  rim(0, DESK_D, DESK_Z, DESK_D, DESK_LEFT_LEN - DESK_D)
  return finishLayer()
}

/** Drawn in front of the desk items: stools, the two bookcases and the plant on top of one. */
export function drawFrontLayer() {
  startLayer()
  drawStool(4.6, 4.5)
  drawStool(7.6, 3.9)
  drawBookcase('x', 13.1, ROOM_W - 13.1 - 0.05, 2)
  drawPottedPlant(14.6, 0.65, 5.6, 0.8, 'small')
  drawBookcase('y', 11.0, ROOM_D - 11.0 - 0.05, 0)
  return finishLayer()
}

/** Where the big floor plant stands. The duck is drawn in front of it or behind it depending on which is nearer. */
export const FLOOR_PLANT: [number, number] = [2.5, 14.7]

/** The big floor plant by the left bookcase, in its own layer. */
export function drawPlantLayer() {
  startLayer()
  drawPottedPlant(FLOOR_PLANT[0], FLOOR_PLANT[1], 0, 1.15, 'tall')
  return finishLayer()
}
