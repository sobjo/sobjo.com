/*
 * Where everything in the workshop sits, and how workshop positions map to the screen.
 *
 * Positions are in workshop units: x runs along the back (right-hand) wall, y runs
 * along the left wall toward the viewer, and z is height above the floor.
 * `iso(x, y, z)` turns that into SVG pixels on the isometric drawing.
 */

/** A point on screen, in SVG pixels. */
export type Pt = [number, number]
/** A point in the workshop, in workshop units (x, y, z). */
export type Vec3 = [number, number, number]

// ------------------------------------------------------------------ projection

/** Screen position of the workshop's (0, 0, 0) corner. */
const ORIGIN_X = 960
const ORIGIN_Y = 300
/** Pixels per workshop unit. */
export const UNIT_PX = 28
/** How far one unit along x or y moves across (KX) and down (KY) the screen: cos 30° and sin 30°. */
const KX = UNIT_PX * 0.866
const KY = UNIT_PX * 0.5

/** Workshop position → screen point. */
export function iso(x: number, y: number, z: number): Pt {
  return [ORIGIN_X + (x - y) * KX, ORIGIN_Y + (x + y) * KY - z * UNIT_PX]
}

/** Screen point → the workshop position on the flat plane at height `z`. */
export function unproject(sx: number, sy: number, z: number) {
  const a = (sx - ORIGIN_X) / KX
  const b = (sy - ORIGIN_Y + z * UNIT_PX) / KY
  return { x: (a + b) / 2, y: (b - a) / 2 }
}

/** The part of the drawing the <svg> shows: the room and nothing else. */
export const VIEWBOX = '548 26 824 768'

export function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value
}

/** Rounds to one decimal and prints it, to keep the generated SVG short. */
export function n1(value: number) {
  return (Math.round(value * 10) / 10).toString()
}

// ------------------------------------------------------------------ layout of the room

/** The room: a square floor, ROOM_W wide (x) and ROOM_D deep (y), with walls WALL_H tall. */
export const ROOM_W = 16
export const ROOM_D = 16
export const WALL_H = 9

/**
 * The L-shaped desk in the back corner. One arm runs along the back wall (x from 0 to
 * DESK_BACK_LEN), the other along the left wall (y from 0 to DESK_LEFT_LEN). Both are
 * DESK_D deep, with the top at DESK_Z.
 */
export const DESK_D = 2.2
export const DESK_Z = 2.6
export const DESK_TOP = 0.18
export const DESK_BACK_LEN = 11.4
export const DESK_LEFT_LEN = 10.6

/**
 * Where projects go on the desk. The first few fill the back arm (along x), the rest the
 * left arm (along y). Each arm is a stretch of desk top, and the items on it are spread
 * so the empty space between them (and at both ends) is the same everywhere.
 */
export const DESK_ARMS = [
  { along: 'x', fixed: 1.1, from: 1.8, to: 11.0, max: 4 },
  { along: 'y', fixed: 1.1, from: 2.6, to: 10.4, max: 3 },
] as const

/** The rug and the Microduck's oval track on it. */
export const RUG = { x0: 4.0, y0: 7.0, x1: 15.6, y1: 14.8 }
/** The track's center line: two half circles of TRACK_R around these centers, joined by straights. */
export const TRACK_C0: [number, number] = [7.2, 10.9]
export const TRACK_C1: [number, number] = [12.5, 10.9]
export const TRACK_R = 2.45
export const TRACK_W = 1.15

/** Where the Microduck may walk when you steer it: the open floor in front of the desk. */
export const DUCK_BOUNDS = { x0: 4.2, y0: 5.4, x1: 15.4, y1: 15.4 }

// ------------------------------------------------------------------ shared colors (top, left, right faces of a box)

export const WOOD = ['#E2BC8E', '#C9996A', '#B5855A']
export const WHITE = ['#FBFAF7', '#ECE9E3', '#DEDAD2']
export const STEEL = ['#C9CFD6', '#A3ADB9', '#8C97A4']
export const YELLOW = ['#F8D664', '#F2BE22', '#D9A40F']

// ------------------------------------------------------------------ the track

/** Length of one straight and of the whole loop of the track's center line. */
const TRACK_STRAIGHT = TRACK_C1[0] - TRACK_C0[0]
export const TRACK_LEN = 2 * TRACK_STRAIGHT + 2 * Math.PI * TRACK_R

/**
 * A point `dist` along the track (clockwise on screen, starting at the back-left end of
 * the back straight), moved `off` units outward from the center line. Also returns the
 * direction of travel (dx, dy).
 */
export function trackAt(dist: number, off = 0) {
  let s = ((dist % TRACK_LEN) + TRACK_LEN) % TRACK_LEN
  const r = TRACK_R + off
  const arc = Math.PI * TRACK_R
  if (s < TRACK_STRAIGHT) return { x: TRACK_C0[0] + s, y: TRACK_C0[1] - r, dx: 1, dy: 0 }
  s -= TRACK_STRAIGHT
  if (s < arc) {
    const a = -Math.PI / 2 + s / TRACK_R
    return { x: TRACK_C1[0] + Math.cos(a) * r, y: TRACK_C1[1] + Math.sin(a) * r, dx: -Math.sin(a), dy: Math.cos(a) }
  }
  s -= arc
  if (s < TRACK_STRAIGHT) return { x: TRACK_C1[0] - s, y: TRACK_C1[1] + r, dx: -1, dy: 0 }
  s -= TRACK_STRAIGHT
  const a = Math.PI / 2 + s / TRACK_R
  return { x: TRACK_C0[0] + Math.cos(a) * r, y: TRACK_C0[1] + Math.sin(a) * r, dx: -Math.sin(a), dy: Math.cos(a) }
}
