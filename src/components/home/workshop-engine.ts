/*
 * SOBJO workshop: the playable hero on the home page.
 *
 * The arm follows the pointer. Press on (or tap) an item riding the belt to
 * pick it up, then release (or tap again) over the cardboard box. Whatever
 * lands in the box takes you to its page.
 *
 * Everything is drawn into the <svg> in isometric space: iso(x, y, z) maps
 * workshop units to SVG pixels. The static layers are drawn once; the arm,
 * the belt and the items are redrawn every frame as SVG strings, which is far
 * cheaper than reconciling a few hundred React elements at 60fps.
 */

type Pt = [number, number]
type Vec3 = [number, number, number]

export interface WorkshopItemDef {
  id: string
  name: string
  href: string
  w: number
  d: number
  h: number
  draw: (x: number, y: number, z: number) => void
}

export interface WorkshopOptions {
  /** Called once an item lands in the box. */
  onSorted: (href: string) => void
  /** Live region for screen reader announcements. */
  status?: HTMLElement | null
}

// ------------------------------------------------------------------ geometry
const CX = 960
const CY = 300
const S = 28
const KX = S * 0.866
const KY = S * 0.5
function iso(x: number, y: number, z: number): Pt {
  return [CX + (x - y) * KX, CY + (x + y) * KY - z * S]
}
// screen point -> ground point on the horizontal plane at height z
function unproject(sx: number, sy: number, z: number) {
  const a = (sx - CX) / KX
  const b = (sy - CY + z * S) / KY
  return { x: (a + b) / 2, y: (b - a) / 2 }
}
function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v
}
function n1(v: number) {
  return (Math.round(v * 10) / 10).toString()
}

const RW = 17 // room: a square floor, RW wide (x) and RD deep (y)
const RD = 17
const BY = 6.0 // belt: y range and depth
const BD = 2.8
const BELT_X0 = 2.4
const BELT_X1 = 11.6
const BELT_Z = 2.6
const BX = BELT_X1 + 0.6 // cardboard box, just past the chute
const BYb = 5.8
const BW = 3.4
const BH = 2.3
// The arm stands just behind the belt. Seen from this angle "behind" also shifts it right, so it
// sits a little left of the belt's middle to look centered on it.
const SHOULDER: Vec3 = [(BELT_X0 + BELT_X1) / 2 - 1.0, 4.4, 1.75]
const L1 = 4.9
const L2 = 6.2
const REACH = 10 // how far from the shoulder (across the floor) the fingertips can go
const HOVER_Z = 4.4 // fingertip height when empty
const GRIP_OFFSET = 1.4 // fingertip -> wrist
const PALM_OFFSET = 0.9 // fingertip -> palm bar
const GRAY = ['#A3ADB9', '#8C97A4', '#76818E']
const YEL = ['#F8D664', '#F2BE22', '#D9A40F']

// ------------------------------------------------------------------ drawing helpers
let buf: string[] = []
function op(o?: number | null) {
  return o != null && o !== 1 ? ` opacity="${o}"` : ''
}
function P(pts: Pt[], fill: string, o?: number | null, fx?: string) {
  buf.push(
    `<path d="M${pts.map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L')}Z" fill="${fill}"${op(o)}${fx ? ` filter="${fx}"` : ''}/>`,
  )
}
function L(a: Pt, b: Pt, w: number, c: string, o?: number | null, dash?: string) {
  buf.push(
    `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${op(o)}${dash ? ` stroke-dasharray="${dash}"` : ''}/>`,
  )
}
function C(p: Pt, r: number, fill: string, o?: number | null) {
  buf.push(`<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${r}" fill="${fill}"${op(o)}/>`)
}
function raw(s: string) {
  buf.push(s)
}
function box(x: number, y: number, z: number, w: number, d: number, h: number, top: string, left: string, right: string) {
  P([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)], right)
  P([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)], left)
  P([iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)], top)
}
function shadow(x: number, y: number, w: number, d: number, o?: number) {
  P(
    [iso(x - 0.3, y - 0.1, 0), iso(x + w + 0.4, y - 0.1, 0), iso(x + w + 0.4, y + d + 0.5, 0), iso(x - 0.3, y + d + 0.5, 0)],
    '#1C2128',
    o || 0.14,
    'url(#sh-cs)',
  )
}
function rim(x: number, y: number, z: number, w: number, d: number) {
  L(iso(x, y + d, z), iso(x + w, y + d, z), 1.5, '#FFFFFF', 0.45)
  L(iso(x + w, y, z), iso(x + w, y + d, z), 1.5, '#FFFFFF', 0.3)
}
function esc(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
}
function wallText(p: Pt, txt: string, size: number, fill: string, cls: string) {
  raw(
    `<text transform="matrix(0.866 0.5 0 1 ${n1(p[0])} ${n1(p[1])})" class="${cls}" font-size="${size}" font-weight="700" fill="${fill}">${esc(txt)}</text>`,
  )
}
/** SVG drawn flat on the left wall (x runs toward the back of the room, y down), with its origin at `p`. */
function onLeftWall(p: Pt, svg: string) {
  raw(`<g transform="matrix(0.866 -0.5 0 1 ${n1(p[0])} ${n1(p[1])})">${svg}</g>`)
}
/** Idle animations (tails, the clock's pendulum); off when the visitor prefers reduced motion. */
let animate = true
function sway(cx: number, cy: number, deg: number, dur: number) {
  if (!animate) return ''
  return `<animateTransform attributeName="transform" type="rotate" values="${-deg} ${cx} ${cy};${deg} ${cx} ${cy};${-deg} ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>`
}

function heart(p: Pt, s: number, col: string, o?: number) {
  raw(
    `<path d="M${n1(p[0])} ${n1(p[1] + 6 * s)}l${n1(-8 * s)} ${n1(-7 * s)}c${n1(-5 * s)} ${n1(-5 * s)} ${n1(2 * s)} ${n1(-11 * s)} ${n1(8 * s)} ${n1(-5 * s)}c${n1(6 * s)} ${n1(-6 * s)} ${n1(13 * s)} 0 ${n1(8 * s)} ${n1(5 * s)}z" fill="${col}"${op(o)}/>`,
  )
}

// ------------------------------------------------------------------ static layers
const PEG_Y0 = 10.6 // pegboard and desk sit on the front half of the left wall
const PEG_Y1 = 15.4
/**
 * The tools on the pegboard over the desk, on the left wall. `x` runs 1.0 to 5.8 along the board
 * from its front end. Drawn twice: first as soft outlines (`shadow`), then for real.
 */
