import type { BenchSpot } from '@/lib/types'

/*
 * The isometric bench at the top of the Bench page. `buildBench(active)` returns
 * plain shape data so React can render it; the active spot gets a highlight
 * (a lit knob, a taller print, a busier scope trace and so on).
 */

export interface Shape {
  d: string
  fill: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  filter?: string
}

export interface Label {
  x: number
  y: number
  text: string
  size: number
  fill: string
}

type Pt = [number, number]

const CX = 275
const CY = 150
const S = 22
function iso(x: number, y: number, z: number): Pt {
  return [CX + (x - y) * S * 0.866, CY + (x + y) * S * 0.5 - z * S]
}
function f(n: number) {
  return n.toFixed(1)
}
function poly(pts: Pt[]) {
  return `M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z`
}

/** Where each numbered pin floats above the bench, in bench units. */
const PINS: Record<BenchSpot, [number, number, number]> = {
  psu: [2.5, 1.6, 4.9],
  solder: [4.6, 1.9, 4.2],
  printer: [7.1, 1.7, 6.7],
  scope: [9.9, 1.5, 4.9],
  monitor: [12.1, 1.2, 5.5],
}

/** A numbered pin over one piece of equipment; the number matches its card. */
export interface Pin {
  spot: BenchSpot
  number: number
}

const GRAY = ['#A3ADB9', '#8C97A4', '#76818E']

