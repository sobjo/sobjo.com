/*
 * What sits on the desk: one item per project, drawn to look like the real build,
 * and nothing else: every item on the desk links to its project.
 *
 * Projects come from the CMS. Each project's `illustration` picks its drawing:
 *   cube     the Cubli, a cube frame balancing on one corner with three reaction wheels
 *   miniq    MiniQ, a miniature Cubli; it always sits right next to the big one
 *   kvm      the KVM board, a flash-drive-sized Linux board with a USB plug on one end
 *   cheetah  the Cheetah, a quadruped robot dog with knee-back legs and hip actuators
 *   idea     a napkin sketch with a pen, for projects that are still ideas (a storage rack, then a house)
 */

import { DESK_ARMS, DESK_Z, UNIT_PX, YELLOW, iso, n1, type Pt, type Vec3 } from './geometry'
import { box, circle, circle3d, finishLayer, line, outline, polygon, raw, startLayer } from './svg'

/** The bits of a project the hero needs. */
export interface DeskProject {
  slug: string
  title: string
  illustration: 'cheetah' | 'cube' | 'miniq' | 'kvm' | 'idea'
}

/** A project on the desk, linking to its page. */
export interface DeskItem {
  id: string
  name: string
  href: string
  /** Center of its footprint on the desk. */
  x: number
  y: number
  /** How tall it stands, in workshop units. Name tags float just above this. */
  h: number
  /** Draws it at time `t` (seconds), standing on the desk top. `lift` raises it while it is being picked up. */
  draw: (t: number, lift: number) => void
}

