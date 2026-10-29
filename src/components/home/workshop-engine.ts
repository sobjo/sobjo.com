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

const BY = 6.0 // belt: y range and depth
const BD = 2.8
const BELT_X0 = 2.4
const BELT_X1 = 13.6
const BELT_Z = 2.6
const BX = 14.2 // cardboard box
const BYb = 5.8
const BW = 3.4
const BH = 2.3
const SHOULDER: Vec3 = [6.0, 3.2, 2.6]
const L1 = 7.3
const L2 = 9.3
const HOVER_Z = 4.4 // fingertip height when empty
const GRIP_OFFSET = 2.1 // fingertip -> wrist
const PALM_OFFSET = 1.3 // fingertip -> palm bar
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
function heart(p: Pt, s: number, col: string, o?: number) {
  raw(
    `<path d="M${n1(p[0])} ${n1(p[1] + 6 * s)}l${n1(-8 * s)} ${n1(-7 * s)}c${n1(-5 * s)} ${n1(-5 * s)} ${n1(2 * s)} ${n1(-11 * s)} ${n1(8 * s)} ${n1(-5 * s)}c${n1(6 * s)} ${n1(-6 * s)} ${n1(13 * s)} 0 ${n1(8 * s)} ${n1(5 * s)}z" fill="${col}"${op(o)}/>`,
  )
}

