/*
 * The items riding the conveyor belt, one per page you can visit from the home page.
 * To add a page to the belt, add an entry here.
 */

import { YELLOW, iso } from './geometry'
import { box, circle, heart, line } from './svg'

/** Something riding the belt. Dropping it in the box opens `href`. */
export interface WorkshopItemDef {
  id: string
  /** Shown on its name tag and announced to screen readers. */
  name: string
  href: string
  /** Footprint width (x), depth (y) and height (z), in workshop units. */
  w: number
  d: number
  h: number
  /** Draws the item with its back-left-bottom corner at (x, y, z). */
  draw: (x: number, y: number, z: number) => void
}

/** The six items on the belt, in the order they ride. */
export const WORKSHOP_ITEMS: WorkshopItemDef[] = [
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
        line(iso(x + l[0], y + l[1], z + 0.4), iso(x + l[0], y + l[1], z), 3.5, '#3A414B')
      line(iso(x, y + 0.35, z + 0.75), iso(x - 0.45, y + 0.35, z + 1.1), 3, '#D9A40F')
      box(x, y, z + 0.35, 1.3, 0.7, 0.5, YELLOW[0], YELLOW[1], YELLOW[2])
      box(x + 1.2, y + 0.1, z + 0.65, 0.55, 0.5, 0.45, YELLOW[0], YELLOW[1], YELLOW[2])
      circle(iso(x + 0.4, y + 0.7, z + 0.6), 3, '#2A2F36')
      circle(iso(x + 0.85, y + 0.7, z + 0.65), 3, '#2A2F36')
      circle(iso(x + 1.75, y + 0.45, z + 0.9), 2, '#2A2F36')
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
      circle(iso(x + 0.3, y + 0.3, z + 0.4), 15, '#C2523C')
      circle(iso(x + 0.3, y + 0.3, z + 1.15), 12, '#C2523C')
      circle(iso(x + 0.9, y + 0.8, z + 0.4), 15, '#3B6FB6')
      circle(iso(x + 0.9, y + 0.8, z + 1.15), 12, '#3B6FB6')
      circle(iso(x + 0.3, y + 0.3, z + 1.2), 1.8, '#1C2128')
      circle(iso(x + 0.9, y + 0.8, z + 1.2), 1.8, '#1C2128')
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
      for (let k = 0; k < 5; k++) circle(iso(x + 0.2 + k * 0.25, y + 0.2, z + 0.17), 1.2, '#C3CCD6')
      line(iso(x + 0.3, y + 0.5, z + 0.16), iso(x + 1.0, y + 0.5, z + 0.5), 2.5, '#C2523C')
      line(iso(x + 0.6, y + 0.9, z + 0.16), iso(x + 1.3, y + 0.9, z + 0.4), 2.5, '#3B6FB6')
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
      line(iso(x, y, z + 0.1), iso(x + 0.65, y + 0.5, z + 0.1), 1.5, '#8C97A4')
      line(iso(x + 0.65, y + 0.5, z + 0.1), iso(x + 1.3, y, z + 0.1), 1.5, '#8C97A4')
      circle(iso(x + 0.65, y + 0.5, z + 0.1), 4, '#C2523C')
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
      circle(iso(x + 0.45, y + 0.9, z + 0.45), 6, '#F2BE22')
      circle(iso(x + 0.9, y + 0.45, z + 0.45), 5, '#D9A40F')
    },
  },
]