function onBoard(x: number, z: number): Pt {
  return iso(0, PEG_Y1 + 1.0 - x, z)
}
function drawTools(shadow: boolean) {
  const W = (x: number, z: number): Pt => {
    const p = onBoard(x, z)
    return shadow ? [p[0] + 2, p[1] + 2.5] : p
  }
  const c = (color: string) => (shadow ? '#C3CCD6' : color)
  const board = '#E9EEF5'
  const peg = (x: number, z: number) => {
    if (!shadow) C(onBoard(x, z), 1.8, '#76818E')
  }
  // hammer
  peg(1.55, 7.6)
  L(W(1.55, 7.25), W(1.55, 5.55), 4.5, c('#B9844A'))
  L(W(1.55, 6.05), W(1.55, 5.55), 5.5, c('#3A414B'))
  L(W(1.25, 7.35), W(1.85, 7.35), 8, c('#5E6875'))
  L(W(1.25, 7.35), W(1.12, 7.15), 4, c('#5E6875'))
  // two screwdrivers
  for (const [x, handle, tip] of [
    [2.2, '#3B6FB6', 5.6],
    [2.65, '#C2523C', 5.95],
  ] as const) {
    peg(x, 7.6)
    L(W(x, 7.35), W(x, 6.75), 7, c(handle))
    L(W(x, 6.75), W(x, 6.6), 4, c('#A3ADB9'))
    L(W(x, 6.6), W(x, tip), 2, c('#A3ADB9'))
  }
  // wrench
  peg(3.25, 7.6)
  L(W(3.25, 7.15), W(3.25, 5.75), 4, c('#8C97A4'))
  C(W(3.25, 7.3), 6, c('#8C97A4'))
  C(W(3.25, 5.6), 4.5, c('#8C97A4'))
  if (!shadow) {
    C(W(3.25, 7.48), 2.6, board)
    C(W(3.25, 5.6), 2, board)
  }
  // pliers
  peg(3.9, 7.6)
  L(W(3.9, 7.35), W(3.9, 6.7), 4, c('#5E6875'))
  L(W(3.86, 6.7), W(3.72, 5.65), 4, c('#F2BE22'))
  L(W(3.94, 6.7), W(4.08, 5.65), 4, c('#F2BE22'))
  C(W(3.9, 6.72), 2.6, c('#3A414B'))
  // spool of solder wire
  peg(4.65, 7.6)
  raw(`<circle cx="${n1(W(4.65, 6.85)[0])}" cy="${n1(W(4.65, 6.85)[1])}" r="9" fill="none" stroke="${c('#C2523C')}" stroke-width="4"/>`)
  C(W(4.65, 6.85), 3.5, c('#5E6875'))
  // tape measure
  peg(5.35, 7.6)
  P([W(5.12, 7.35), W(5.58, 7.35), W(5.58, 6.8), W(5.12, 6.8)], c('#F2BE22'))
  C(W(5.35, 7.08), 3.2, c('#2A2F36'))
  L(W(5.58, 6.86), W(5.66, 6.86), 3, c('#A3ADB9'))
}

/** A sitting orange tabby, eyes closed, tail swaying. `p` is where she sits. */
function drawOrangeCat(p: Pt) {
  raw(
    `<g transform="translate(${n1(p[0])} ${n1(p[1])}) scale(1.4)">` +
      `<ellipse cx="2" cy="0" rx="20" ry="5.5" fill="#1C2128" opacity="0.13"/>` +
      `<g id="orange-cat-tail"><path d="M10 -3C24 -2 27 -14 19 -21" fill="none" stroke="#E8913A" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M21.5 -16C21 -19 20 -20 19 -21" fill="none" stroke="#C46A1E" stroke-width="5" stroke-linecap="round"/>${sway(10, -3, 9, 2.8)}</g>` +
      `<path d="M-12 -2C-14 -16 -9 -27 0 -27C9 -27 14 -16 12 -2Z" fill="#E8913A"/>` +
      `<path d="M-6 -3C-7 -12 -4 -19 0 -19C4 -19 7 -12 6 -3Z" fill="#F7D3A6"/>` +
      `<path d="M8 -20q4 2 5 6M10 -12q3 2 3 6M-8 -20q-4 2 -5 6M-10 -12q-3 2 -3 6" stroke="#C46A1E" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="-4" cy="-1.5" rx="3.6" ry="2.4" fill="#F7D3A6"/><ellipse cx="4" cy="-1.5" rx="3.6" ry="2.4" fill="#F7D3A6"/>` +
      `<path d="M-10.5 -37L-9.5 -50L-2 -44Z" fill="#E8913A"/><path d="M10.5 -37L9.5 -50L2 -44Z" fill="#E8913A"/>` +
      `<path d="M-8.4 -40L-7.9 -47L-3.8 -43.8Z" fill="#F2A07B"/><path d="M8.4 -40L7.9 -47L3.8 -43.8Z" fill="#F2A07B"/>` +
      `<circle cx="0" cy="-34" r="11" fill="#E8913A"/>` +
      `<path d="M-3 -44v4M0 -45v5M3 -44v4" stroke="#C46A1E" stroke-width="1.6" stroke-linecap="round"/>` +
      `<ellipse cx="0" cy="-30" rx="5.5" ry="3.6" fill="#F7D3A6"/>` +
      `<path d="M-6.8 -35q2 -2.4 4 0M2.8 -35q2 -2.4 4 0" stroke="#2A2F36" stroke-width="1.5" fill="none" stroke-linecap="round"/>` +
      `<circle cx="-7" cy="-31" r="1.8" fill="#F2A07B" opacity="0.75"/><circle cx="7" cy="-31" r="1.8" fill="#F2A07B" opacity="0.75"/>` +
      `<path d="M-1.4 -32.2h2.8l-1.4 1.6z" fill="#D9665A"/>` +
      `<path d="M-2 -29.6q1 1 2 0q1 1 2 0" stroke="#2A2F36" stroke-width="1" fill="none" stroke-linecap="round"/>` +
      `<path d="M-6 -30.5l-8 -1.2M-6 -29.3l-8 1.6M6 -30.5l8 -1.2M6 -29.3l8 1.6" stroke="#C46A1E" stroke-width="0.8" stroke-linecap="round"/>` +
      `</g>`,
  )
}

