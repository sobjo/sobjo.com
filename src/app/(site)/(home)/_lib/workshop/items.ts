/*
 * What sits on the desk: one item per project, drawn to look like the real build,
 * plus a few things that are just there (a lamp, the laptop, a mug).
 *
 * Projects come from the CMS. Each project's `illustration` picks its drawing:
 *   cube     the Cubli, a cube frame balancing on one corner with three reaction wheels
 *   cheetah  the Cheetah, a quadruped robot dog with knee-back legs and hip actuators
 *   idea     a napkin sketch with a pen, for projects that are still ideas
 */

import { DESK_SLOTS, DESK_Z, STEEL, UNIT_PX, YELLOW, iso, n1, type Pt, type Vec3 } from './geometry'
import { box, circle, circle3d, finishLayer, line, outline, polygon, raw, startLayer } from './svg'

/** The bits of a project the hero needs. */
export interface DeskProject {
  slug: string
  title: string
  illustration: 'cheetah' | 'cube' | 'idea'
}

/** Something on the desk. Projects have an `href`; the lamp, laptop and mug don't. */
export interface DeskItem {
  id: string
  name: string
  href: string | null
  /** Center of its footprint on the desk. */
  x: number
  y: number
  /** How tall it stands, in workshop units. Name tags float just above this. */
  h: number
  /** Draws it at time `t` (seconds), standing on the desk top. `lift` raises it while it is being picked up. */
  draw: (t: number, lift: number) => void
}

/** Places the projects on the desk slots (as many as fit) and adds the desk decorations. */
export function buildDeskItems(projects: DeskProject[]): DeskItem[] {
  const items: DeskItem[] = []
  let ideas = 0
  projects.slice(0, DESK_SLOTS.length).forEach((project, i) => {
    const [x, y] = DESK_SLOTS[i]
    // On the left arm of the desk things run along y instead of x.
    const along = x < 2 ? 'y' : 'x'
    const base = { id: project.slug, name: project.title, href: `/projects/${project.slug}`, x, y }
    if (project.illustration === 'cube') items.push({ ...base, h: 2.0, draw: (t, lift) => drawCubli(x, y, DESK_Z + lift, t) })
    else if (project.illustration === 'cheetah')
      items.push({ ...base, h: 1.25, draw: (t, lift) => drawCheetah(x, y, DESK_Z + lift, t, along) })
    else {
      const seed = ideas++
      items.push({ ...base, h: 0.35, draw: (_t, lift) => drawNapkin(x, y, DESK_Z + lift, seed, along) })
    }
  })
  items.push(
    { id: 'mug', name: '', href: null, x: 1.2, y: 1.2, h: 0.5, draw: () => drawMug(1.2, 1.2, DESK_Z) },
    { id: 'laptop', name: '', href: null, x: 1.0, y: 9.3, h: 1.2, draw: () => drawLaptop(1.0, 9.3, DESK_Z) },
    { id: 'lamp', name: '', href: null, x: 10.5, y: 0.8, h: 1.9, draw: () => drawLamp(10.5, 0.8, DESK_Z) },
  )
  // Paint back to front: things nearer the viewer (bigger x + y) go last.
  return items.sort((a, b) => a.x + a.y - (b.x + b.y))
}

/** A soft round shadow on the desk under an item. */
function deskShadow(x: number, y: number, z: number, r: number, o = 0.16) {
  const p = iso(x, y, z)
  raw(`<ellipse cx="${n1(p[0])}" cy="${n1(p[1])}" rx="${n1(r * 24)}" ry="${n1(r * 12)}" fill="#1C2128" opacity="${o}"/>`)
}

// ------------------------------------------------------------------ Cubli

type M3 = [Vec3, Vec3, Vec3]

function mul(m: M3, p: Vec3): Vec3 {
  return [
    m[0][0] * p[0] + m[0][1] * p[1] + m[0][2] * p[2],
    m[1][0] * p[0] + m[1][1] * p[1] + m[1][2] * p[2],
    m[2][0] * p[0] + m[2][1] * p[1] + m[2][2] * p[2],
  ]
}
function matmul(a: M3, b: M3): M3 {
  const c = (i: number, j: number) => a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j]
  return [
    [c(0, 0), c(0, 1), c(0, 2)],
    [c(1, 0), c(1, 1), c(1, 2)],
    [c(2, 0), c(2, 1), c(2, 2)],
  ]
}
/** Rotation by `a` radians around the unit axis `k` (Rodrigues' formula). */
function rotation(k: Vec3, a: number): M3 {
  const c = Math.cos(a)
  const s = Math.sin(a)
  const t = 1 - c
  const [x, y, z] = k
  return [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
  ]
}
/** Tips the cube up so the diagonal from one corner to the opposite corner stands vertical, then turns it a little. */
const CUBLI_TIP = matmul(rotation([0, 0, 1], 0.32), rotation([Math.SQRT1_2, -Math.SQRT1_2, 0], Math.acos(1 / Math.sqrt(3))))
const CUBLI_EDGE = 1.12
const CUBLI_DIAG = CUBLI_EDGE * Math.sqrt(3)

