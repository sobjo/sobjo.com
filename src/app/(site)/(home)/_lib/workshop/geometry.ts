/*
 * Where everything in the workshop sits, and how workshop positions map to the screen.
 *
 * Positions are in workshop units: x runs along the back wall (left to right),
 * y runs from the back wall toward the viewer, and z is height above the floor.
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
const UNIT_PX = 28
/** How far one unit along x or y moves across (KX) and down (KY) the screen: cos 30° and sin 30°. */
const KX = UNIT_PX * 0.866
const KY = UNIT_PX * 0.5

/** Workshop position → screen point. */
export function iso(x: number, y: number, z: number): Pt {
  return [ORIGIN_X + (x - y) * KX, ORIGIN_Y + (x + y) * KY - z * UNIT_PX]
}

/** Screen point → the workshop position on the flat plane at height `z` (used to follow the pointer). */
export function unproject(sx: number, sy: number, z: number) {
  const a = (sx - ORIGIN_X) / KX
  const b = (sy - ORIGIN_Y + z * UNIT_PX) / KY
  return { x: (a + b) / 2, y: (b - a) / 2 }
}

export function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value
}

/** Rounds to one decimal and prints it, to keep the generated SVG short. */
export function n1(value: number) {
  return (Math.round(value * 10) / 10).toString()
}

// ------------------------------------------------------------------ layout of the room

/** The room: a square floor, ROOM_W wide (x) and ROOM_D deep (y). */
export const ROOM_W = 17
export const ROOM_D = 17

/** The conveyor belt: runs from BELT_X0 to BELT_X1, starts at BELT_Y and is BELT_D deep, with its surface at BELT_Z. */
export const BELT_Y = 6.0
export const BELT_D = 2.8
export const BELT_X0 = 2.4
export const BELT_X1 = 11.6
export const BELT_Z = 2.6

/** The cardboard "sorted" box, just past the chute at the end of the belt. It is square: BOX_SIZE on each side. */
export const BOX_X = BELT_X1 + 0.6
export const BOX_Y = 5.8
export const BOX_SIZE = 3.4
export const BOX_H = 2.3

// ------------------------------------------------------------------ the robot arm

/**
 * The arm's shoulder joint. The arm stands just behind the belt. Seen from this angle "behind"
 * also shifts it right, so it sits a little left of the belt's middle to look centered on it.
 */
export const SHOULDER: Vec3 = [(BELT_X0 + BELT_X1) / 2 - 1.0, 4.4, 1.75]
export const UPPER_ARM_LEN = 4.9
export const FOREARM_LEN = 6.2
/** How far from the shoulder (across the floor) the fingertips can go. */
export const REACH = 10
/** Fingertip height when the gripper is empty. */
export const HOVER_Z = 4.4
/** Distance from the fingertips up to the wrist. */
export const GRIP_OFFSET = 1.4
/** Distance from the fingertips up to the palm bar. */
export const PALM_OFFSET = 0.9

// ------------------------------------------------------------------ shared colors (top, left, right faces of a box)

export const GRAY = ['#A3ADB9', '#8C97A4', '#76818E']
export const YELLOW = ['#F8D664', '#F2BE22', '#D9A40F']