/** Places the projects on the desk slots, as many as fit. */
export function buildDeskItems(projects: DeskProject[]): DeskItem[] {
  const items: DeskItem[] = []
  let ideas = 0
  for (const { slug, title, illustration, x, y, along } of layOutDesk(keepMiniQBesideCubli(projects))) {
    const base = { id: slug, name: title, href: `/projects/${slug}`, x, y }
    if (illustration === 'cube') items.push({ ...base, h: 2.0, draw: (t, lift) => drawCubli(x, y, DESK_Z + lift, t) })
    else if (illustration === 'miniq')
      items.push({ ...base, h: 0.95, draw: (t, lift) => drawCubli(x, y, DESK_Z + lift, t + 1.3, MINIQ_EDGE) })
    else if (illustration === 'kvm')
      items.push({ ...base, h: 0.3, draw: (t, lift) => drawKvmBoard(x, y, DESK_Z + lift, t, along) })
    else if (illustration === 'cheetah')
      items.push({ ...base, h: 1.25, draw: (t, lift) => drawCheetah(x, y, DESK_Z + lift, t, along) })
    else {
      const seed = ideas++
      items.push({ ...base, h: 0.35, draw: (_t, lift) => drawNapkin(x, y, DESK_Z + lift, seed, along) })
    }
  }
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
/** How much desk each drawing takes up along the desk, in workshop units. */
const FOOTPRINT: Record<DeskProject['illustration'], number> = { cheetah: 2.9, cube: 1.5, miniq: 0.7, kvm: 1.0, idea: 1.3 }

/** Puts the projects on the desk arms in order, with equal gaps between them and at the ends. */
function layOutDesk(projects: DeskProject[]) {
  const placed: (DeskProject & { x: number; y: number; along: 'x' | 'y' })[] = []
  let next = 0
  for (const arm of DESK_ARMS) {
    const onArm = projects.slice(next, next + arm.max)
    next += onArm.length
    const used = onArm.reduce((sum, p) => sum + FOOTPRINT[p.illustration], 0)
    const gap = Math.max(0, (arm.to - arm.from - used) / (onArm.length + 1))
    let pos = arm.from + gap
    for (const p of onArm) {
      const mid = pos + FOOTPRINT[p.illustration] / 2
      pos += FOOTPRINT[p.illustration] + gap
      placed.push(arm.along === 'x' ? { ...p, x: mid, y: arm.fixed, along: 'x' } : { ...p, x: arm.fixed, y: mid, along: 'y' })
    }
  }
  return placed
}

const CUBLI_EDGE = 1.12
/** MiniQ is the same cube, a bit under half the size. */
const MINIQ_EDGE = 0.5

/** Moves MiniQ (if there is one) to right after the Cubli, so it gets the desk spot beside it. */
function keepMiniQBesideCubli(projects: DeskProject[]): DeskProject[] {
  const cubli = projects.findIndex((p) => p.illustration === 'cube')
  const miniq = projects.findIndex((p) => p.illustration === 'miniq')
  if (cubli < 0 || miniq < 0) return projects
  const rest = projects.filter((_, i) => i !== miniq)
  rest.splice(rest.indexOf(projects[cubli]) + 1, 0, projects[miniq])
  return rest
}

/**
 * The Cubli: an aluminum cube frame balancing on one corner. Three reaction wheels sit
 * on the three faces that meet at that bottom corner, nudged toward it, and keep spinning
 * to hold it upright.
 * `edge` sets its size, so the same drawing makes the small MiniQ.
 */
function drawCubli(x: number, y: number, z: number, t: number, edge = CUBLI_EDGE) {
  /** Line widths shrink with the cube, but not so far that the frame disappears. */
  const k = Math.max(edge / CUBLI_EDGE, 0.55)
  const diag = edge * Math.sqrt(3)
  // a tiny wobble, like the controller fighting to stay balanced
  const wob = rotation([1, 0, 0], Math.sin(t * 2.3) * 0.025)
  const R = matmul(matmul(wob, rotation([0, 1, 0], Math.sin(t * 1.7 + 1) * 0.02)), CUBLI_TIP)
  const center: Vec3 = [x, y, z + diag / 2]
  const world = (p: Vec3): Vec3 => {
    const r = mul(R, p)
    return [center[0] + r[0] * edge, center[1] + r[1] * edge, center[2] + r[2] * edge]
  }
  const dir = (p: Vec3): Vec3 => mul(R, p)
  deskShadow(x, y, z, 0.7 * (edge / CUBLI_EDGE), 0.14 + Math.sin(t * 2.3) * 0.01)

  // faces of the cube, as (axis, sign); wheels sit on the three − faces, the ones around the corner it balances on
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
    // thin smoked panel so the frame reads as a solid cube; light enough to see the wheels through
    polygon(quad, front ? '#E9EEF3' : '#B9C3CE', front ? 0.1 : 0.3)
    if (f.sign === -1) {
      // reaction wheel, just inside the face and shifted toward the balance corner, spinning
      const inset = 0.42
      const toCorner = -0.1
      const cw = world([
        f.n[0] * (inset / 0.5) + (u[0] + v[0]) * toCorner,
        f.n[1] * (inset / 0.5) + (u[1] + v[1]) * toCorner,
        f.n[2] * (inset / 0.5) + (u[2] + v[2]) * toCorner,
      ])
      const uw = dir(u)
      const vw = dir(v)
      const rimPts = circle3d(cw, uw, vw, 0.33 * edge, 28)
      // these faces mostly point down and away, so the wheels are seen through the frame
      const wo = front ? 1 : 0.9
      polygon(rimPts, '#D8A35C', wo)
      outline(rimPts, 2 * k, '#A9712E', wo)
      polygon(circle3d(cw, uw, vw, 0.24 * edge, 24), '#E9C38A', wo)
      const spin = t * (5 + f.axis * 1.7) * (f.axis === 1 ? -1 : 1)
      for (let s = 0; s < 3; s++) {
        const a = spin + (s * Math.PI * 2) / 3
        const r = 0.24 * edge
        const tip = iso(
          cw[0] + (uw[0] * Math.cos(a) + vw[0] * Math.sin(a)) * r,
          cw[1] + (uw[1] * Math.cos(a) + vw[1] * Math.sin(a)) * r,
          cw[2] + (uw[2] * Math.cos(a) + vw[2] * Math.sin(a)) * r,
        )
        line(iso(cw[0], cw[1], cw[2]), tip, 2.2 * k, '#A9712E', wo)
      }
      circle(iso(cw[0], cw[1], cw[2]), 3.2 * k, '#2A2F36', wo)
    }
    // the four aluminum edges of this face
    for (let e = 0; e < 4; e++) {
      const a = quad[e]
      const b = quad[(e + 1) % 4]
      line(a, b, (front ? 4.2 : 3.4) * k, front ? '#7E8A97' : '#9AA5B1')
      line(a, b, (front ? 2.2 : 1.6) * k, front ? '#D5DBE2' : '#C3CCD6')
    }
  }
  // the corner it balances on, and a status LED on top
  const bottom = world([-0.5, -0.5, -0.5])
  circle(iso(bottom[0], bottom[1], bottom[2]), 3 * k, '#5E6875')
  const top = world([0.5, 0.5, 0.5])
  circle(iso(top[0], top[1], top[2]), 3.2 * k, '#5E6875')
  circle(iso(top[0], top[1], top[2]), 1.6 * k, Math.sin(t * 4) > 0 ? '#5FD38D' : '#3FA86A')
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
  const ring = (cu: number, cv: number, r: number, n = 12): Pt[] =>
    Array.from({ length: n }, (_, i) => P(cu + Math.cos((i / n) * Math.PI * 2) * r, cv + Math.sin((i / n) * Math.PI * 2) * r, 0.03))
  if (seed % 2 === 0) {
    // a storage rack: a 3 × 3 grid of bins, a gantry rail along the top, and a carriage dropping into a bin
    const u0 = -0.42
    const u1 = 0.12
    const v0 = -0.12
    const v1 = 0.4
    outline([P(u0, v0, 0.03), P(u1, v0, 0.03), P(u1, v1, 0.03), P(u0, v1, 0.03)], 1.3, ink)
    for (let i = 1; i < 3; i++) {
      const u = u0 + ((u1 - u0) * i) / 3
      const v = v0 + ((v1 - v0) * i) / 3
      line(P(u, v0, 0.03), P(u, v1, 0.03), 1, ink)
      line(P(u0, v, 0.03), P(u1, v, 0.03), 1, ink)
    }
    line(P(u0 - 0.04, v0 - 0.2, 0.03), P(u1 + 0.04, v0 - 0.2, 0.03), 1.3, ink)
    outline([P(-0.2, v0 - 0.25, 0.03), P(-0.1, v0 - 0.25, 0.03), P(-0.1, v0 - 0.15, 0.03), P(-0.2, v0 - 0.15, 0.03)], 1.2, ink)
    line(P(-0.15, v0 - 0.13, 0.03), P(-0.15, v0 + 0.08, 0.03), 1.2, ink)
    line(P(-0.19, v0 + 0.04, 0.03), P(-0.15, v0 + 0.08, 0.03), 1.2, ink)
    line(P(-0.11, v0 + 0.04, 0.03), P(-0.15, v0 + 0.08, 0.03), 1.2, ink)
  } else {
    // a house with a chat bubble: the home that runs itself
    outline([P(-0.36, 0.38, 0.03), P(-0.36, 0.02, 0.03), P(-0.14, -0.2, 0.03), P(0.08, 0.02, 0.03), P(0.08, 0.38, 0.03)], 1.3, ink)
    outline([P(-0.2, 0.38, 0.03), P(-0.2, 0.2, 0.03), P(-0.08, 0.2, 0.03), P(-0.08, 0.38, 0.03)], 1.1, ink)
    outline([P(-0.32, 0.1, 0.03), P(-0.24, 0.1, 0.03), P(-0.24, 0.18, 0.03), P(-0.32, 0.18, 0.03)], 1, ink)
    outline(ring(0.24, 0.12, 0.13, 16), 1.2, ink)
    line(P(0.15, 0.2, 0.03), P(0.09, 0.27, 0.03), 1.2, ink)
    for (const du of [-0.05, 0, 0.05]) circle(P(0.24 + du, 0.12, 0.03), 1.1, ink)
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

// ------------------------------------------------------------------ KVM board

/**
 * The KVM board: a flash-drive-sized Linux KVM in its case. A graphite stick with a yellow
 * band and a status LED on top, an HDMI port on its side, and a steel USB-A plug on the
 * front end. `along` is the direction the plug points.
 */
function drawKvmBoard(x: number, y: number, z: number, t: number, along: 'x' | 'y') {
  /** A box in stick coordinates: u runs toward the plug, v across the stick. */
  const part = (u: number, v: number, h: number, du: number, dv: number, dh: number, top: string, a: string, b: string) =>
    along === 'x' ? box(x + u, y + v, z + h, du, dv, dh, top, a, b) : box(x + v, y - u - du, z + h, dv, du, dh, top, a, b)
  const at = (u: number, v: number, h: number): Pt => (along === 'x' ? iso(x + u, y + v, z + h) : iso(x + v, y - u, z + h))
  const onTop = (u0: number, v0: number, u1: number, v1: number) => [at(u0, v0, H + 0.002), at(u1, v0, H + 0.002), at(u1, v1, H + 0.002), at(u0, v1, H + 0.002)]
  const onSide = (u0: number, h0: number, u1: number, h1: number) => [at(u0, W / 2 + 0.002, h0), at(u1, W / 2 + 0.002, h0), at(u1, W / 2 + 0.002, h1), at(u0, W / 2 + 0.002, h1)]
  const L = 0.74
  const W = 0.3
  const H = 0.13
  const back = -L / 2 - 0.1
  deskShadow(x + 0.05, y, z, 0.42, 0.14)
  // the case, with a lighter inset panel on top
  part(back, -W / 2, 0, L, W, H, '#3E4650', '#262B32', '#30363E')
  polygon(onTop(back + 0.04, -W / 2 + 0.04, back + L - 0.04, W / 2 - 0.04), '#4A535E')
  // yellow band near the back, and the status LED in front of it
  polygon(onTop(back + 0.1, -W / 2, back + 0.15, W / 2), YELLOW[1])
  polygon([at(back + 0.1, W / 2 + 0.002, H), at(back + 0.15, W / 2 + 0.002, H), at(back + 0.15, W / 2 + 0.002, 0), at(back + 0.1, W / 2 + 0.002, 0)], YELLOW[2])
  const on = Math.sin(t * 3.1) > 0.2
  if (on) circle(at(back + 0.24, 0, H), 3.4, '#5FD38D', 0.35)
  circle(at(back + 0.24, 0, H), 1.7, on ? '#7BF0A6' : '#2E7D5B')
  // three vent slots
  for (const v of [-0.06, 0, 0.06]) line(at(back + 0.36, v, H + 0.003), at(back + 0.6, v, H + 0.003), 1.4, '#2A2F36', 0.8)
  // HDMI port on the side facing the room
  polygon(onSide(back + 0.2, 0.03, back + 0.42, 0.1), '#15191E')
  polygon(onSide(back + 0.22, 0.05, back + 0.4, 0.08), '#5E6875')
  // the steel USB-A plug on the front end, with its two contact windows
  part(back + L, -0.11, 0.025, 0.24, 0.22, 0.085, '#E8ECF0', '#A3ADB9', '#C3CCD6')
  for (const v of [-0.07, 0.02]) {
    const u0 = back + L + 0.06
    polygon([at(u0, v, 0.111), at(u0 + 0.12, v, 0.111), at(u0 + 0.12, v + 0.05, 0.111), at(u0, v + 0.05, 0.111)], '#8C97A4')
  }
}

// ------------------------------------------------------------------ project icons

/** The project drawings that have a picture version. */
export type ProjectIconKind = 'cube' | 'miniq' | 'cheetah' | 'kvm'

/** How much floor each picture frames around its drawing: smaller frames zoom in on small things. */
const ICON_HALF: Record<ProjectIconKind, number> = { cube: 1.0, miniq: 0.55, cheetah: 1.45, kvm: 0.58 }

/**
 * A project's desk drawing (Cubli, MiniQ, Cheetah or KVM board), standing still with no
 * floor slab under it, as SVG markup for the project pictures. The viewBox is framed like the other `IsoArt` drawings
 * (120 × 96), so they can be swapped in at the same size.
 */
export function drawProjectIcon(kind: ProjectIconKind) {
  const x = 50
  const y = 50
  /** Half the width of the framed floor area: kept small so the robot fills the picture. */
  const half = ICON_HALF[kind]
  startLayer()
  if (kind === 'cube') drawCubli(x, y, 0, 0)
  else if (kind === 'miniq') drawCubli(x, y, 0, 1.3, MINIQ_EDGE)
  else if (kind === 'kvm') drawKvmBoard(x - 0.05, y, 0, 0, 'x')
  else drawCheetah(x + 0.15, y, 0, 0, 'x')
  const markup = finishLayer()
  // frame the same floor area a 120-unit IsoArt tile would show, centered on the drawing itself
  const s = (half * 4 * 0.866 * UNIT_PX) / 96
  const [cx, cy] = drawingCenter(markup)
  const viewBox = [cx - 60 * s, cy - 48 * s, 120 * s, 96 * s].map(n1).join(' ')
  return { markup, viewBox }
}

/**
 * The middle of the solid shapes in some markup (paths, circles and ellipses), leaving out
 * see-through shadows so the object itself, not its shadow, lands in the center of the picture.
 */
function drawingCenter(markup: string): [number, number] {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const add = (px: number, py: number) => {
    minX = Math.min(minX, px)
    maxX = Math.max(maxX, px)
    minY = Math.min(minY, py)
    maxY = Math.max(maxY, py)
  }
  for (const [tag] of markup.matchAll(/<(path|circle|ellipse)\b[^>]*>/g)) {
    const attr = (name: string) => Number(new RegExp(` ${name}="([^"]*)"`).exec(tag)?.[1] ?? NaN)
    const opacity = attr('opacity')
    if (opacity < 0.5) continue
    if (tag.startsWith('<path')) {
      const d = / d="([^"]*)"/.exec(tag)?.[1] ?? ''
      for (const [, px, py] of d.matchAll(/(-?[\d.]+)[ ,](-?[\d.]+)/g)) add(Number(px), Number(py))
    } else {
      const rx = tag.startsWith('<circle') ? attr('r') : attr('rx')
      const ry = tag.startsWith('<circle') ? attr('r') : attr('ry')
      add(attr('cx') - rx, attr('cy') - ry)
      add(attr('cx') + rx, attr('cy') + ry)
    }
  }
  return [(minX + maxX) / 2, (minY + maxY) / 2]
}