/**
 * The Cubli: an aluminum cube frame balancing on one corner. Three reaction wheels sit
 * on the three faces around the top corner and keep spinning to hold it upright.
 */
function drawCubli(x: number, y: number, z: number, t: number) {
  // a tiny wobble, like the controller fighting to stay balanced
  const wob = rotation([1, 0, 0], Math.sin(t * 2.3) * 0.025)
  const R = matmul(matmul(wob, rotation([0, 1, 0], Math.sin(t * 1.7 + 1) * 0.02)), CUBLI_TIP)
  const center: Vec3 = [x, y, z + CUBLI_DIAG / 2]
  const world = (p: Vec3): Vec3 => {
    const r = mul(R, p)
    return [center[0] + r[0] * CUBLI_EDGE, center[1] + r[1] * CUBLI_EDGE, center[2] + r[2] * CUBLI_EDGE]
  }
  const dir = (p: Vec3): Vec3 => mul(R, p)
  deskShadow(x, y, z, 0.7, 0.14 + Math.sin(t * 2.3) * 0.01)

  // faces of the cube, as (axis, sign); wheels sit on the three + faces
  const faces: { axis: 0 | 1 | 2; sign: 1 | -1 }[] = []
  for (const axis of [0, 1, 2] as const) for (const sign of [-1, 1] as const) faces.push({ axis, sign })
  const depth = (p: Vec3) => p[0] + p[1] + p[2]
  const faceInfo = faces.map((f) => {
    const n: Vec3 = [0, 0, 0]
    n[f.axis] = f.sign * 0.5
    return { ...f, n, d: depth(world(n)) }
  })
  faceInfo.sort((a, b) => a.d - b.d)

  for (const f of faceInfo) {
    const u: Vec3 = [0, 0, 0]
    const v: Vec3 = [0, 0, 0]
    u[(f.axis + 1) % 3] = 1
    v[(f.axis + 2) % 3] = 1
    const corner = (a: number, b: number): Pt => {
      const p: Vec3 = [f.n[0] + (u[0] * a + v[0] * b) * 0.5, f.n[1] + (u[1] * a + v[1] * b) * 0.5, f.n[2] + (u[2] * a + v[2] * b) * 0.5]
      const w = world(p)
      return iso(w[0], w[1], w[2])
    }
    const quad = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)]
    const facing = dir([f.n[0] * 2, f.n[1] * 2, f.n[2] * 2])
    const front = depth(facing) > 0
    // thin smoked panel so the frame reads as a solid cube
    polygon(quad, front ? '#E9EEF3' : '#B9C3CE', front ? 0.22 : 0.35)
    if (f.sign === 1) {
      // reaction wheel, just inside the face, spinning
      const inset = 0.42
      const cw = world([f.n[0] * (inset / 0.5), f.n[1] * (inset / 0.5), f.n[2] * (inset / 0.5)])
      const uw = dir(u)
      const vw = dir(v)
      const rimPts = circle3d(cw, uw, vw, 0.33 * CUBLI_EDGE, 28)
      polygon(rimPts, '#D8A35C', front ? 1 : 0.6)
      outline(rimPts, 2, '#A9712E', front ? 1 : 0.6)
      polygon(circle3d(cw, uw, vw, 0.24 * CUBLI_EDGE, 24), '#E9C38A', front ? 1 : 0.6)
      const spin = t * (5 + f.axis * 1.7) * (f.axis === 1 ? -1 : 1)
      for (let s = 0; s < 3; s++) {
        const a = spin + (s * Math.PI * 2) / 3
        const r = 0.24 * CUBLI_EDGE
        const tip = iso(
          cw[0] + (uw[0] * Math.cos(a) + vw[0] * Math.sin(a)) * r,
          cw[1] + (uw[1] * Math.cos(a) + vw[1] * Math.sin(a)) * r,
          cw[2] + (uw[2] * Math.cos(a) + vw[2] * Math.sin(a)) * r,
        )
        line(iso(cw[0], cw[1], cw[2]), tip, 2.2, '#A9712E', front ? 1 : 0.6)
      }
      circle(iso(cw[0], cw[1], cw[2]), 3.2, '#2A2F36', front ? 1 : 0.6)
    }
    // the four aluminum edges of this face
    for (let e = 0; e < 4; e++) {
      const a = quad[e]
      const b = quad[(e + 1) % 4]
      line(a, b, front ? 4.2 : 3.4, front ? '#7E8A97' : '#9AA5B1')
      line(a, b, front ? 2.2 : 1.6, front ? '#D5DBE2' : '#C3CCD6')
    }
  }
  // the corner it balances on, and a status LED on top
  const bottom = world([-0.5, -0.5, -0.5])
  circle(iso(bottom[0], bottom[1], bottom[2]), 3, '#5E6875')
  const top = world([0.5, 0.5, 0.5])
  circle(iso(top[0], top[1], top[2]), 3.2, '#5E6875')
  circle(iso(top[0], top[1], top[2]), 1.6, Math.sin(t * 4) > 0 ? '#5FD38D' : '#3FA86A')
}

