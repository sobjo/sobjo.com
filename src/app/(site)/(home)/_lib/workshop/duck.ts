/*
 * The Microduck: a little bipedal duck robot that waddles laps around the track
 * on the rug. Easter egg: press W, A, S or D to take over and walk it anywhere on
 * the floor. Leave the keys alone for a few seconds and it walks back to its lap.
 */

import { DUCK_BOUNDS, TRACK_LEN, clamp, iso, n1, trackAt } from './geometry'
import { raw } from './svg'

/** Walking speed on its own, and when you steer it, in workshop units per second. */
const LAP_SPEED = 0.95
const DRIVE_SPEED = 2.6
/** Seconds without a key press before it goes back to its lap. */
const IDLE_RETURN = 4
/** Steps per workshop unit walked. */
const STRIDE = 4.2

export type DuckMode = 'lap' | 'driven' | 'return'

export interface Duck {
  mode: DuckMode
  /** How far along the track it is, while lapping. */
  dist: number
  x: number
  y: number
  /** Which way it faces on screen. */
  faceRight: boolean
  /** Where it is in its step cycle (radians), and how much it is walking (0 standing, 1 walking). */
  phase: number
  walk: number
  /** Seconds since the last key press while driven. */
  idle: number
  /** Seconds the "you're driving" tag has been showing; stops showing after a while. */
  tagT: number
}

export function createDuck(): Duck {
  const p = trackAt(TRACK_LEN * 0.62)
  return { mode: 'lap', dist: TRACK_LEN * 0.62, x: p.x, y: p.y, faceRight: false, phase: 0, walk: 1, idle: 0, tagT: 99 }
}

/** The keys currently held, as screen directions. */
export interface DuckKeys {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

/** Moves the duck by `dt` seconds. `still` stops it (reduced motion). */
export function stepDuck(d: Duck, dt: number, keys: DuckKeys, still: boolean) {
  const steering = keys.up || keys.down || keys.left || keys.right
  if (steering && d.mode !== 'driven') {
    d.mode = 'driven'
    d.tagT = 0
  }
  d.tagT += dt
  let vx = 0
  let vy = 0
  if (d.mode === 'driven') {
    // W/S move up/down the screen and A/D left/right, whatever the room's angle
    const sx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
    const sy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0)
    if (sx || sy) {
      d.idle = 0
      // screen right is +x −y in the room, screen down is +x +y
      let rx = sx * 0.5 + sy
      let ry = -sx * 0.5 + sy
      const len = Math.hypot(rx, ry)
      rx /= len
      ry /= len
      vx = rx * DRIVE_SPEED
      vy = ry * DRIVE_SPEED
    } else {
      d.idle += dt
      if (d.idle > IDLE_RETURN) d.mode = 'return'
    }
  } else if (d.mode === 'return') {
    // head for the nearest point on the track, then carry on lapping from there
    let best = 0
    let bd = Infinity
    for (let i = 0; i < 64; i++) {
      const p = trackAt((i / 64) * TRACK_LEN)
      const dd = Math.hypot(p.x - d.x, p.y - d.y)
      if (dd < bd) {
        bd = dd
        best = (i / 64) * TRACK_LEN
      }
    }
    const p = trackAt(best)
    if (bd < 0.12) {
      d.mode = 'lap'
      d.dist = best
    } else {
      vx = ((p.x - d.x) / bd) * LAP_SPEED * 1.3
      vy = ((p.y - d.y) / bd) * LAP_SPEED * 1.3
    }
  }
  if (d.mode === 'lap' && !still) {
    d.dist = (d.dist + LAP_SPEED * dt) % TRACK_LEN
    const p = trackAt(d.dist)
    vx = (p.x - d.x) / Math.max(dt, 1e-4)
    vy = (p.y - d.y) / Math.max(dt, 1e-4)
    d.x = p.x
    d.y = p.y
  } else {
    d.x = clamp(d.x + vx * dt, DUCK_BOUNDS.x0, DUCK_BOUNDS.x1)
    d.y = clamp(d.y + vy * dt, DUCK_BOUNDS.y0, DUCK_BOUNDS.y1)
  }
  const speed = Math.hypot(vx, vy)
  const moving = speed > 0.05 && !still
  if (moving) {
    d.phase += speed * dt * STRIDE
    const screenDx = vx - vy
    if (Math.abs(screenDx) > 0.02) d.faceRight = screenDx > 0
  }
  d.walk += ((moving ? 1 : 0) - d.walk) * Math.min(1, dt * 8)
}

/**
 * Draws the duck standing at its spot on the floor, in side view like the real Microduck:
 * a rounded white head with an orange rim, a gray side panel and a yellow ring camera eye,
 * a neck of stacked black servos, a white boxy torso, black hip servos with white thigh
 * covers, black shins, and black boots with orange and yellow soles. It bobs, rocks and
 * nods as it waddles.
 */
