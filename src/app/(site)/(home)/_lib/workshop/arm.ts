/*
 * The robot claw. It hangs on a rod from a trolley that runs along the top edge of the
 * hero, so it can follow the pointer anywhere, not just over the room. It is drawn in
 * screen pixels on its own <svg> laid over the whole hero.
 */

import { clamp, n1 } from './geometry'

type P = [number, number]

export interface ArmPose {
  /** Width of the hero, in pixels. */
  w: number
  /** Where the claw's fingertips are. */
  tip: P
  /** 0 open, 1 closed. */
  grip: number
  /** How far the rod leans while the trolley moves, in degrees (positive leans the claw right). */
  tilt: number
  /** Size of the claw relative to the room drawing, so it matches the projects it picks up. */
  clawScale: number
}

/** Distance from the bottom of the rod down to the fingertips, before scaling. */
const CLAW_LEN = 48

/** Interpolates between two numbers. */
function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** One curved claw finger. `side` is -1 for the left finger, 1 for the right; `g` is the grip (0 open, 1 closed). */
function finger(side: 1 | -1, g: number) {
  const c1x = side * mix(22, 13, g)
  const c2x = side * mix(25, 14, g)
  const tx = side * mix(12, 5, g)
  const d = `M${n1(side * 5)} 16C${n1(c1x)} 22 ${n1(c2x)} 38 ${n1(tx)} ${CLAW_LEN}`
  return (
    `<path d="${d}" fill="none" stroke="#6E7A87" stroke-width="6.5" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="#E3E8ED" stroke-width="2.6" stroke-linecap="round"/>`
  )
}

/** Returns the claw's SVG markup. `held` is markup for whatever it is carrying, centered on the fingertips, drawn between the fingers. */
export function drawArm(pose: ArmPose, held = '') {
  const cs = clamp(pose.clawScale, 0.75, 1.4)
  const tilt = clamp(pose.tilt, -14, 14)
  const rad = (tilt * Math.PI) / 180
  // the rod hangs from the trolley; the claw sits at its lower end
  /** From the trolley down to the fingertips, along the rod. When the claw lifts away it slides up past the trolley and out of sight. */
  const reach = (pose.tip[1] - 8) / Math.cos(rad)
  const clawY = reach - CLAW_LEN * cs
  const rod = Math.max(0, clawY + 4)
  const top: P = [pose.tip[0] - Math.sin(rad) * reach, 0]
  const out: string[] = []
  out.push(`<g transform="translate(${n1(top[0])} 8) rotate(${n1(-tilt)})">`)
  out.push(`<rect x="-2.6" y="0" width="5.2" height="${n1(rod)}" fill="#A3ADB9"/><rect x="-1.2" y="0" width="1.4" height="${n1(rod)}" fill="#E3E8ED"/>`)
  out.push(`<g transform="translate(0 ${n1(clawY)}) scale(${n1(cs)})">`)
  out.push(`<rect x="-11" y="0" width="22" height="11" rx="2.5" fill="#8C97A4"/><rect x="-11" y="0" width="22" height="4" rx="2" fill="#B4BCC6"/>`)
  out.push('</g>')
  if (held) out.push(`<g transform="translate(0 ${n1(reach)})">${held}</g>`)
  out.push(`<g transform="translate(0 ${n1(clawY)}) scale(${n1(cs)})">`)
  out.push(finger(-1, pose.grip))
  out.push(finger(1, pose.grip))
  out.push(`<circle cx="0" cy="15" r="9" fill="#E07A5F"/><circle cx="0" cy="15" r="9" fill="none" stroke="#C2523C" stroke-width="1.5"/><circle cx="0" cy="15" r="3.6" fill="#FBFAF7"/>`)
  out.push('</g></g>')
  // rail along the top edge and the trolley riding it, drawn last so the claw can retract behind it
  out.push(`<rect x="0" y="0" width="${n1(pose.w)}" height="4" fill="#C3CCD6"/>`)
  out.push(`<rect x="${n1(top[0] - 20)}" y="0" width="40" height="11" rx="3" fill="#3A414B"/><rect x="${n1(top[0] - 20)}" y="0" width="40" height="4" fill="#5E6875"/>`)
  return out.join('')
}