// ------------------------------------------------------------------ Cheetah

/**
 * The Cheetah: a small quadruped robot dog, dark body with big hip actuators and legs
 * whose knees point backward. `along` is the direction it faces along the desk.
 */
function drawCheetah(x: number, y: number, z: number, t: number, along: 'x' | 'y') {
  const breathe = Math.sin(t * 2.2) * 0.02
  /** Drawn a bit bigger than life next to the other things on the desk. */
  const q = 1.25
  // (u, v) is body space: u toward the head, v toward the viewer's side.
  const P = (u: number, v: number, h: number): Vec3 =>
    along === 'x' ? [x + u * q, y + v * q, z + h * q] : [x + v * q, y - u * q, z + h * q]
  const S = (u: number, v: number, h: number) => {
    const p = P(u, v, h)
    return iso(p[0], p[1], p[2])
  }
  const obox = (u0: number, v0: number, h0: number, lu: number, lv: number, hh: number, c: string[]) => {
    ;[u0, v0, h0, lu, lv, hh] = [u0 * q, v0 * q, h0 * q, lu * q, lv * q, hh * q]
    if (along === 'x') box(x + u0, y + v0, z + h0, lu, lv, hh, c[0], c[1], c[2])
    else box(x + v0, y - u0 - lu, z + h0, lv, lu, hh, c[0], c[2], c[1])
  }
  deskShadow(x, y, z, 1.15, 0.14)

  const L = 0.78 // half body length
  const Wd = 0.24 // half body width
  const HIP_Z = 0.72 + breathe
  const BODY_Z = 0.6 + breathe
  const hips: [number, number][] = [
    [L - 0.18, -Wd - 0.12],
    [-L + 0.18, -Wd - 0.12],
    [L - 0.18, Wd + 0.12],
    [-L + 0.18, Wd + 0.12],
  ]
  const leg = (hu: number, hv: number, near: boolean) => {
    const hip = S(hu, hv, HIP_Z)
    const knee = S(hu - 0.24, hv, 0.36)
    const foot = S(hu - 0.02, hv, 0.04)
    const c = near ? '#3A414B' : '#4F5762'
    line(hip, knee, 7, c)
    line(hip, knee, 2, '#6B7480')
    line(knee, foot, 4.5, near ? '#2A2F36' : '#3A414B')
    circle(knee, 4, near ? '#5E6875' : '#6B7480')
    circle(foot, 3.6, '#1C2128')
  }
  const actuator = (hu: number, hv: number, near: boolean) => {
    const c = P(hu, hv, HIP_Z)
    const uDir: Vec3 = along === 'x' ? [1, 0, 0] : [0, -1, 0]
    const pts = circle3d(c, uDir, [0, 0, 1], 0.17 * q, 20)
    polygon(pts, near ? '#A3ADB9' : '#8C97A4')
    outline(pts, 1.4, '#5E6875')
    polygon(circle3d(c, uDir, [0, 0, 1], 0.08 * q, 14), '#3A414B')
  }
  // far legs and actuators first, then the body, then the near side
  for (const [hu, hv] of hips.slice(0, 2)) {
    leg(hu, hv, false)
    actuator(hu, hv, false)
  }
  obox(-L, -Wd, BODY_Z, L * 2, Wd * 2, 0.3, ['#4A515C', '#2E333A', '#3A414B'])
  // battery lid on top, and the front sensor plate with two "eyes"
  obox(-L + 0.25, -Wd + 0.06, BODY_Z + 0.3, L * 2 - 0.55, Wd * 2 - 0.12, 0.05, ['#5E6875', '#3A414B', '#4A515C'])
  const eye1 = S(L + 0.01, -0.08, BODY_Z + 0.17)
  const eye2 = S(L + 0.01, 0.08, BODY_Z + 0.17)
  if (along === 'x') {
    circle(eye1, 2.4, '#9AD8F5')
    circle(eye2, 2.4, '#9AD8F5')
  }
  // a little SOBJO yellow stripe down the side
  line(S(-L + 0.2, Wd + 0.001, BODY_Z + 0.15), S(L - 0.3, Wd + 0.001, BODY_Z + 0.15), 2.5, YELLOW[1])
  for (const [hu, hv] of hips.slice(2)) {
    leg(hu, hv, true)
    actuator(hu, hv, true)
  }
}