// ------------------------------------------------------------------ static layers
function drawBack() {
  buf = []
  box(0, 0, -1.2, 20, 14, 1.2, '#EEF2F5', '#B5BFCB', '#C9D2DC')
  for (let gx = 2; gx < 20; gx += 2) L(iso(gx, 0, 0), iso(gx, 14, 0), 1, '#DCE3EA')
  for (let gy = 2; gy < 14; gy += 2) L(iso(0, gy, 0), iso(20, gy, 0), 1, '#DCE3EA')
  box(0, -0.6, 0, 20, 0.6, 10, '#8C97A4', '#DCE3EA', '#C3CCD6')
  box(-0.6, -0.6, 0, 0.6, 14.6, 10, '#8C97A4', '#B5BFCB', '#D0D8E1')
  P([iso(0, 0, 0), iso(20, 0, 0), iso(20, 0, 0.5), iso(0, 0, 0.5)], '#C3CCD6')
  P([iso(0, 0, 0), iso(0, 14, 0), iso(0, 14, 0.5), iso(0, 0, 0.5)], '#A3ADB9')

  // window + light on the floor
  P([iso(12.9, 0, 4.6), iso(18.4, 0, 4.6), iso(18.4, 0, 8.4), iso(12.9, 0, 8.4)], '#FFFFFF')
  P([iso(13.2, 0, 4.9), iso(18.1, 0, 4.9), iso(18.1, 0, 8.1), iso(13.2, 0, 8.1)], '#A9D4F5')
  P([iso(13.5, 0, 5.6), iso(15.1, 0, 7.8), iso(15.5, 0, 7.8), iso(13.9, 0, 5.6)], '#FFFFFF', 0.5)
  L(iso(15.65, 0, 4.9), iso(15.65, 0, 8.1), 3, '#FFFFFF')
  L(iso(13.2, 0, 6.5), iso(18.1, 0, 6.5), 3, '#FFFFFF')
  box(12.7, 0, 4.4, 5.9, 0.5, 0.2, '#FFFFFF', '#E6ECF2', '#DCE3EA')
  P([iso(13.6, 0.6, 0.01), iso(19.0, 0.6, 0.01), iso(19.8, 4.2, 0.01), iso(14.4, 4.2, 0.01)], '#FFFFFF', 0.55)

  // pegboard with tools
  P([iso(6.0, 0, 4.6), iso(12.4, 0, 4.6), iso(12.4, 0, 8.0), iso(6.0, 0, 8.0)], '#E9EEF5')
  for (let px = 6.4; px < 12.2; px += 0.6) for (let pz = 5.0; pz < 7.9; pz += 0.6) C(iso(px, 0, pz), 1.4, '#C3CCD6')
  L(iso(7.0, 0, 7.4), iso(7.0, 0, 5.3), 4, '#3B6FB6')
  C(iso(7.0, 0, 7.5), 6, '#3B6FB6')
  L(iso(8.2, 0, 7.5), iso(8.2, 0, 5.6), 3, '#2A2F36')
  P([iso(8.0, 0, 5.6), iso(8.4, 0, 5.6), iso(8.2, 0, 5.1)], '#2A2F36')
  L(iso(9.4, 0, 7.4), iso(9.4, 0, 6.0), 6, '#F2BE22')
  L(iso(9.4, 0, 6.0), iso(9.4, 0, 5.1), 1.5, '#5E6875')
  const ring = iso(10.8, 0, 7.0)
  raw(`<path d="M${n1(ring[0])} ${n1(ring[1])}a11 11 0 1 0 1 0" fill="none" stroke="#C2523C" stroke-width="3"/>`)
  L(iso(12.3, 0, 7.5), iso(12.3, 0, 5.3), 3, '#76818E')
  L(iso(11.9, 0, 7.5), iso(12.7, 0, 7.5), 7, '#76818E')
  wallText(iso(2.7, 0, 8.75), 'SOBJO WORKSHOP', 34, '#1C2128', 'hl')

  // blueprint poster on the side wall
  P([iso(0, 2.0, 4.2), iso(0, 6.0, 4.2), iso(0, 6.0, 8.4), iso(0, 2.0, 8.4)], '#2F5C99')
  L(iso(0, 4.0, 5.4), iso(0, 4.9, 6.3), 2, '#E3ECF8')
  L(iso(0, 4.9, 6.3), iso(0, 4.0, 7.2), 2, '#E3ECF8')
  L(iso(0, 4.0, 7.2), iso(0, 3.1, 6.3), 2, '#E3ECF8')
  L(iso(0, 3.1, 6.3), iso(0, 4.0, 5.4), 2, '#E3ECF8')
  L(iso(0, 2.5, 4.8), iso(0, 5.5, 4.8), 1.5, '#E3ECF8')
  C(iso(0, 4.0, 6.3), 3, '#E3ECF8')

  // wall clock
  const ck = iso(0, 10.6, 7.2)
  raw(`<path d="M${n1(ck[0])} ${n1(ck[1] - 22)}a19 22 0 1 0 0.1 0Z" fill="#FFFFFF" stroke="#2A2F36" stroke-width="3"/>`)
  L(ck, [ck[0], ck[1] - 13], 2.5, '#2A2F36')
  L(ck, [ck[0] + 9, ck[1] - 1], 2.5, '#C2523C')
  C(ck, 2.5, '#2A2F36')

  // desk in the back-left corner
  shadow(0.4, 0.3, 4, 1.8, 0.12)
  for (const l of [
    [0.6, 0.5],
    [4.0, 0.5],
    [0.6, 1.8],
    [4.0, 1.8],
  ])
    box(l[0], l[1], 0, 0.25, 0.25, 2.8, GRAY[0], GRAY[1], GRAY[2])
  box(0.4, 0.3, 2.8, 4.1, 1.9, 0.2, '#F7F9FB', '#C3CCD6', '#A3ADB9')
  rim(0.4, 0.3, 3.0, 4.1, 1.9)
  box(1.2, 0.8, 3.0, 1.8, 1.1, 0.08, '#5E6875', '#3A414B', '#2A2F36')
  P([iso(1.2, 0.8, 3.08), iso(3.0, 0.8, 3.08), iso(3.0, 0.5, 4.3), iso(1.2, 0.5, 4.3)], '#3A414B')
  P([iso(1.35, 0.78, 3.2), iso(2.85, 0.78, 3.2), iso(2.85, 0.52, 4.18), iso(1.35, 0.52, 4.18)], '#A9D4F5')
  L(iso(1.6, 0.72, 3.8), iso(2.4, 0.72, 3.8), 2, '#3B6FB6')
  L(iso(1.6, 0.68, 3.55), iso(2.6, 0.68, 3.55), 2, '#C2523C')
  box(3.4, 1.0, 3.0, 0.45, 0.45, 0.55, '#3A2414', '#F7F9FB', '#DCE3EA')
  L(iso(3.62, 1.2, 3.7), iso(3.55, 1.1, 4.1), 1.5, '#A3ADB9', 0.7)
  box(0.6, 0.5, 3.0, 0.5, 0.5, 0.1, '#5E6875', '#3A414B', '#2A2F36')
  L(iso(0.85, 0.75, 3.1), iso(0.85, 0.75, 4.6), 3, '#3A414B')
  L(iso(0.85, 0.75, 4.6), iso(1.6, 1.0, 4.9), 3, '#3A414B')
  P([iso(1.4, 0.9, 4.6), iso(2.0, 1.1, 4.6), iso(1.8, 1.1, 5.1), iso(1.3, 0.9, 5.0)], '#C2523C')

  // plant in the back-right corner
  shadow(18.4, 0.6, 1.0, 1.0, 0.12)
  box(18.4, 0.6, 0, 1.0, 1.0, 1.1, '#5E3B1C', '#D4705B', '#C2523C')
  const lf = iso(18.9, 1.1, 1.1)
  const leaves: [number, number, string][] = [
    [-26, -40, '#2E7D6B'],
    [-8, -62, '#4E9A85'],
    [14, -52, '#2E7D6B'],
    [26, -30, '#4E9A85'],
    [-20, -24, '#4E9A85'],
  ]
  for (const k of leaves) {
    raw(
      `<path d="M${n1(lf[0])} ${n1(lf[1])}Q${n1(lf[0] + k[0] * 0.2)} ${n1(lf[1] + k[1] * 0.7)} ${n1(lf[0] + k[0])} ${n1(lf[1] + k[1])}Q${n1(lf[0] + k[0] * 0.9)} ${n1(lf[1] + k[1] * 0.4)} ${n1(lf[0])} ${n1(lf[1])}Z" fill="${k[2]}" stroke="${k[2]}" stroke-width="4" stroke-linejoin="round"/>`,
    )
  }

  // robot arm base (behind the belt)
  shadow(4.8, 2.0, 2.4, 2.4, 0.18)
  box(4.8, 2.0, 0, 2.4, 2.4, 1.0, GRAY[0], GRAY[1], GRAY[2])
  rim(4.8, 2.0, 1.0, 2.4, 2.4)
  box(5.2, 2.4, 1.0, 1.6, 1.6, 1.0, YEL[0], YEL[1], YEL[2])
  rim(5.2, 2.4, 2.0, 1.6, 1.6)
  for (const b of [
    [5.0, 4.25],
    [7.05, 2.2],
  ])
    C(iso(b[0], b[1], 0.5), 3, '#5E6875')
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
  for (const lx of [4, 7, 10, 12.9]) {
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
  P([iso(13.6, BY + 0.3, 2.6), iso(15.0, BY + 0.3, 2.0), iso(15.0, BY + BD - 0.3, 2.0), iso(13.6, BY + BD - 0.3, 2.6)], '#C3CCD6')
  P(
    [iso(13.6, BY + BD - 0.3, 2.6), iso(15.0, BY + BD - 0.3, 2.0), iso(15.0, BY + BD - 0.3, 2.3), iso(13.6, BY + BD - 0.3, 2.9)],
    '#8C97A4',
  )
  for (let cr = 0; cr < 3; cr++)
    L(iso(13.8 + cr * 0.4, BY + 0.4, 2.52 - cr * 0.17), iso(13.8 + cr * 0.4, BY + BD - 0.4, 2.52 - cr * 0.17), 2, '#A3ADB9')
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
  // hanging lamp over the belt
  const lamp = iso(7.2, 7.4, 9.4)
  const pool = iso(7.2, 7.4, 2.6)
  L([lamp[0], 0], [lamp[0], lamp[1] - 14], 2, '#3A414B')
  P(
    [
      [lamp[0] - 26, lamp[1] + 6],
      [lamp[0] + 26, lamp[1] + 6],
      [pool[0] + 110, pool[1] + 8],
      [pool[0] - 110, pool[1] + 8],
    ],
    '#FFF3BF',
    0.2,
  )
  raw(
    `<path d="M${n1(lamp[0] - 26)} ${n1(lamp[1] + 6)}C${n1(lamp[0] - 22)} ${n1(lamp[1] - 22)} ${n1(lamp[0] + 22)} ${n1(lamp[1] - 22)} ${n1(lamp[0] + 26)} ${n1(lamp[1] + 6)}Z" fill="#2A2F36"/>`,
  )
  C([lamp[0], lamp[1] + 6], 9, '#FFE98A')
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
const LOOP = 14.4 // full lap, including the hidden return

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
    pos: i * 2.4,
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
  const G = { x: 15.9, y: 7.4, z: HOVER_Z } // fingertip point
  let target = { x: 15.9, y: 7.4 }
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
    return { x: clamp(p.x, 1.6, 19.0), y: clamp(p.y, 5.0, 12.6) }
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
    L([sh[0] + 6, sh[1] + 4], [el[0] + 6, el[1] + 4], 34, '#D9A40F')
    L(sh, el, 32, '#F2BE22')
    L([sh[0] - 9, sh[1]], [el[0] - 9, el[1]], 5, '#F8D664')
    const c1 = iso(
      SHOULDER[0] + (El[0] - SHOULDER[0]) * 0.25 + 0.4,
      SHOULDER[1] + (El[1] - SHOULDER[1]) * 0.25,
      SHOULDER[2] + (El[2] - SHOULDER[2]) * 0.25,
    )
    const c2 = iso(
      SHOULDER[0] + (El[0] - SHOULDER[0]) * 0.7 + 0.4,
      SHOULDER[1] + (El[1] - SHOULDER[1]) * 0.7,
      SHOULDER[2] + (El[2] - SHOULDER[2]) * 0.7,
    )
    L(c1, c2, 3, '#2A2F36')
    C(sh, 20, '#8C97A4')
    C(sh, 8, '#5E6875')
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
    L([el[0] + 4, el[1] + 6], [wr[0] + 4, wr[1] + 6], 24, '#D9A40F')
    L(el, wr, 22, '#F2BE22')
    L([el[0] - 2, el[1] - 8], [wr[0] - 2, wr[1] - 8], 4, '#F8D664')
    C(el, 15, '#8C97A4')
    C(el, 6, '#5E6875')
    C(wr, 11, '#2A2F36')
    L(wr, gp, 8, '#5E6875')
    const spread = holding ? Math.max(14, holding.def.w * 13) : chase ? 22 : 26
    L([gp[0] - spread - 4, gp[1]], [gp[0] + spread + 4, gp[1]], 9, '#2A2F36')
    if (holding) {
      const hb = itemBase(holding)
      holding.def.draw(hb[0], hb[1], hb[2])
    }
    L([gp[0] - spread, gp[1]], [gp[0] - spread, gp[1] + 38], 6, '#8C97A4')
    L([gp[0] + spread, gp[1]], [gp[0] + spread, gp[1] + 38], 6, '#8C97A4')
    // drop shadow marker under the gripper so you can tell where you are aiming
    const floorZ = overBox(G.x, G.y)
      ? BH
      : G.y > BY && G.y < BY + BD && G.x > BELT_X0 && G.x < BELT_X1
        ? BELT_Z
        : 0
    const aim = iso(G.x, G.y, floorZ)
    raw(
      `<ellipse cx="${n1(aim[0])}" cy="${n1(aim[1])}" rx="16" ry="8" fill="none" stroke="${holding && overBox(G.x, G.y) ? '#C2523C' : '#1C2128'}" stroke-width="2" opacity="${holding ? 0.7 : 0.25}" stroke-dasharray="4 3"/>`,
    )

    for (const it of items) if (it.mode === 'belt' && beltOpacity(it) > 0.05) tag(it, it === hover || it === chase)
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