/** A brown tabby with a white tummy, chin and paws, lying in a loaf. `p` is where she lies. */
function drawBrownCat(p: Pt) {
  raw(
    `<g transform="translate(${n1(p[0])} ${n1(p[1])}) scale(1.4)">` +
      `<ellipse cx="0" cy="0" rx="28" ry="6" fill="#1C2128" opacity="0.13"/>` +
      `<g id="brown-cat-tail"><path d="M-20 -5C-31 -1 -24 6 -7 4" fill="none" stroke="#9B7656" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M-13 5C-10 4.6 -8.5 4.3 -7 4" fill="none" stroke="#5E4330" stroke-width="5" stroke-linecap="round"/>${sway(-20, -5, 5, 3.6)}</g>` +
      `<ellipse cx="-2" cy="-9" rx="22" ry="10" fill="#F7F4EF"/>` +
      `<path d="M-24 -10C-22 -23 18 -23 20 -10C12 -7 6 -11 -2 -9C-10 -7 -16 -11 -24 -10Z" fill="#9B7656"/>` +
      `<path d="M-13 -18q2 4 0 7M-5 -19.5q2 4 0 7M3 -19q2 4 0 6.5" stroke="#5E4330" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="12" cy="-1.6" rx="4" ry="2.5" fill="#FFFFFF"/><ellipse cx="20" cy="-1.6" rx="4" ry="2.5" fill="#FFFFFF"/>` +
      `<path d="M10 -21L11 -32L17 -26Z" fill="#9B7656"/><path d="M26 -21L25 -32L19 -26Z" fill="#9B7656"/>` +
      `<path d="M11.8 -23.5L12.3 -29L15.6 -25.6Z" fill="#F2A07B"/><path d="M24.2 -23.5L23.7 -29L20.4 -25.6Z" fill="#F2A07B"/>` +
      `<circle cx="18" cy="-17" r="10" fill="#9B7656"/>` +
      `<path d="M14.5 -25.5v3M21.5 -25.5v3" stroke="#5E4330" stroke-width="1.5" stroke-linecap="round"/>` +
      `<path d="M16.6 -15L18 -25.5L19.4 -15Z" fill="#F7F4EF"/>` +
      `<path d="M10.2 -14C12 -6 24 -6 25.8 -14C23 -11 20.5 -15 18 -13C15.5 -15 13 -11 10.2 -14Z" fill="#F7F4EF"/>` +
      `<circle cx="14.4" cy="-18" r="1.9" fill="#2A2F36"/><circle cx="21.6" cy="-18" r="1.9" fill="#2A2F36"/>` +
      `<circle cx="15" cy="-18.6" r="0.6" fill="#FFFFFF"/><circle cx="22.2" cy="-18.6" r="0.6" fill="#FFFFFF"/>` +
      `<circle cx="12.4" cy="-14" r="1.6" fill="#F2A07B" opacity="0.65"/><circle cx="23.6" cy="-14" r="1.6" fill="#F2A07B" opacity="0.65"/>` +
      `<path d="M16.8 -14.6h2.4l-1.2 1.4z" fill="#D9665A"/>` +
      `<path d="M16.6 -12.5q.7 .8 1.4 0q.7 .8 1.4 0" stroke="#2A2F36" stroke-width="0.9" fill="none" stroke-linecap="round"/>` +
      `<path d="M11.5 -13.5l-7 -0.6M11.5 -12.4l-7 1.6M24.5 -13.5l7 -0.6M24.5 -12.4l7 1.6" stroke="#A3ADB9" stroke-width="0.8" stroke-linecap="round"/>` +
      `</g>`,
  )
}

