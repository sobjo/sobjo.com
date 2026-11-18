/*
 * Tiny helpers that write SVG markup as strings.
 *
 * Each layer of the workshop is drawn by calling `startLayer()`, then any of the
 * helpers below (which append to the current layer), then `finishLayer()` to get
 * the markup. Building strings is much cheaper than rendering a few hundred
 * React elements 60 times a second.
 */

import { iso, n1, type Pt, type Vec3 } from './geometry'

/** The markup of the layer being drawn right now. */
let current: string[] = []

export function startLayer() {
  current = []
}

export function finishLayer() {
  return current.join('')
}

/** Tails and the clock's pendulum sway unless the visitor prefers reduced motion. */
let idleAnimations = true

export function setIdleAnimations(on: boolean) {
  idleAnimations = on
}

/** An ` opacity="…"` attribute, or nothing when fully opaque. */
export function opacityAttr(o?: number | null) {
  return o != null && o !== 1 ? ` opacity="${o}"` : ''
}
/** A filled polygon through the given screen points. `fx` is an optional SVG filter, like 'url(#sh-cs)'. */
export function polygon(pts: Pt[], fill: string, o?: number | null, fx?: string) {
  current.push(
    `<path d="M${pts.map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L')}Z" fill="${fill}"${opacityAttr(o)}${fx ? ` filter="${fx}"` : ''}/>`,
  )
}
/** A straight stroke from `a` to `b`, `w` pixels wide. */
export function line(a: Pt, b: Pt, w: number, c: string, o?: number | null, dash?: string) {
  current.push(
    `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${opacityAttr(o)}${dash ? ` stroke-dasharray="${dash}"` : ''}/>`,
  )
}
export function circle(p: Pt, r: number, fill: string, o?: number | null) {
  current.push(`<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${r}" fill="${fill}"${opacityAttr(o)}/>`)
}
/** Adds an SVG snippet as is. */
export function raw(s: string) {
  current.push(s)
}
/**
 * A solid isometric box with its corner at (x, y, z), `w` wide, `d` deep and `h` tall.
 * Only the three faces you can see are drawn: top, left (front-facing) and right.
 */
export function box(x: number, y: number, z: number, w: number, d: number, h: number, top: string, left: string, right: string) {
  polygon([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)], right)
  polygon([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)], left)
  polygon([iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)], top)
}
/** A soft shadow on the floor under a w × d footprint. */
export function shadow(x: number, y: number, w: number, d: number, o?: number) {
  polygon(
    [iso(x - 0.3, y - 0.1, 0), iso(x + w + 0.4, y - 0.1, 0), iso(x + w + 0.4, y + d + 0.5, 0), iso(x - 0.3, y + d + 0.5, 0)],
    '#1C2128',
    o || 0.14,
    'url(#sh-cs)',
  )
}
/** A thin highlight along the two front edges of a box top, so stacked boxes read as separate pieces. */
export function rim(x: number, y: number, z: number, w: number, d: number) {
  line(iso(x, y + d, z), iso(x + w, y + d, z), 1.5, '#FFFFFF', 0.45)
  line(iso(x + w, y, z), iso(x + w, y + d, z), 1.5, '#FFFFFF', 0.3)
}
export function escapeXml(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
}
/** Text drawn flat on the back wall (or the front of something facing the same way). */
export function wallText(p: Pt, txt: string, size: number, fill: string, cls: string) {
  raw(
    `<text transform="matrix(0.866 0.5 0 1 ${n1(p[0])} ${n1(p[1])})" class="${cls}" font-size="${size}" font-weight="700" fill="${fill}">${escapeXml(txt)}</text>`,
  )
}
/** SVG drawn flat on the left wall (x runs toward the back of the room, y down), with its origin at `p`. */
export function onLeftWall(p: Pt, svg: string) {
  raw(`<g transform="matrix(0.866 -0.5 0 1 ${n1(p[0])} ${n1(p[1])})">${svg}</g>`)
}
/** Returns an SVG animation that rocks its parent group back and forth around (cx, cy), or nothing when idle animations are off. */
export function sway(cx: number, cy: number, deg: number, dur: number) {
  if (!idleAnimations) return ''
  return `<animateTransform attributeName="transform" type="rotate" values="${-deg} ${cx} ${cy};${deg} ${cx} ${cy};${-deg} ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>`
}

/** A small heart, `s` times its normal size. */
export function heart(p: Pt, s: number, col: string, o?: number) {
  raw(
    `<path d="M${n1(p[0])} ${n1(p[1] + 6 * s)}l${n1(-8 * s)} ${n1(-7 * s)}c${n1(-5 * s)} ${n1(-5 * s)} ${n1(2 * s)} ${n1(-11 * s)} ${n1(8 * s)} ${n1(-5 * s)}c${n1(6 * s)} ${n1(-6 * s)} ${n1(13 * s)} 0 ${n1(8 * s)} ${n1(5 * s)}z" fill="${col}"${opacityAttr(o)}/>`,
  )
}

/** Screen points around a circle of radius `r` centered on `c`, lying in the plane spanned by unit vectors `u` and `v`. */
export function circle3d(c: Vec3, u: Vec3, v: Vec3, r: number, steps = 24): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const ca = Math.cos(a) * r
    const sa = Math.sin(a) * r
    pts.push(iso(c[0] + u[0] * ca + v[0] * sa, c[1] + u[1] * ca + v[1] * sa, c[2] + u[2] * ca + v[2] * sa))
  }
  return pts
}
/** An outlined (not filled) closed shape through the given screen points. */
export function outline(pts: Pt[], w: number, c: string, o?: number | null) {
  current.push(
    `<path d="M${pts.map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L')}Z" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"${opacityAttr(o)}/>`,
  )
}