export function drawDuck(d: Duck) {
  const g = iso(d.x, d.y, 0)
  const s = Math.sin(d.phase)
  const w = d.walk
  const bob = -Math.abs(Math.cos(d.phase)) * 2 * w
  const rock = s * 4 * w
  const leg = (side: 1 | -1) => {
    const near = side > 0
    const swing = s * side * w
    const lift = Math.max(0, Math.cos(d.phase + (near ? 0 : Math.PI))) * 3.5 * w
    const hip: [number, number] = [side * 1.5, -27 + bob]
    const ankle: [number, number] = [hip[0] + swing * 6, -6 - lift]
    const knee: [number, number] = [(hip[0] + ankle[0]) / 2 + 3, -16 + bob * 0.5 - lift * 0.4]
    const black = near ? '#24272C' : '#17191C'
    const white = near ? '#F4F4F2' : '#DADCDF'
    return (
      // shin, then the boot with its two-tone sole
      `<path d="M${n1(knee[0])} ${n1(knee[1])}L${n1(ankle[0])} ${n1(ankle[1])}" stroke="${black}" stroke-width="6" stroke-linecap="round"/>` +
      `<path d="M${n1(ankle[0] - 7)} ${n1(ankle[1] + 1.5)}q0 -4 4 -4h7q4 0 5 3l1 2.5z" fill="${black}"/>` +
      `<path d="M${n1(ankle[0] - 8)} ${n1(ankle[1] + 1.5)}h18q2 0 2 2v1.5h-20z" fill="${near ? '#F07A1A' : '#C9620F'}"/>` +
      `<path d="M${n1(ankle[0] - 8)} ${n1(ankle[1] + 4.5)}h20q0 2 -2 2.4h-18z" fill="${near ? '#F5C518' : '#CFA411'}"/>` +
      // knee servo and the white thigh cover
      `<rect x="${n1(knee[0] - 3.5)}" y="${n1(knee[1] - 3.5)}" width="7" height="7" rx="1.5" fill="${black}"/>` +
      `<circle cx="${n1(knee[0])}" cy="${n1(knee[1])}" r="1.6" fill="#8C97A4"/>` +
      `<path d="M${n1(hip[0] - 5)} ${n1(hip[1] - 2)}q5 -3 10 0l-1 9q-3 5 -7 4z" transform="rotate(${n1(swing * 14)} ${n1(hip[0])} ${n1(hip[1])})" fill="${white}" stroke="#C9CDD2" stroke-width="0.8"/>` +
      `<circle cx="${n1(hip[0])}" cy="${n1(hip[1])}" r="2.4" fill="#5E6875"/>`
    )
  }
  const nod = Math.cos(d.phase * 2) * 1.4 * w
  raw(
    `<g transform="translate(${n1(g[0])} ${n1(g[1])}) scale(${d.faceRight ? 1.25 : -1.25} 1.25)">` +
      `<ellipse cx="1" cy="0" rx="17" ry="5" fill="#1C2128" opacity="0.16"/>` +
      `<g transform="rotate(${n1(rock)} 0 0)">` +
      leg(-1) +
      `<g transform="translate(0 ${n1(bob)})">` +
      // hip servos under the torso
      `<rect x="-8" y="-32" width="16" height="7" rx="1.5" fill="#24272C"/>` +
      // torso: a white rounded box with a seam
      `<rect x="-9" y="-46" width="18" height="15" rx="4" fill="#F4F4F2"/>` +
      `<rect x="-9" y="-36" width="18" height="5" rx="2" fill="#DADCDF"/>` +
      `<path d="M-1 -45v13" stroke="#D0D3D7" stroke-width="0.8"/>` +
      // neck: two stacked black servos
      `<g transform="translate(${n1(nod * 0.3)} 0)">` +
      `<rect x="-5" y="-52" width="8" height="7" rx="1.5" fill="#24272C"/>` +
      `<rect x="-3" y="-58" width="8" height="7" rx="1.5" fill="#2E3238"/>` +
      `<circle cx="1" cy="-48.5" r="1.3" fill="#8C97A4"/><circle cx="1" cy="-54.5" r="1.3" fill="#8C97A4"/>` +
      `</g>` +
      // head: rounded white shell with an orange rim, gray side panel and ring eye
      `<g transform="rotate(${n1(nod)} 0 -58)">` +
      `<path d="M-15 -60q-2 -17 13 -19q20 -2 24 12l0.5 7q0 4 -4 4h-30q-3.5 0 -3.5 -4z" fill="#F07A1A"/>` +
      `<path d="M-15.4 -60.5q-1.6 -16.5 13.4 -18.5q20 -2 24 12l0.5 6.5z" fill="#F7F7F5"/>` +
      `<path d="M-9 -71.5q11 -3.5 23 -1q4 3 4 10h-27.5q-2 -5 0.5 -9z" fill="#B9BDC2"/>` +
      `<circle cx="10" cy="-66.5" r="4.6" fill="none" stroke="#F5B800" stroke-width="3.2"/>` +
      `<circle cx="10" cy="-66.5" r="1.8" fill="#2A2F36"/>` +
      `<circle cx="18.5" cy="-67" r="1.1" fill="#1C2128"/>` +
      `</g>` +
      `</g>` +
      leg(1) +
      `</g></g>`,
  )
  // a little tag the first few seconds after you take over
  if (d.mode === 'driven' && d.tagT < 2.4) {
    const o = Math.min(1, (2.4 - d.tagT) / 0.4)
    const label = 'YOU HAVE THE DUCK'
    const tw = label.length * 6.4 + 20
    raw(
      `<g opacity="${n1(o)}"><rect x="${n1(g[0] - tw / 2)}" y="${n1(g[1] - 118)}" width="${n1(tw)}" height="18" rx="9" fill="#FF9500"/>` +
        `<text x="${n1(g[0])}" y="${n1(g[1] - 105.5)}" text-anchor="middle" class="mono" font-size="9.5" font-weight="700" fill="#1C2128">${label}</text></g>`,
    )
  }
}