export function buildBench(active: BenchSpot | null, pins: Pin[]) {
  const out: Shape[] = []
  const labels: Label[] = []
  const P = (pts: Pt[], fill: string, opacity?: number, filter?: string) =>
    out.push({ d: poly(pts), fill, opacity, filter })
  const L = (a: Pt, b: Pt, w: number, c: string, opacity?: number) =>
    out.push({ d: `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`, fill: 'none', stroke: c, strokeWidth: w, opacity })
  const C = (p: Pt, r: number, fill: string) =>
    out.push({ d: `M${f(p[0] - r)} ${f(p[1])}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`, fill })
  const box = (x: number, y: number, z: number, w: number, d: number, h: number, top: string, left: string, right: string) => {
    P([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)], right)
    P([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)], left)
    P([iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)], top)
  }
  const shadow = (x: number, y: number, w: number, d: number, o?: number) =>
    P(
      [iso(x - 0.3, y - 0.1, 0), iso(x + w + 0.4, y - 0.1, 0), iso(x + w + 0.4, y + d + 0.5, 0), iso(x - 0.3, y + d + 0.5, 0)],
      '#1C2128',
      o || 0.14,
      'url(#sb-cs)',
    )
  const on = (id: BenchSpot) => active === id

  // room corner
  box(0, 0, -0.8, 14, 10, 0.8, '#EEF2F5', '#B5BFCB', '#C9D2DC')
  for (let gx = 2; gx < 14; gx += 2) L(iso(gx, 0, 0), iso(gx, 10, 0), 1, '#DCE3EA')
  for (let gy = 2; gy < 10; gy += 2) L(iso(0, gy, 0), iso(14, gy, 0), 1, '#DCE3EA')
  box(0, -0.5, 0, 14, 0.5, 6.4, '#8C97A4', '#DCE3EA', '#C3CCD6')
  box(-0.5, -0.5, 0, 0.5, 10.5, 6.4, '#8C97A4', '#B5BFCB', '#D0D8E1')
  P([iso(0, 0, 0), iso(14, 0, 0), iso(14, 0, 0.4), iso(0, 0, 0.4)], '#C3CCD6')
  P([iso(0, 0, 0), iso(0, 10, 0), iso(0, 10, 0.4), iso(0, 0, 0.4)], '#A3ADB9')

  // side-wall pegboard
  P([iso(0, 2.0, 2.2), iso(0, 7.4, 2.2), iso(0, 7.4, 5.4), iso(0, 2.0, 5.4)], '#E9EEF5')
  for (let py = 2.4; py < 7.2; py += 0.5) for (let pz = 2.6; pz < 5.3; pz += 0.5) C(iso(0, py, pz), 1.1, '#C3CCD6')
  L(iso(0, 3.0, 5.0), iso(0, 3.0, 3.2), 3, '#3B6FB6')
  C(iso(0, 3.0, 5.05), 4.5, '#3B6FB6')
  L(iso(0, 4.0, 5.0), iso(0, 4.0, 3.4), 4, '#F2BE22')
  L(iso(0, 4.0, 3.4), iso(0, 4.0, 2.8), 1.2, '#5E6875')
  L(iso(0, 5.2, 5.0), iso(0, 5.2, 3.3), 2.5, '#2A2F36')
  const ring = iso(0, 6.4, 4.4)
  out.push({ d: `M${f(ring[0])} ${f(ring[1])}a9 10 0 1 0 1 0`, fill: 'none', stroke: '#C2523C', strokeWidth: 2.5 })

  // shelf of parts bins on the back wall
  box(1.0, 0, 5.0, 12.0, 0.9, 0.15, '#F7F9FB', '#C3CCD6', '#A3ADB9')
  const bins = ['#3B6FB6', '#C2523C', '#F2BE22', '#2E7D6B', '#3B6FB6', '#C2523C', '#F2BE22', '#2E7D6B']
  for (let bi = 0; bi < 8; bi++) {
    box(1.3 + bi * 1.45, 0.1, 5.15, 1.2, 0.75, 0.6, '#F7F9FB', bins[bi], bins[bi])
    P(
      [iso(1.5 + bi * 1.45, 0.85, 5.3), iso(2.3 + bi * 1.45, 0.85, 5.3), iso(2.3 + bi * 1.45, 0.85, 5.55), iso(1.5 + bi * 1.45, 0.85, 5.55)],
      '#FFFFFF',
      0.85,
    )
  }

  // workbench
  shadow(0.8, 0.3, 12.6, 2.9, 0.12)
  for (const l of [
    [1.0, 0.5],
    [12.9, 0.5],
    [1.0, 2.8],
    [12.9, 2.8],
  ])
    box(l[0], l[1], 0, 0.3, 0.3, 2.7, GRAY[0], GRAY[1], GRAY[2])
  box(1.0, 0.6, 0.6, 12.2, 2.4, 0.12, '#C3CCD6', '#A3ADB9', '#8C97A4')
  box(0.8, 0.3, 2.7, 12.6, 2.9, 0.25, '#E2BC8B', '#D49A5E', '#B9844A')

  // 1 power supply
  box(1.4, 0.7, 2.95, 2.0, 1.6, 1.3, '#8C97A4', '#A3ADB9', '#76818E')
  P([iso(1.6, 2.3, 3.55), iso(2.7, 2.3, 3.55), iso(2.7, 2.3, 4.05), iso(1.6, 2.3, 4.05)], '#1F242B')
  C(iso(3.0, 2.3, 3.8), 4, on('psu') ? '#F2BE22' : '#5E6875')
  C(iso(1.9, 2.3, 3.25), 2.5, '#C2523C')
  C(iso(2.4, 2.3, 3.25), 2.5, '#1C2128')
  // 2 soldering station
  box(3.9, 1.5, 2.95, 1.2, 1.0, 0.55, '#3A414B', '#5E6875', '#2A2F36')
  C(iso(4.5, 2.5, 3.2), 3, on('solder') ? '#F2BE22' : '#C2523C')
  L(iso(5.0, 1.7, 3.5), iso(5.5, 1.4, 4.4), 3, '#2A2F36')
  L(iso(5.5, 1.4, 4.4), iso(5.6, 1.35, 4.7), 1.5, '#A3ADB9')
  if (on('solder')) L(iso(5.6, 1.35, 4.9), iso(5.5, 1.3, 5.5), 2, '#A3ADB9', 0.6)
  // 3 3D printer
  box(5.9, 0.6, 2.95, 2.6, 2.2, 0.35, '#3A414B', '#2A2F36', '#1F242B')
  box(5.9, 0.6, 3.3, 0.2, 0.2, 2.8, '#3A414B', '#2A2F36', '#1F242B')
  box(8.3, 0.6, 3.3, 0.2, 0.2, 2.8, '#3A414B', '#2A2F36', '#1F242B')
  box(5.9, 0.6, 6.1, 2.6, 0.2, 0.2, '#3A414B', '#2A2F36', '#1F242B')
  box(6.2, 1.0, 3.3, 2.0, 1.6, 0.1, '#C3CCD6', '#A3ADB9', '#8C97A4')
  box(6.8, 1.4, 3.4, 0.8, 0.8, on('printer') ? 1.0 : 0.6, '#F8D664', '#F2BE22', '#D9A40F')
  box(6.85, 0.7, 5.2, 0.6, 0.5, 0.35, '#C2523C', '#A8412D', '#8E3524')
  L(iso(7.15, 0.95, 5.2), iso(7.2, 1.8, on('printer') ? 4.4 : 4.0), 1.5, '#5E6875')
  C(iso(8.9, 0.3, 4.6), 12, '#3B6FB6')
  C(iso(8.9, 0.3, 4.6), 4, '#F7F9FB')
  // 4 oscilloscope
  box(9.0, 0.7, 2.95, 1.9, 1.4, 1.3, '#A3ADB9', '#C3CCD6', '#8C97A4')
  P([iso(9.15, 2.1, 3.25), iso(10.25, 2.1, 3.25), iso(10.25, 2.1, 4.05), iso(9.15, 2.1, 4.05)], '#163A2E')
  const wave: Pt[] = []
  for (let i = 0; i <= 14; i++) {
    const t = i / 14
    wave.push(iso(9.2 + t * 1.0, 2.1, 3.65 + Math.sin(t * Math.PI * (on('scope') ? 6 : 3)) * 0.25))
  }
  out.push({
    d: `M${wave.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}`,
    fill: 'none',
    stroke: '#5FD38D',
    strokeWidth: 1.8,
  })
  C(iso(10.6, 2.1, 3.85), 2.5, '#2A2F36')
  C(iso(10.6, 2.1, 3.4), 2.5, '#2A2F36')
  // 5 computer
  box(11.6, 1.0, 2.95, 0.8, 0.6, 0.12, '#5E6875', '#3A414B', '#2A2F36')
  box(11.9, 1.2, 3.07, 0.2, 0.2, 0.6, '#5E6875', '#3A414B', '#2A2F36')
  box(10.9, 1.1, 3.65, 2.2, 0.15, 1.5, '#3A414B', '#2A2F36', '#1F242B')
  P([iso(11.0, 1.25, 3.75), iso(13.0, 1.25, 3.75), iso(13.0, 1.25, 5.05), iso(11.0, 1.25, 5.05)], on('monitor') ? '#C9E3F9' : '#A9D4F5')
  for (let ln = 0; ln < 4; ln++)
    L(iso(11.2, 1.25, 4.8 - ln * 0.25), iso(11.6 + ((ln * 7) % 5) * 0.25, 1.25, 4.8 - ln * 0.25), 2, ln % 2 ? '#3B6FB6' : '#C2523C')
  box(11.0, 2.2, 2.95, 1.6, 0.6, 0.06, '#F7F9FB', '#DCE3EA', '#C3CCD6')

  // stool in front of the bench
  shadow(6.2, 5.4, 1.4, 1.4, 0.12)
  for (const l of [
    [6.3, 5.5],
    [7.3, 5.5],
    [6.3, 6.5],
    [7.3, 6.5],
  ])
    box(l[0], l[1], 0, 0.2, 0.2, 1.7, GRAY[0], GRAY[1], GRAY[2])
  box(6.1, 5.3, 1.7, 1.6, 1.6, 0.25, '#F2BE22', '#D9A40F', '#B98A0A')

  // parts cart on the right
  shadow(11.0, 5.6, 2.0, 1.6, 0.12)
  box(11.0, 5.6, 0.2, 2.0, 1.6, 2.2, '#C3CCD6', '#DCE3EA', '#A3ADB9')
  for (let dr = 0; dr < 3; dr++) {
    P(
      [iso(11.15, 7.2, 0.45 + dr * 0.7), iso(12.85, 7.2, 0.45 + dr * 0.7), iso(12.85, 7.2, 0.95 + dr * 0.7), iso(11.15, 7.2, 0.95 + dr * 0.7)],
      '#F7F9FB',
    )
    L(iso(11.8, 7.2, 0.75 + dr * 0.7), iso(12.2, 7.2, 0.75 + dr * 0.7), 2, '#5E6875')
  }
  C(iso(11.2, 7.1, 0.1), 3, '#2A2F36')
  C(iso(12.8, 7.1, 0.1), 3, '#2A2F36')
  box(11.3, 5.9, 2.4, 0.8, 0.8, 0.5, '#4E9A85', '#2E7D6B', '#246553')

  // numbered pins
  for (const { spot, number } of pins) {
    const pin = PINS[spot]
    const p = iso(pin[0], pin[1], pin[2])
    const a = on(spot)
    L([p[0], p[1] + 10], [p[0], p[1] + 22], 2, '#1C2128')
    C(p, a ? 14 : 11, a ? '#C2523C' : '#1C2128')
    labels.push({ x: p[0], y: p[1] + 4, text: String(number), size: a ? 13 : 11, fill: a ? '#FFFFFF' : '#F8D664' })
  }
  return { shapes: out, labels }
}