// ------------------------------------------------------------------ idea (napkin sketch)

/** A paper napkin with a ballpoint sketch on it and a pen beside it, for projects that are still ideas. */
function drawNapkin(x: number, y: number, z: number, seed: number, along: 'x' | 'y') {
  const turn = seed % 2 ? 0.25 : -0.18
  const c = Math.cos(turn)
  const s = Math.sin(turn)
  const P = (u: number, v: number, h = 0.02): Pt => {
    const ru = u * c - v * s
    const rv = u * s + v * c
    return along === 'x' ? iso(x + ru, y + rv, z + h) : iso(x + rv, y - ru, z + h)
  }
  deskShadow(x, y, z, 0.7, 0.08)
  polygon([P(-0.55, -0.55), P(0.55, -0.55), P(0.55, 0.55), P(-0.55, 0.55)], '#FFFFFF')
  line(P(0, -0.53, 0.03), P(0, 0.53, 0.03), 1, '#E6E1D8')
  const ink = '#3B6FB6'
  if (seed % 2 === 0) {
    // a gear with a question mark
    const pts: Pt[] = []
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      const r = i % 2 ? 0.3 : 0.24
      pts.push(P(-0.05 + Math.cos(a) * r, Math.sin(a) * r, 0.03))
    }
    outline(pts, 1.3, ink)
    outline(
      Array.from({ length: 12 }, (_, i) => P(-0.05 + Math.cos((i / 12) * Math.PI * 2) * 0.09, Math.sin((i / 12) * Math.PI * 2) * 0.09, 0.03)),
      1.2,
      ink,
    )
  } else {
    // a little wheeled robot with an arrow
    outline([P(-0.3, -0.25, 0.03), P(0.2, -0.25, 0.03), P(0.2, 0.05, 0.03), P(-0.3, 0.05, 0.03)], 1.3, ink)
    for (const cu of [-0.2, 0.1])
      outline(
        Array.from({ length: 10 }, (_, i) => P(cu + Math.cos((i / 10) * Math.PI * 2) * 0.09, 0.13 + Math.sin((i / 10) * Math.PI * 2) * 0.09, 0.03)),
        1.2,
        ink,
      )
    line(P(0.25, 0.32, 0.03), P(0.45, 0.32, 0.03), 1.2, ink)
    line(P(0.4, 0.27, 0.03), P(0.45, 0.32, 0.03), 1.2, ink)
  }
  // coffee ring and the pen
  outline(
    Array.from({ length: 16 }, (_, i) => P(0.32 + Math.cos((i / 16) * Math.PI * 2) * 0.13, -0.32 + Math.sin((i / 16) * Math.PI * 2) * 0.13, 0.025)),
    1.4,
    '#C9A27A',
    0.6,
  )
  line(P(0.66, -0.4, 0.05), P(0.72, 0.42, 0.05), 4, '#2A2F36')
  line(P(0.715, 0.36, 0.055), P(0.722, 0.46, 0.055), 4, '#3B6FB6')
}

// ------------------------------------------------------------------ decorations

function drawMug(x: number, y: number, z: number) {
  deskShadow(x, y, z, 0.35, 0.12)
  box(x - 0.2, y - 0.2, z, 0.4, 0.4, 0.45, '#5B3A22', '#FBFAF7', '#ECE9E3')
  line(iso(x + 0.2, y, z + 0.35), iso(x + 0.33, y, z + 0.25), 3, '#ECE9E3')
  line(iso(x + 0.33, y, z + 0.25), iso(x + 0.2, y, z + 0.12), 3, '#ECE9E3')
}