function drawBack() {
  buf = []
  const H = 10 // wall height
  const T = 0.6 // wall thickness
  const D = 1.2 // floor slab depth
  // Walls: the inner faces, one L-shaped cap so the corner has no seam, and cut ends that run down
  // to the bottom of the floor slab so they line up with its sides.
  P([iso(0, 0, 0), iso(RW, 0, 0), iso(RW, 0, H), iso(0, 0, H)], '#DCE3EA')
  P([iso(0, 0, 0), iso(0, RD, 0), iso(0, RD, H), iso(0, 0, H)], '#D0D8E1')
  P([iso(-T, -T, H), iso(RW, -T, H), iso(RW, 0, H), iso(0, 0, H), iso(0, RD, H), iso(-T, RD, H)], '#8C97A4')
  P([iso(RW, -T, -D), iso(RW, 0, -D), iso(RW, 0, H), iso(RW, -T, H)], '#C9D2DC')
  P([iso(-T, RD, -D), iso(0, RD, -D), iso(0, RD, H), iso(-T, RD, H)], '#B5BFCB')
  // floor slab
  box(0, 0, -D, RW, RD, D, '#EEF2F5', '#B5BFCB', '#C9D2DC')
  for (let g = 2; g < RW; g += 2) L(iso(g, 0, 0), iso(g, RD, 0), 1, '#DCE3EA')
  for (let g = 2; g < RD; g += 2) L(iso(0, g, 0), iso(RW, g, 0), 1, '#DCE3EA')
  // baseboards
  P([iso(0, 0, 0), iso(RW, 0, 0), iso(RW, 0, 0.5), iso(0, 0, 0.5)], '#C3CCD6')
  P([iso(0, 0, 0), iso(0, RD, 0), iso(0, RD, 0.5), iso(0, 0, 0.5)], '#A3ADB9')

  // window, a sill deep enough for the plant, and light on the floor
  P([iso(8.3, 0, 4.6), iso(13.8, 0, 4.6), iso(13.8, 0, 8.4), iso(8.3, 0, 8.4)], '#FFFFFF')
  P([iso(8.6, 0, 4.9), iso(13.5, 0, 4.9), iso(13.5, 0, 8.1), iso(8.6, 0, 8.1)], '#A9D4F5')
  P([iso(8.9, 0, 5.6), iso(10.5, 0, 7.8), iso(10.9, 0, 7.8), iso(9.3, 0, 5.6)], '#FFFFFF', 0.5)
  L(iso(11.05, 0, 4.9), iso(11.05, 0, 8.1), 3, '#FFFFFF')
  L(iso(8.6, 0, 6.5), iso(13.5, 0, 6.5), 3, '#FFFFFF')
  box(8.1, 0, 4.4, 5.9, 0.9, 0.2, '#FFFFFF', '#E6ECF2', '#DCE3EA')
  P([iso(9.0, 0.6, 0.01), iso(14.4, 0.6, 0.01), iso(15.2, 4.2, 0.01), iso(9.8, 4.2, 0.01)], '#FFFFFF', 0.55)
  // plant on the sill
  box(12.0, 0.15, 4.6, 0.65, 0.6, 0.6, '#5E3B1C', '#D4705B', '#C2523C')
  const lf = iso(12.32, 0.45, 5.2)
  const leaves: [number, number, string][] = [
    [-18, -26, '#2E7D6B'],
    [-5, -40, '#4E9A85'],
    [9, -34, '#2E7D6B'],
    [18, -19, '#4E9A85'],
    [-14, -14, '#4E9A85'],
  ]
  for (const k of leaves) {
    raw(
      `<path d="M${n1(lf[0])} ${n1(lf[1])}Q${n1(lf[0] + k[0] * 0.2)} ${n1(lf[1] + k[1] * 0.7)} ${n1(lf[0] + k[0])} ${n1(lf[1] + k[1])}Q${n1(lf[0] + k[0] * 0.9)} ${n1(lf[1] + k[1] * 0.4)} ${n1(lf[0])} ${n1(lf[1])}Z" fill="${k[2]}" stroke="${k[2]}" stroke-width="3" stroke-linejoin="round"/>`,
    )
  }
  wallText(iso(1.6, 0, 8.75), 'SOBJO WORKSHOP', 34, '#1C2128', 'hl')

  // floor lamp standing against the back wall, right of the window
  const LX = 15.5
  const LY = 0.75
  const lampFoot = iso(LX, LY, 0)
  raw(`<ellipse cx="${n1(lampFoot[0])}" cy="${n1(lampFoot[1])}" rx="70" ry="34" fill="url(#sh-glow)"/>`)
  raw(`<ellipse cx="${n1(lampFoot[0] + 2)}" cy="${n1(lampFoot[1] + 2)}" rx="15" ry="7" fill="#1C2128" opacity="0.18"/>`)
  raw(`<ellipse cx="${n1(lampFoot[0])}" cy="${n1(lampFoot[1])}" rx="13" ry="6" fill="#2A2F36"/>`)
  raw(`<ellipse cx="${n1(lampFoot[0])}" cy="${n1(lampFoot[1] - 2)}" rx="13" ry="6" fill="#3A414B"/>`)
  L(iso(LX, LY, 0.1), iso(LX, LY, 6.0), 3, '#3A414B')
  const shade = iso(LX, LY, 6.3)
  raw(`<circle cx="${n1(shade[0])}" cy="${n1(shade[1] + 4)}" r="52" fill="url(#sh-glow)"/>`)
  raw(
    `<path d="M${n1(shade[0] - 11)} ${n1(shade[1] - 14)}L${n1(shade[0] + 11)} ${n1(shade[1] - 14)}L${n1(shade[0] + 21)} ${n1(shade[1] + 8)}L${n1(shade[0] - 21)} ${n1(shade[1] + 8)}Z" fill="#F2BE22"/>` +
      `<path d="M${n1(shade[0])} ${n1(shade[1] - 14)}L${n1(shade[0] + 11)} ${n1(shade[1] - 14)}L${n1(shade[0] + 21)} ${n1(shade[1] + 8)}L${n1(shade[0])} ${n1(shade[1] + 8)}Z" fill="#D9A40F"/>` +
      `<ellipse cx="${n1(shade[0])}" cy="${n1(shade[1] - 14)}" rx="11" ry="3.5" fill="#F8D664"/>` +
      `<ellipse cx="${n1(shade[0])}" cy="${n1(shade[1] + 8)}" rx="21" ry="5.5" fill="#FFF3BF"/>`,
  )

  // poster on the back half of the left wall
  onLeftWall(
    iso(0, 4.6, 8.4),
    `<rect width="112" height="112" rx="2" fill="#FFFFFF"/>` +
      `<rect x="6" y="6" width="100" height="100" fill="#C2523C"/>` +
      `<circle cx="56" cy="44" r="27" fill="#F8D664"/>` +
      `<path d="M56 30V21" stroke="#1C2128" stroke-width="2"/><circle cx="56" cy="20" r="3.2" fill="#3B6FB6"/>` +
      `<rect x="41" y="29" width="30" height="23" rx="6" fill="#EEF2F5"/>` +
      `<circle cx="50" cy="40" r="3" fill="#1C2128"/><circle cx="62" cy="40" r="3" fill="#1C2128"/>` +
      `<path d="M52 46q4 3.5 8 0" stroke="#1C2128" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
      `<rect x="45" y="54" width="22" height="15" rx="3" fill="#A3ADB9"/>` +
      `<path d="M56 64.5l-3.2-2.8c-2-2 0.8-4.6 3.2-2.2c2.4-2.4 5.2 0.2 3.2 2.2z" fill="#C2523C"/>` +
      `<text x="56" y="86" text-anchor="middle" class="hl" font-size="15" fill="#FFFFFF">KEEP</text>` +
      `<text x="56" y="100" text-anchor="middle" class="hl" font-size="15" fill="#FFFFFF">BUILDING</text>`,
  )

  // cat clock above the IN machine, tail swinging like a pendulum
  onLeftWall(
    iso(0, 7.4, 7.7),
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

  // pegboard over the desk on the front half of the left wall, with tools hanging on it
  P([iso(0, PEG_Y0 - 0.15, 5.15), iso(0, PEG_Y1 + 0.15, 5.15), iso(0, PEG_Y1 + 0.15, 8.05), iso(0, PEG_Y0 - 0.15, 8.05)], '#C3CCD6')
  P([iso(0, PEG_Y0, 5.3), iso(0, PEG_Y1, 5.3), iso(0, PEG_Y1, 7.9), iso(0, PEG_Y0, 7.9)], '#E9EEF5')
  for (let px = 1.3; px < 5.6; px += 0.5) for (let pz = 5.55; pz < 7.8; pz += 0.5) C(onBoard(px, pz), 1.2, '#D0D8E1')
  drawTools(true)
  drawTools(false)

  // robot arm base, just behind the belt
  const bx = SHOULDER[0] - 0.8
  const by = SHOULDER[1] - 0.8
  shadow(bx, by, 1.6, 1.6, 0.18)
  box(bx, by, 0, 1.6, 1.6, 0.7, GRAY[0], GRAY[1], GRAY[2])
  rim(bx, by, 0.7, 1.6, 1.6)
  box(bx + 0.27, by + 0.27, 0.7, 1.07, 1.07, 0.7, YEL[0], YEL[1], YEL[2])
  rim(bx + 0.27, by + 0.27, 1.4, 1.07, 1.07)
  C(iso(bx + 0.13, by + 1.5, 0.35), 2.2, '#5E6875')
  C(iso(bx + 1.5, by + 0.13, 0.35), 2.2, '#5E6875')
  return buf.join('')
}

function drawMid() {
  buf = []
  // IN machine
  shadow(0, 5.6, 2.4, 3.6)
  box(0, 5.6, 0, 2.4, 3.6, 5, '#8C97A4', '#A3ADB9', '#76818E')
  rim(0, 5.6, 5, 2.4, 3.6)
  P([iso(2.4, 6.2, 2.1), iso(2.4, 8.6, 2.1), iso(2.4, 8.6, 3.9), iso(2.4, 6.2, 3.9)], '#1F242B')
  for (let fl = 0; fl < 5; fl++)
    P(
      [
        iso(2.42, 6.2 + fl * 0.48, 3.9),
        iso(2.42, 6.62 + fl * 0.48, 3.9),
        iso(2.42, 6.62 + fl * 0.48, 3.1),
        iso(2.42, 6.2 + fl * 0.48, 3.1),
      ],
      '#2A2F36',
      0.9,
    )
  C(iso(1.2, 9.2, 4.3), 4, '#5FD38D')
  const inLabel = iso(0.35, 9.2, 3.2)
  raw(
    `<text transform="matrix(0.866 0.5 0 1 ${n1(inLabel[0])} ${n1(inLabel[1])})" class="mono" font-size="13" font-weight="700" fill="#1C2128">IN ▸</text>`,
  )
  // legs + belt body
  for (const lx of [3.6, 6.3, 8.9, BELT_X1 - 0.7]) {
    shadow(lx, BY + 0.2, 0.3, 2.4, 0.1)
    box(lx, BY + 0.2, 0, 0.3, 0.3, 2, GRAY[0], GRAY[1], GRAY[2])
    box(lx, BY + BD - 0.5, 0, 0.3, 0.3, 2, GRAY[0], GRAY[1], GRAY[2])
  }
  box(BELT_X0, BY, 2, BELT_X1 - BELT_X0, BD, 0.6, '#3A414B', '#5E6875', '#76818E')
  // box: back flap, left flap, inside
  shadow(BX, BYb, BW, BW, 0.2)
  P([iso(BX, BYb, BH), iso(BX + BW, BYb, BH), iso(BX + BW, BYb - 0.8, BH + 1.1), iso(BX, BYb - 0.8, BH + 1.1)], '#B57E45')
  P([iso(BX, BYb, BH), iso(BX, BYb + BW, BH), iso(BX - 0.7, BYb + BW, BH - 0.7), iso(BX - 0.7, BYb, BH - 0.7)], '#C9925A')
  P([iso(BX, BYb, BH), iso(BX + BW, BYb, BH), iso(BX + BW, BYb + BW, BH), iso(BX, BYb + BW, BH)], '#5E3B1C')
  P([iso(BX, BYb, BH), iso(BX + BW, BYb, BH), iso(BX + BW, BYb, 0.8), iso(BX, BYb, 0.8)], '#8A5A2B')
  P([iso(BX, BYb, BH), iso(BX, BYb + BW, BH), iso(BX, BYb + BW, 0.8), iso(BX, BYb, 0.8)], '#7E5428')
  // chute
  const CH0 = BELT_X1
  const CH1 = BELT_X1 + 1.4
  P([iso(CH0, BY + 0.3, 2.6), iso(CH1, BY + 0.3, 2.0), iso(CH1, BY + BD - 0.3, 2.0), iso(CH0, BY + BD - 0.3, 2.6)], '#C3CCD6')
  P(
    [iso(CH0, BY + BD - 0.3, 2.6), iso(CH1, BY + BD - 0.3, 2.0), iso(CH1, BY + BD - 0.3, 2.3), iso(CH0, BY + BD - 0.3, 2.9)],
    '#8C97A4',
  )
  for (let cr = 0; cr < 3; cr++)
    L(iso(CH0 + 0.2 + cr * 0.4, BY + 0.4, 2.52 - cr * 0.17), iso(CH0 + 0.2 + cr * 0.4, BY + BD - 0.4, 2.52 - cr * 0.17), 2, '#A3ADB9')
  return buf.join('')
}

function drawFront() {
  buf = []
  P([iso(BX, BYb + BW, 0), iso(BX + BW, BYb + BW, 0), iso(BX + BW, BYb + BW, BH), iso(BX, BYb + BW, BH)], '#D49A5E')
  P([iso(BX + BW, BYb, 0), iso(BX + BW, BYb + BW, 0), iso(BX + BW, BYb + BW, BH), iso(BX + BW, BYb, BH)], '#B9844A')
  P([iso(BX + 1.4, BYb + BW, 1.1), iso(BX + 2.0, BYb + BW, 1.1), iso(BX + 2.0, BYb + BW, BH), iso(BX + 1.4, BYb + BW, BH)], '#E9CFA6')
  P(
    [iso(BX, BYb + BW, BH), iso(BX + BW, BYb + BW, BH), iso(BX + BW, BYb + BW + 0.9, BH + 0.7), iso(BX, BYb + BW + 0.9, BH + 0.7)],
    '#E2BC8B',
  )
  P(
    [iso(BX + BW, BYb, BH), iso(BX + BW, BYb + BW, BH), iso(BX + BW + 0.9, BYb + BW, BH + 0.7), iso(BX + BW + 0.9, BYb, BH + 0.7)],
    '#D7AE7C',
  )
  L(iso(BX + 0.3, BYb + BW, 0.5), iso(BX + 1.0, BYb + BW, 0.5), 2, '#8A5A2B')
  L(iso(BX + 0.3, BYb + BW, 0.75), iso(BX + 0.8, BYb + BW, 0.75), 2, '#8A5A2B')
  const sorted = iso(BX + 0.3, BYb + BW, 1.55)
  raw(
    `<text transform="matrix(0.866 0.5 0 1 ${n1(sorted[0])} ${n1(sorted[1])})" class="mono" font-size="12" font-weight="700" fill="#5A3B1E">SORTED</text>`,
  )
  // desk against the left wall, under the pegboard, facing into the room
  shadow(0.3, 10.8, 1.8, 4.0, 0.12)
  for (const [lx, ly] of [
    [0.5, 11.0],
    [1.8, 11.0],
    [0.5, 14.4],
    [1.8, 14.4],
  ])
    box(lx, ly, 0, 0.25, 0.25, 2.8, GRAY[0], GRAY[1], GRAY[2])
  box(0.3, 10.8, 2.8, 1.9, 4.1, 0.2, '#F7F9FB', '#C3CCD6', '#A3ADB9')
  rim(0.3, 10.8, 3.0, 1.9, 4.1)
  // desk lamp in the back corner of the desk
  box(0.5, 11.0, 3.0, 0.5, 0.5, 0.1, '#5E6875', '#3A414B', '#2A2F36')
  L(iso(0.75, 11.25, 3.1), iso(0.75, 11.25, 4.6), 3, '#3A414B')
  L(iso(0.75, 11.25, 4.6), iso(1.0, 12.0, 4.9), 3, '#3A414B')
  P([iso(0.9, 11.8, 4.6), iso(1.1, 12.4, 4.6), iso(1.1, 12.2, 5.1), iso(0.9, 11.7, 5.0)], '#C2523C')
  // laptop, screen facing into the room
  box(0.8, 11.6, 3.0, 1.1, 1.8, 0.08, '#5E6875', '#3A414B', '#2A2F36')
  P([iso(0.8, 11.6, 3.08), iso(0.8, 13.4, 3.08), iso(0.5, 13.4, 4.3), iso(0.5, 11.6, 4.3)], '#3A414B')
  P([iso(0.78, 11.75, 3.2), iso(0.78, 13.25, 3.2), iso(0.52, 13.25, 4.18), iso(0.52, 11.75, 4.18)], '#A9D4F5')
  L(iso(0.62, 12.05, 3.8), iso(0.62, 12.85, 3.8), 2, '#3B6FB6')
  L(iso(0.69, 12.05, 3.55), iso(0.69, 13.05, 3.55), 2, '#C2523C')
  // coffee
  box(1.0, 13.8, 3.0, 0.45, 0.45, 0.55, '#3A2414', '#F7F9FB', '#DCE3EA')
  L(iso(1.2, 14.02, 3.7), iso(1.1, 13.95, 4.1), 1.5, '#A3ADB9', 0.7)

  // the brown cat lies on the floor in front of the desk
  drawBrownCat(iso(2.9, 13.4, 0))
  // the orange cat sits on the floor in front of the belt
  drawOrangeCat(iso(13.2, 12.4, 0))
  return buf.join('')
}

// ------------------------------------------------------------------ the six items
export const ITEMS: WorkshopItemDef[] = [
  {
    id: 'cheetah',
    name: 'Cheetah',
    href: '/projects/cheetah',
    w: 1.8,
    d: 0.7,
    h: 1.15,
    draw(x, y, z) {
      for (const l of [
        [0.2, 0.15],
        [1.1, 0.15],
        [0.2, 0.55],
        [1.1, 0.55],
      ])
        L(iso(x + l[0], y + l[1], z + 0.4), iso(x + l[0], y + l[1], z), 3.5, '#3A414B')
      L(iso(x, y + 0.35, z + 0.75), iso(x - 0.45, y + 0.35, z + 1.1), 3, '#D9A40F')
      box(x, y, z + 0.35, 1.3, 0.7, 0.5, YEL[0], YEL[1], YEL[2])
      box(x + 1.2, y + 0.1, z + 0.65, 0.55, 0.5, 0.45, YEL[0], YEL[1], YEL[2])
      C(iso(x + 0.4, y + 0.7, z + 0.6), 3, '#2A2F36')
      C(iso(x + 0.85, y + 0.7, z + 0.65), 3, '#2A2F36')
      C(iso(x + 1.75, y + 0.45, z + 0.9), 2, '#2A2F36')
    },
  },
  {
    id: 'books',
    name: 'Notebook',
    href: '/notebook',
    w: 1.3,
    d: 1.1,
    h: 0.66,
    draw(x, y, z) {
      box(x, y, z, 1.3, 1.1, 0.22, '#5E86B8', '#3B6FB6', '#2F5C99')
      box(x + 0.05, y + 0.05, z + 0.22, 1.2, 1.0, 0.22, '#4E9A85', '#2E7D6B', '#246553')
      box(x, y, z + 0.44, 1.25, 1.05, 0.22, '#D4705B', '#C2523C', '#A8412D')
    },
  },
  {
    id: 'plush',
    name: 'About us',
    href: '/about',
    w: 1.2,
    d: 1.1,
    h: 1.45,
    draw(x, y, z) {
      C(iso(x + 0.3, y + 0.3, z + 0.4), 15, '#C2523C')
      C(iso(x + 0.3, y + 0.3, z + 1.15), 12, '#C2523C')
      C(iso(x + 0.9, y + 0.8, z + 0.4), 15, '#3B6FB6')
      C(iso(x + 0.9, y + 0.8, z + 1.15), 12, '#3B6FB6')
      C(iso(x + 0.3, y + 0.3, z + 1.2), 1.8, '#1C2128')
      C(iso(x + 0.9, y + 0.8, z + 1.2), 1.8, '#1C2128')
      heart(iso(x + 0.6, y + 0.55, z + 2.0), 1, '#C2523C')
    },
  },
  {
    id: 'board',
    name: 'Bench',
    href: '/bench',
    w: 1.5,
    d: 1.1,
    h: 0.16,
    draw(x, y, z) {
      box(x, y, z, 1.5, 1.1, 0.16, '#F7F9FB', '#DCE3EA', '#C3CCD6')
      for (let k = 0; k < 5; k++) C(iso(x + 0.2 + k * 0.25, y + 0.2, z + 0.17), 1.2, '#C3CCD6')
      L(iso(x + 0.3, y + 0.5, z + 0.16), iso(x + 1.0, y + 0.5, z + 0.5), 2.5, '#C2523C')
      L(iso(x + 0.6, y + 0.9, z + 0.16), iso(x + 1.3, y + 0.9, z + 0.4), 2.5, '#3B6FB6')
    },
  },
  {
    id: 'letter',
    name: 'Say hi',
    href: '/say-hi',
    w: 1.3,
    d: 1.0,
    h: 0.1,
    draw(x, y, z) {
      box(x, y, z, 1.3, 1.0, 0.1, '#F7F9FB', '#DCE3EA', '#C3CCD6')
      L(iso(x, y, z + 0.1), iso(x + 0.65, y + 0.5, z + 0.1), 1.5, '#8C97A4')
      L(iso(x + 0.65, y + 0.5, z + 0.1), iso(x + 1.3, y, z + 0.1), 1.5, '#8C97A4')
      C(iso(x + 0.65, y + 0.5, z + 0.1), 4, '#C2523C')
    },
  },
  {
    id: 'cube',
    name: 'Cubli',
    href: '/projects/cubli',
    w: 0.9,
    d: 0.9,
    h: 0.9,
    draw(x, y, z) {
      box(x, y, z, 0.9, 0.9, 0.9, '#7FA2CC', '#5E86B8', '#4A6FA0')
      C(iso(x + 0.45, y + 0.9, z + 0.45), 6, '#F2BE22')
      C(iso(x + 0.9, y + 0.45, z + 0.45), 5, '#D9A40F')
    },
  },
]

const VISIBLE = BELT_X1 - BELT_X0 - 1.0 // how far an item rides before slipping under
const SPACING = 2.2 // between items on the belt
const LOOP = SPACING * 6 // full lap, including the hidden return

type Mode = 'belt' | 'held' | 'fall' | 'sorted' | 'floor'
interface Item {
  def: WorkshopItemDef
  mode: Mode
  pos: number
  x: number
  y: number
  z: number
  vz: number
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
  const SPEED = reduceMotion ? 0 : 0.55

  const items: Item[] = ITEMS.map((def, i) => ({
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
  function beltY(it: Item) {
    return BY + (BD - it.def.d) / 2
  }
  function beltOpacity(it: Item) {
    const end = VISIBLE - it.def.w
    if (it.pos < 0 || it.pos > end + 0.01) return 0
    if (it.pos < 0.5) return it.pos / 0.5
    if (it.pos > end - 0.5) return Math.max(0, (end - it.pos) / 0.5)
    return 1
  }
  // world position of an item's footprint corner + bottom
  function itemBase(it: Item): Vec3 {
    if (it.mode === 'belt') return [BELT_X0 + it.pos, beltY(it), BELT_Z]
    if (it.mode === 'held') return [G.x - it.def.w / 2, G.y - it.def.d / 2, G.z + 0.35 - it.def.h]
    return [it.x, it.y, it.z]
  }

  // ------------------------------------------------------------------ arm state
  const G = { x: BX + BW / 2, y: 7.4, z: HOVER_Z } // fingertip point
  let target = { x: BX + BW / 2, y: 7.4 }
  let holding: Item | null = null
  let chase: Item | null = null
  let pendingDrop = false
  let navigating: { item: Item; t: number } | null = null
  let press = { down: false, x: 0, y: 0, moved: false, grabbedDuring: false }
  let hover: Item | null = null
  const timeouts: number[] = []

  function holdZ() {
    return holding ? Math.max(HOVER_Z, 3.9 + holding.def.h - 0.35) : HOVER_Z
  }
  function clampTarget(p: { x: number; y: number }) {
    // the belt, the box and the floor around them; not over the desk by the left wall
    let x = clamp(p.x, BELT_X0, RW - 1.2)
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

  function solveElbow(W: Vec3): Vec3 {
    const dx = W[0] - SHOULDER[0]
    const dy = W[1] - SHOULDER[1]
    const dz = W[2] - SHOULDER[2]
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
    const dc = clamp(d, Math.abs(L1 - L2) + 0.1, L1 + L2 - 0.05)
    const ux = dx / d
    const uy = dy / d
    const uz = dz / d
    const a = (L1 * L1 - L2 * L2 + dc * dc) / (2 * dc)
    const hgt = Math.sqrt(Math.max(0, L1 * L1 - a * a))
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
    return x > BX + 0.1 && x < BX + BW - 0.1 && y > BYb + 0.1 && y < BYb + BW - 0.1
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
    if (overBox(G.x, G.y)) {
      it.dest = 'box'
      it.zEnd = 0.3
      it.x = clamp(it.x, BX + 0.15, BX + BW - it.def.w - 0.15)
      it.y = clamp(it.y, BYb + 0.15, BYb + BW - it.def.d - 0.15)
    } else if (G.y > BY + 0.2 && G.y < BY + BD - 0.2 && G.x > BELT_X0 + 0.4 && G.x < BELT_X1 - 0.6) {
      it.dest = 'belt'
      it.zEnd = BELT_Z
      it.y = beltY(it)
    } else {
      it.dest = 'floor'
      it.zEnd = 0
    }
  }

  function goTo(it: Item) {
    navigating = { item: it, t: 0 }
    svg.style.cursor = 'default'
    if (opts.status) opts.status.textContent = `Sorted: ${it.def.name}. Opening the page.`
    timeouts.push(window.setTimeout(() => opts.onSorted(it.def.href), 650))
  }

  // ------------------------------------------------------------------ simulation
  let beltOffset = 0
  function step(dt: number) {
    beltOffset = (beltOffset + SPEED * dt) % 0.9
    for (const it of items) {
      if (it.mode === 'belt') {
        it.pos += SPEED * dt
        if (it.pos > LOOP) it.pos -= LOOP
      } else if (it.mode === 'fall') {
        it.vz -= 26 * dt
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
            it.timer = 1.4
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

    // where the fingertips want to be
    let goal: { x: number; y: number; z: number }
    if (chase && chase.mode !== 'belt') chase = null
    if (chase) {
      const b = itemBase(chase)
      const cx = b[0] + chase.def.w / 2
      const cy = b[1] + chase.def.d / 2
      const close = Math.hypot(G.x - cx, G.y - cy) < 0.3
      goal = { x: cx, y: cy, z: close ? b[2] + chase.def.h - 0.15 : HOVER_Z }
      if (close && G.z < b[2] + chase.def.h + 0.05) {
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
    G.x += (goal.x - G.x) * k
    G.y += (goal.y - G.y) * k
    G.z += (goal.z - G.z) * Math.min(1, dt * 14)

    if (pendingDrop && holding && Math.hypot(G.x - target.x, G.y - target.y) < 0.3) drop()
    if (navigating) navigating.t += dt
  }

  // ------------------------------------------------------------------ per-frame drawing
  function tag(it: Item, highlight: boolean) {
    const b = itemBase(it)
    const p = iso(b[0] + it.def.w / 2, b[1] + it.def.d / 2, b[2] + it.def.h + 0.55)
    const label = it.def.name.toUpperCase()
    const wpx = label.length * 6.6 + 18
    const o = it.mode === 'belt' ? beltOpacity(it) : 1
    raw(
      `<g${op(Math.round(o * 100) / 100)}><rect x="${n1(p[0] - wpx / 2)}" y="${n1(p[1] - 18)}" width="${n1(wpx)}" height="17" rx="8.5" fill="${highlight ? '#F2BE22' : '#1C2128'}"/>` +
        `<text x="${n1(p[0])}" y="${n1(p[1] - 6)}" text-anchor="middle" class="mono" font-size="9" font-weight="700" fill="${highlight ? '#1C2128' : '#F7F9FB'}">${esc(label)}</text></g>`,
    )
  }

  function render() {
    const W: Vec3 = [G.x, G.y, G.z + GRIP_OFFSET]
    const El = solveElbow(W)
    const sh = iso(SHOULDER[0], SHOULDER[1], SHOULDER[2])
    const el = iso(El[0], El[1], El[2])
    const wr = iso(W[0], W[1], W[2])
    const gp = iso(G.x, G.y, G.z + PALM_OFFSET)

    // layer: upper arm (sits behind the belt)
    buf = []
    L([sh[0] + 4, sh[1] + 2.7], [el[0] + 4, el[1] + 2.7], 23, '#D9A40F')
    L(sh, el, 21, '#F2BE22')
    L([sh[0] - 6, sh[1]], [el[0] - 6, el[1]], 3.5, '#F8D664')
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
    L(c1, c2, 2, '#2A2F36')
    C(sh, 13.5, '#8C97A4')
    C(sh, 5.5, '#5E6875')
    layerArm.innerHTML = buf.join('')

    // layer: belt surface, items on the belt, things falling into the box
    buf = []
    for (let sx = BELT_X0 + 0.6 - beltOffset; sx < BELT_X1; sx += 0.9)
      if (sx > BELT_X0 + 0.05) L(iso(sx, BY + 0.1, 2.6), iso(sx, BY + BD - 0.1, 2.6), 1.5, '#4A515C')
    L(iso(BELT_X0, BY + BD, 2.6), iso(BELT_X1, BY + BD, 2.6), 1.5, '#A3ADB9')
    L(iso(BELT_X0, BY, 2.6), iso(BELT_X1, BY, 2.6), 3, '#5E6875')
    for (const it of items) {
      if (it.mode === 'belt') {
        const o = beltOpacity(it)
        if (o <= 0) continue
        const b = itemBase(it)
        raw(`<g${op(Math.round(o * 100) / 100)}>`)
        it.def.draw(b[0], b[1], b[2])
        raw('</g>')
      } else if (it.mode === 'fall' || it.mode === 'sorted' || it.mode === 'floor') {
        if (it.mode === 'floor' || (it.mode === 'fall' && it.dest === 'floor')) shadow(it.x, it.y, it.def.w, it.def.d, 0.12)
        const fo = it.mode === 'floor' ? Math.min(1, it.timer / 0.5) : 1
        raw(`<g${op(Math.round(fo * 100) / 100)}>`)
        it.def.draw(it.x, it.y, it.z)
        raw('</g>')
      }
    }
    if (holding) {
      const on = overBox(G.x, G.y)
      P(
        [
          iso(BX + 0.1, BYb + 0.1, BH + 0.02),
          iso(BX + BW - 0.1, BYb + 0.1, BH + 0.02),
          iso(BX + BW - 0.1, BYb + BW - 0.1, BH + 0.02),
          iso(BX + 0.1, BYb + BW - 0.1, BH + 0.02),
        ],
        '#F2BE22',
        on ? 0.55 : 0.2,
      )
    }
    layerItems.innerHTML = buf.join('')

    // layer: forearm, gripper, held item, labels, toast
    buf = []
    L([el[0] + 2.7, el[1] + 4], [wr[0] + 2.7, wr[1] + 4], 16, '#D9A40F')
    L(el, wr, 15, '#F2BE22')
    L([el[0] - 1.3, el[1] - 5.3], [wr[0] - 1.3, wr[1] - 5.3], 3, '#F8D664')
    C(el, 10, '#8C97A4')
    C(el, 4, '#5E6875')
    C(wr, 7.5, '#2A2F36')
    L(wr, gp, 5.5, '#5E6875')
    const spread = holding ? Math.max(10, holding.def.w * 9) : chase ? 15 : 17.5
    L([gp[0] - spread - 3, gp[1]], [gp[0] + spread + 3, gp[1]], 6.5, '#2A2F36')
    if (holding) {
      const hb = itemBase(holding)
      holding.def.draw(hb[0], hb[1], hb[2])
    }
    L([gp[0] - spread, gp[1]], [gp[0] - spread, gp[1] + 26], 4.5, '#8C97A4')
    L([gp[0] + spread, gp[1]], [gp[0] + spread, gp[1] + 26], 4.5, '#8C97A4')
    // drop shadow marker under the gripper so you can tell where you are aiming
    const floorZ = overBox(G.x, G.y)
      ? BH
      : G.y > BY && G.y < BY + BD && G.x > BELT_X0 && G.x < BELT_X1
        ? BELT_Z
        : 0
    const aim = iso(G.x, G.y, floorZ)
    raw(
      `<ellipse cx="${n1(aim[0])}" cy="${n1(aim[1])}" rx="13" ry="6.5" fill="none" stroke="${holding && overBox(G.x, G.y) ? '#C2523C' : '#1C2128'}" stroke-width="2" opacity="${holding ? 0.7 : 0.25}" stroke-dasharray="4 3"/>`,
    )

    // name tags only for the item under the pointer or the one the arm is going for
    for (const it of items) if (it.mode === 'belt' && (it === hover || it === chase) && beltOpacity(it) > 0.05) tag(it, true)
    if (holding) tag(holding, true)

    if (navigating) {
      const bp = iso(BX + BW / 2, BYb + BW / 2, BH + 3.2)
      const name = `→ ${navigating.item.def.name.toUpperCase()}`
      const tw = name.length * 9 + 36
      const s = Math.min(1, navigating.t / 0.25)
      raw(
        `<g opacity="${n1(s)}"><rect x="${n1(bp[0] - tw / 2)}" y="${n1(bp[1] - 24)}" width="${n1(tw)}" height="34" rx="17" fill="#1C2128"/>` +
          `<text x="${n1(bp[0])}" y="${n1(bp[1] - 2)}" text-anchor="middle" class="mono" font-size="13" font-weight="700" fill="#F8D664">${esc(name)}</text></g>`,
      )
    }
    layerTop.innerHTML = buf.join('')
  }

  // ------------------------------------------------------------------ boot
  animate = !reduceMotion
  layer('ws-back').innerHTML = drawBack()
  layer('ws-mid').innerHTML = drawMid()
  layer('ws-front').innerHTML = drawFront()

  let last: number | null = null
  let visible = true
  let raf = 0
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting
  })
  io.observe(svg)
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