/** The laptop, open, screen facing into the room. */
function drawLaptop(x: number, y: number, z: number) {
  deskShadow(x + 0.1, y, z, 0.9, 0.1)
  box(x - 0.45, y - 0.8, z, 1.0, 1.6, 0.07, '#C9CFD6', '#A3ADB9', '#B4BCC6')
  polygon([iso(x - 0.45, y - 0.8, z + 0.07), iso(x - 0.45, y + 0.8, z + 0.07), iso(x - 0.75, y + 0.8, z + 1.15), iso(x - 0.75, y - 0.8, z + 1.15)], '#8C97A4')
  polygon([iso(x - 0.47, y - 0.68, z + 0.17), iso(x - 0.47, y + 0.68, z + 0.17), iso(x - 0.72, y + 0.68, z + 1.05), iso(x - 0.72, y - 0.68, z + 1.05)], '#2A2F36')
  // code on the screen
  const rows: [number, number, string][] = [
    [0.95, 0.6, '#F2BE22'],
    [0.82, 0.9, '#9AD8F5'],
    [0.69, 0.5, '#7FA88C'],
    [0.56, 0.75, '#9AD8F5'],
    [0.43, 0.4, '#E07A5F'],
  ]
  for (const [hz, len, c] of rows) {
    const xx = x - 0.47 - (hz - 0.17) * (0.25 / 0.88)
    line(iso(xx, y - 0.55, z + hz), iso(xx, y - 0.55 + len, z + hz), 1.8, c)
  }
  // keyboard and trackpad
  polygon([iso(x - 0.35, y - 0.65, z + 0.075), iso(x + 0.15, y - 0.65, z + 0.075), iso(x + 0.15, y + 0.65, z + 0.075), iso(x - 0.35, y + 0.65, z + 0.075)], '#DDE2E7')
  polygon([iso(x + 0.25, y - 0.25, z + 0.075), iso(x + 0.48, y - 0.25, z + 0.075), iso(x + 0.48, y + 0.25, z + 0.075), iso(x + 0.25, y + 0.25, z + 0.075)], '#C3CCD6')
}

/** The yellow desk lamp at the far end of the desk. */
function drawLamp(x: number, y: number, z: number) {
  const base = iso(x, y, z)
  raw(`<ellipse cx="${n1(base[0])}" cy="${n1(base[1])}" rx="15" ry="7.5" fill="#2A2F36"/>`)
  raw(`<ellipse cx="${n1(base[0])}" cy="${n1(base[1] - 2.5)}" rx="15" ry="7.5" fill="#3A414B"/>`)
  const elbow = iso(x + 0.25, y + 0.15, z + 1.3)
  const head = iso(x - 0.35, y + 0.35, z + 1.85)
  line(iso(x, y, z + 0.1), elbow, 3.5, STEEL[2])
  line(elbow, head, 3.5, STEEL[2])
  circle(elbow, 3.5, '#3A414B')
  raw(
    `<g transform="translate(${n1(head[0])} ${n1(head[1])}) rotate(28)">` +
      `<path d="M-6 -7L8 -7L15 9L-13 9Z" fill="${YELLOW[1]}"/><path d="M1 -7L8 -7L15 9L1 9Z" fill="${YELLOW[2]}"/>` +
      `<ellipse cx="1" cy="9" rx="14" ry="4" fill="#FFF3BF"/></g>`,
  )
}

// ------------------------------------------------------------------ project icons

/** The same floor slab colors as the small project drawings (`IsoArt`). */
const SLAB = ['#EEF2F5', '#B5BFCB', '#C9D2DC']

/**
 * The Cubli or the Cheetah, standing still on a floor slab, as SVG markup for the project
 * thumbnails. The viewBox is framed like the other `IsoArt` drawings (120 × 96, slab centered
 * a little below the middle), so they can be swapped in at the same size.
 */
export function drawProjectIcon(kind: 'cube' | 'cheetah') {
  const x = 50
  const y = 50
  /** Half the slab's side: kept small so the robot fills the picture. */
  const half = kind === 'cube' ? 1.0 : 1.45
  startLayer()
  box(x - half, y - half, -0.18, half * 2, half * 2, 0.18, SLAB[0], SLAB[1], SLAB[2])
  if (kind === 'cube') drawCubli(x, y, 0, 0)
  else drawCheetah(x + 0.15, y, 0, 0, 'x')
  const markup = finishLayer()
  // the slab spans 96 of the 120 units across, like the IsoArt slab
  const s = (half * 4 * 0.866 * UNIT_PX) / 96
  const c = iso(x, y, 0)
  const viewBox = [c[0] - 60 * s, c[1] - 60 * s, 120 * s, 96 * s].map(n1).join(' ')
  return { markup, viewBox }
}
