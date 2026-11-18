/*
 * The parts of the workshop that never move. They are drawn once, into three
 * layers, so the moving arm and items can slot between them:
 *
 *   back layer   → upper arm → middle layer → items on the belt → front layer → forearm and labels
 */

import {
  BELT_D,
  BELT_X0,
  BELT_X1,
  BELT_Y,
  BOX_H,
  BOX_SIZE,
  BOX_X,
  BOX_Y,
  GRAY,
  ROOM_D,
  ROOM_W,
  SHOULDER,
  YELLOW,
  iso,
  n1,
  type Pt,
} from './geometry'
import { box, circle, finishLayer, line, onLeftWall, polygon, raw, rim, shadow, startLayer, sway, wallText } from './svg'

/** The pegboard and desk sit on the front half of the left wall, between these y positions. */
const PEG_Y0 = 10.6
const PEG_Y1 = 15.4

/** A spot on the pegboard. `x` runs 1.0 to 5.8 along the board from its front end; `z` is height. */
function onBoard(x: number, z: number): Pt {
  return iso(0, PEG_Y1 + 1.0 - x, z)
}

/**
 * The tools hanging on the pegboard over the desk. Drawn twice: first as soft
 * gray outlines (`asShadow`), then for real on top, slightly offset.
 */
function drawTools(asShadow: boolean) {
  /** A point on a tool, nudged down and right when drawing its shadow. */
  const W = (x: number, z: number): Pt => {
    const p = onBoard(x, z)
    return asShadow ? [p[0] + 2, p[1] + 2.5] : p
  }
  /** The tool's color, or flat gray for the shadow pass. */
  const c = (color: string) => (asShadow ? '#C3CCD6' : color)
  const board = '#E9EEF5'
  const peg = (x: number, z: number) => {
    if (!asShadow) circle(onBoard(x, z), 1.8, '#76818E')
  }
  // hammer
  peg(1.55, 7.6)
  line(W(1.55, 7.25), W(1.55, 5.55), 4.5, c('#B9844A'))
  line(W(1.55, 6.05), W(1.55, 5.55), 5.5, c('#3A414B'))
  line(W(1.25, 7.35), W(1.85, 7.35), 8, c('#5E6875'))
  line(W(1.25, 7.35), W(1.12, 7.15), 4, c('#5E6875'))
  // two screwdrivers
  for (const [x, handle, tip] of [
    [2.2, '#3B6FB6', 5.6],
    [2.65, '#C2523C', 5.95],
  ] as const) {
    peg(x, 7.6)
    line(W(x, 7.35), W(x, 6.75), 7, c(handle))
    line(W(x, 6.75), W(x, 6.6), 4, c('#A3ADB9'))
    line(W(x, 6.6), W(x, tip), 2, c('#A3ADB9'))
  }
  // wrench
  peg(3.25, 7.6)
  line(W(3.25, 7.15), W(3.25, 5.75), 4, c('#8C97A4'))
  circle(W(3.25, 7.3), 6, c('#8C97A4'))
  circle(W(3.25, 5.6), 4.5, c('#8C97A4'))
  if (!asShadow) {
    circle(W(3.25, 7.48), 2.6, board)
    circle(W(3.25, 5.6), 2, board)
  }
  // pliers
  peg(3.9, 7.6)
  line(W(3.9, 7.35), W(3.9, 6.7), 4, c('#5E6875'))
  line(W(3.86, 6.7), W(3.72, 5.65), 4, c('#F2BE22'))
  line(W(3.94, 6.7), W(4.08, 5.65), 4, c('#F2BE22'))
  circle(W(3.9, 6.72), 2.6, c('#3A414B'))
  // spool of solder wire
  peg(4.65, 7.6)
  raw(`<circle cx="${n1(W(4.65, 6.85)[0])}" cy="${n1(W(4.65, 6.85)[1])}" r="9" fill="none" stroke="${c('#C2523C')}" stroke-width="4"/>`)
  circle(W(4.65, 6.85), 3.5, c('#5E6875'))
  // tape measure
  peg(5.35, 7.6)
  polygon([W(5.12, 7.35), W(5.58, 7.35), W(5.58, 6.8), W(5.12, 6.8)], c('#F2BE22'))
  circle(W(5.35, 7.08), 3.2, c('#2A2F36'))
  line(W(5.58, 6.86), W(5.66, 6.86), 3, c('#A3ADB9'))
}

/** A sitting orange tabby, eyes closed, tail swaying. `p` is where she sits. */
function drawOrangeCat(p: Pt) {
  raw(
    `<g transform="translate(${n1(p[0])} ${n1(p[1])}) scale(1.4)">` +
      `<ellipse cx="2" cy="0" rx="20" ry="5.5" fill="#1C2128" opacity="0.13"/>` +
      `<g id="orange-cat-tail"><path d="M10 -3C24 -2 27 -14 19 -21" fill="none" stroke="#E8913A" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M21.5 -16C21 -19 20 -20 19 -21" fill="none" stroke="#C46A1E" stroke-width="5" stroke-linecap="round"/>${sway(10, -3, 9, 2.8)}</g>` +
      `<path d="M-12 -2C-14 -16 -9 -27 0 -27C9 -27 14 -16 12 -2Z" fill="#E8913A"/>` +
      `<path d="M-6 -3C-7 -12 -4 -19 0 -19C4 -19 7 -12 6 -3Z" fill="#F7D3A6"/>` +
      `<path d="M8 -20q4 2 5 6M10 -12q3 2 3 6M-8 -20q-4 2 -5 6M-10 -12q-3 2 -3 6" stroke="#C46A1E" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="-4" cy="-1.5" rx="3.6" ry="2.4" fill="#F7D3A6"/><ellipse cx="4" cy="-1.5" rx="3.6" ry="2.4" fill="#F7D3A6"/>` +
      `<path d="M-10.5 -37L-9.5 -50L-2 -44Z" fill="#E8913A"/><path d="M10.5 -37L9.5 -50L2 -44Z" fill="#E8913A"/>` +
      `<path d="M-8.4 -40L-7.9 -47L-3.8 -43.8Z" fill="#F2A07B"/><path d="M8.4 -40L7.9 -47L3.8 -43.8Z" fill="#F2A07B"/>` +
      `<circle cx="0" cy="-34" r="11" fill="#E8913A"/>` +
      `<path d="M-3 -44v4M0 -45v5M3 -44v4" stroke="#C46A1E" stroke-width="1.6" stroke-linecap="round"/>` +
      `<ellipse cx="0" cy="-30" rx="5.5" ry="3.6" fill="#F7D3A6"/>` +
      `<path d="M-6.8 -35q2 -2.4 4 0M2.8 -35q2 -2.4 4 0" stroke="#2A2F36" stroke-width="1.5" fill="none" stroke-linecap="round"/>` +
      `<circle cx="-7" cy="-31" r="1.8" fill="#F2A07B" opacity="0.75"/><circle cx="7" cy="-31" r="1.8" fill="#F2A07B" opacity="0.75"/>` +
      `<path d="M-1.4 -32.2h2.8l-1.4 1.6z" fill="#D9665A"/>` +
      `<path d="M-2 -29.6q1 1 2 0q1 1 2 0" stroke="#2A2F36" stroke-width="1" fill="none" stroke-linecap="round"/>` +
      `<path d="M-6 -30.5l-8 -1.2M-6 -29.3l-8 1.6M6 -30.5l8 -1.2M6 -29.3l8 1.6" stroke="#C46A1E" stroke-width="0.8" stroke-linecap="round"/>` +
      `</g>`,
  )
}

/** A brown tabby with a white tummy, chin and paws, lying in a loaf. `p` is where she lies. */
function drawBrownCat(p: Pt) {
  raw(
    `<g transform="translate(${n1(p[0])} ${n1(p[1])}) scale(1.4)">` +
      `<ellipse cx="0" cy="0" rx="28" ry="6" fill="#1C2128" opacity="0.13"/>` +
      `<g id="brown-cat-tail"><path d="M-20 -5C-31 -1 -24 6 -7 4" fill="none" stroke="#9B7656" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M-13 5C-10 4.6 -8.5 4.3 -7 4" fill="none" stroke="#5E4330" stroke-width="5" stroke-linecap="round"/>${sway(-20, -5, 5, 3.6)}</g>` +
      `<ellipse cx="-2" cy="-9" rx="22" ry="10" fill="#F7F4EF"/>` +
      `<path d="M-24 -10C-22 -23 18 -23 20 -10C12 -7 6 -11 -2 -9C-10 -7 -16 -11 -24 -10Z" fill="#9B7656"/>` +
      `<path d="M-13 -18q2 4 0 7M-5 -19.5q2 4 0 7M3 -19q2 4 0 6.5" stroke="#5E4330" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="12" cy="-1.6" rx="4" ry="2.5" fill="#FFFFFF"/><ellipse cx="20" cy="-1.6" rx="4" ry="2.5" fill="#FFFFFF"/>` +
      `<path d="M10 -21L11 -32L17 -26Z" fill="#9B7656"/><path d="M26 -21L25 -32L19 -26Z" fill="#9B7656"/>` +
      `<path d="M11.8 -23.5L12.3 -29L15.6 -25.6Z" fill="#F2A07B"/><path d="M24.2 -23.5L23.7 -29L20.4 -25.6Z" fill="#F2A07B"/>` +
      `<circle cx="18" cy="-17" r="10" fill="#9B7656"/>` +
      `<path d="M14.5 -25.5v3M21.5 -25.5v3" stroke="#5E4330" stroke-width="1.5" stroke-linecap="round"/>` +
      `<path d="M16.6 -15L18 -25.5L19.4 -15Z" fill="#F7F4EF"/>` +
      `<path d="M10.2 -14C12 -6 24 -6 25.8 -14C23 -11 20.5 -15 18 -13C15.5 -15 13 -11 10.2 -14Z" fill="#F7F4EF"/>` +
      `<circle cx="14.4" cy="-18" r="1.9" fill="#2A2F36"/><circle cx="21.6" cy="-18" r="1.9" fill="#2A2F36"/>` +
      `<circle cx="15" cy="-18.6" r="0.6" fill="#FFFFFF"/><circle cx="22.2" cy="-18.6" r="0.6" fill="#FFFFFF"/>` +
      `<circle cx="12.4" cy="-14" r="1.6" fill="#F2A07B" opacity="0.65"/><circle cx="23.6" cy="-14" r="1.6" fill="#F2A07B" opacity="0.65"/>` +
      `<path d="M16.8 -14.6h2.4l-1.2 1.4z" fill="#D9665A"/>` +
      `<path d="M16.6 -12.5q.7 .8 1.4 0q.7 .8 1.4 0" stroke="#2A2F36" stroke-width="0.9" fill="none" stroke-linecap="round"/>` +
      `<path d="M11.5 -13.5l-7 -0.6M11.5 -12.4l-7 1.6M24.5 -13.5l7 -0.6M24.5 -12.4l7 1.6" stroke="#A3ADB9" stroke-width="0.8" stroke-linecap="round"/>` +
      `</g>`,
  )
}

/** The room behind everything else: walls, floor, window, lamp, poster, clock, pegboard and the arm's base. */
export function drawBackLayer() {
  startLayer()
  const H = 10 // wall height
  const T = 0.6 // wall thickness
  const D = 1.2 // floor slab depth
  // Walls: the inner faces, one L-shaped cap so the corner has no seam, and cut ends that run down
  // to the bottom of the floor slab so they line up with its sides.
  polygon([iso(0, 0, 0), iso(ROOM_W, 0, 0), iso(ROOM_W, 0, H), iso(0, 0, H)], '#DCE3EA')
  polygon([iso(0, 0, 0), iso(0, ROOM_D, 0), iso(0, ROOM_D, H), iso(0, 0, H)], '#D0D8E1')
  polygon([iso(-T, -T, H), iso(ROOM_W, -T, H), iso(ROOM_W, 0, H), iso(0, 0, H), iso(0, ROOM_D, H), iso(-T, ROOM_D, H)], '#8C97A4')
  polygon([iso(ROOM_W, -T, -D), iso(ROOM_W, 0, -D), iso(ROOM_W, 0, H), iso(ROOM_W, -T, H)], '#C9D2DC')
  polygon([iso(-T, ROOM_D, -D), iso(0, ROOM_D, -D), iso(0, ROOM_D, H), iso(-T, ROOM_D, H)], '#B5BFCB')
  // floor slab
  box(0, 0, -D, ROOM_W, ROOM_D, D, '#EEF2F5', '#B5BFCB', '#C9D2DC')
  for (let g = 2; g < ROOM_W; g += 2) line(iso(g, 0, 0), iso(g, ROOM_D, 0), 1, '#DCE3EA')
  for (let g = 2; g < ROOM_D; g += 2) line(iso(0, g, 0), iso(ROOM_W, g, 0), 1, '#DCE3EA')
  // baseboards
  polygon([iso(0, 0, 0), iso(ROOM_W, 0, 0), iso(ROOM_W, 0, 0.5), iso(0, 0, 0.5)], '#C3CCD6')
  polygon([iso(0, 0, 0), iso(0, ROOM_D, 0), iso(0, ROOM_D, 0.5), iso(0, 0, 0.5)], '#A3ADB9')

  // window, a sill deep enough for the plant, and light on the floor
  polygon([iso(8.3, 0, 4.6), iso(13.8, 0, 4.6), iso(13.8, 0, 8.4), iso(8.3, 0, 8.4)], '#FFFFFF')
  polygon([iso(8.6, 0, 4.9), iso(13.5, 0, 4.9), iso(13.5, 0, 8.1), iso(8.6, 0, 8.1)], '#A9D4F5')
  polygon([iso(8.9, 0, 5.6), iso(10.5, 0, 7.8), iso(10.9, 0, 7.8), iso(9.3, 0, 5.6)], '#FFFFFF', 0.5)
  line(iso(11.05, 0, 4.9), iso(11.05, 0, 8.1), 3, '#FFFFFF')
  line(iso(8.6, 0, 6.5), iso(13.5, 0, 6.5), 3, '#FFFFFF')
  box(8.1, 0, 4.4, 5.9, 0.9, 0.2, '#FFFFFF', '#E6ECF2', '#DCE3EA')
  polygon([iso(9.0, 0.6, 0.01), iso(14.4, 0.6, 0.01), iso(15.2, 4.2, 0.01), iso(9.8, 4.2, 0.01)], '#FFFFFF', 0.55)
  // plant on the sill
  box(12.0, 0.15, 4.6, 0.65, 0.6, 0.6, '#5E3B1C', '#D4705B', '#C2523C')
  const lf = iso(12.32, 0.45, 5.2)
  const leaves: [number, number, string][] = [
    [-18, -26, '#2E7D6B'],
    [-5, -40, '#4E9A85'],
    [9, -34, '#2E7D6B'],
    [18, -19, '#4E9A85'],
    [-14, -14, '#4E9A85'],
  ]
  for (const k of leaves) {
    raw(
      `<path d="M${n1(lf[0])} ${n1(lf[1])}Q${n1(lf[0] + k[0] * 0.2)} ${n1(lf[1] + k[1] * 0.7)} ${n1(lf[0] + k[0])} ${n1(lf[1] + k[1])}Q${n1(lf[0] + k[0] * 0.9)} ${n1(lf[1] + k[1] * 0.4)} ${n1(lf[0])} ${n1(lf[1])}Z" fill="${k[2]}" stroke="${k[2]}" stroke-width="3" stroke-linejoin="round"/>`,
    )
  }
  wallText(iso(1.6, 0, 8.75), 'SOBJO WORKSHOP', 34, '#1C2128', 'hl')

  // floor lamp standing against the back wall, right of the window
  const LX = 15.5
  const LY = 0.75
  const lampFoot = iso(LX, LY, 0)
  raw(`<ellipse cx="${n1(lampFoot[0])}" cy="${n1(lampFoot[1])}" rx="70" ry="34" fill="url(#sh-glow)"/>`)
  raw(`<ellipse cx="${n1(lampFoot[0] + 2)}" cy="${n1(lampFoot[1] + 2)}" rx="15" ry="7" fill="#1C2128" opacity="0.18"/>`)
  raw(`<ellipse cx="${n1(lampFoot[0])}" cy="${n1(lampFoot[1])}" rx="13" ry="6" fill="#2A2F36"/>`)
  raw(`<ellipse cx="${n1(lampFoot[0])}" cy="${n1(lampFoot[1] - 2)}" rx="13" ry="6" fill="#3A414B"/>`)
  line(iso(LX, LY, 0.1), iso(LX, LY, 6.0), 3, '#3A414B')
  const shade = iso(LX, LY, 6.3)
  raw(`<circle cx="${n1(shade[0])}" cy="${n1(shade[1] + 4)}" r="52" fill="url(#sh-glow)"/>`)
  raw(
    `<path d="M${n1(shade[0] - 11)} ${n1(shade[1] - 14)}L${n1(shade[0] + 11)} ${n1(shade[1] - 14)}L${n1(shade[0] + 21)} ${n1(shade[1] + 8)}L${n1(shade[0] - 21)} ${n1(shade[1] + 8)}Z" fill="#F2BE22"/>` +
      `<path d="M${n1(shade[0])} ${n1(shade[1] - 14)}L${n1(shade[0] + 11)} ${n1(shade[1] - 14)}L${n1(shade[0] + 21)} ${n1(shade[1] + 8)}L${n1(shade[0])} ${n1(shade[1] + 8)}Z" fill="#D9A40F"/>` +
      `<ellipse cx="${n1(shade[0])}" cy="${n1(shade[1] - 14)}" rx="11" ry="3.5" fill="#F8D664"/>` +
      `<ellipse cx="${n1(shade[0])}" cy="${n1(shade[1] + 8)}" rx="21" ry="5.5" fill="#FFF3BF"/>`,
  )

  // poster on the back half of the left wall
  onLeftWall(
    iso(0, 4.6, 8.4),
    `<rect width="112" height="112" rx="2" fill="#FFFFFF"/>` +
      `<rect x="6" y="6" width="100" height="100" fill="#C2523C"/>` +
      `<circle cx="56" cy="44" r="27" fill="#F8D664"/>` +
      `<path d="M56 30V21" stroke="#1C2128" stroke-width="2"/><circle cx="56" cy="20" r="3.2" fill="#3B6FB6"/>` +
      `<rect x="41" y="29" width="30" height="23" rx="6" fill="#EEF2F5"/>` +
      `<circle cx="50" cy="40" r="3" fill="#1C2128"/><circle cx="62" cy="40" r="3" fill="#1C2128"/>` +
      `<path d="M52 46q4 3.5 8 0" stroke="#1C2128" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
      `<rect x="45" y="54" width="22" height="15" rx="3" fill="#A3ADB9"/>` +
      `<path d="M56 64.5l-3.2-2.8c-2-2 0.8-4.6 3.2-2.2c2.4-2.4 5.2 0.2 3.2 2.2z" fill="#C2523C"/>` +
      `<text x="56" y="86" text-anchor="middle" class="hl" font-size="15" fill="#FFFFFF">KEEP</text>` +
      `<text x="56" y="100" text-anchor="middle" class="hl" font-size="15" fill="#FFFFFF">BUILDING</text>`,
  )

  // cat clock above the IN machine, tail swinging like a pendulum
  onLeftWall(
    iso(0, 7.4, 7.7),
    `<g transform="scale(1.15)">` +
      `<g id="clock-pendulum"><path d="M0 12Q6 22 1 30Q-2 34 3 36" stroke="#F2BE22" stroke-width="4" fill="none" stroke-linecap="round"/>${sway(0, 12, 14, 2)}</g>` +
      `<path d="M-14 -9L-13 -25L-2 -16Z" fill="#F2BE22"/><path d="M14 -9L13 -25L2 -16Z" fill="#F2BE22"/>` +
      `<path d="M-11.5 -12L-11 -21L-5 -16Z" fill="#F2A07B"/><path d="M11.5 -12L11 -21L5 -16Z" fill="#F2A07B"/>` +
      `<circle r="17" fill="#F2BE22"/><circle r="13.5" fill="#FFFFFF"/>` +
      `<path d="M-15 2l-9-1.5M-15 5l-9 1.5M15 2l9-1.5M15 5l9 1.5" stroke="#3A414B" stroke-width="1" stroke-linecap="round"/>` +
      `<circle cx="0" cy="-10.5" r="1.2" fill="#A3ADB9"/><circle cx="10.5" cy="0" r="1.2" fill="#A3ADB9"/>` +
      `<circle cx="0" cy="10.5" r="1.2" fill="#A3ADB9"/><circle cx="-10.5" cy="0" r="1.2" fill="#A3ADB9"/>` +
      `<path d="M-7.5 -4q2-2.4 4 0M3.5 -4q2-2.4 4 0" stroke="#2A2F36" stroke-width="1.3" fill="none" stroke-linecap="round"/>` +
      `<circle cx="-7" cy="4" r="2.1" fill="#F2A07B" opacity="0.7"/><circle cx="7" cy="4" r="2.1" fill="#F2A07B" opacity="0.7"/>` +
      `<path d="M0 0V-8" stroke="#2A2F36" stroke-width="2.2" stroke-linecap="round"/>` +
      `<path d="M0 0L6.5 3" stroke="#C2523C" stroke-width="1.6" stroke-linecap="round"/>` +
      `<circle r="1.7" fill="#2A2F36"/></g>`,
  )

  // pegboard over the desk on the front half of the left wall, with tools hanging on it
  polygon([iso(0, PEG_Y0 - 0.15, 5.15), iso(0, PEG_Y1 + 0.15, 5.15), iso(0, PEG_Y1 + 0.15, 8.05), iso(0, PEG_Y0 - 0.15, 8.05)], '#C3CCD6')
  polygon([iso(0, PEG_Y0, 5.3), iso(0, PEG_Y1, 5.3), iso(0, PEG_Y1, 7.9), iso(0, PEG_Y0, 7.9)], '#E9EEF5')
  for (let px = 1.3; px < 5.6; px += 0.5) for (let pz = 5.55; pz < 7.8; pz += 0.5) circle(onBoard(px, pz), 1.2, '#D0D8E1')
  drawTools(true)
  drawTools(false)

  // robot arm base, just behind the belt
  const bx = SHOULDER[0] - 0.8
  const by = SHOULDER[1] - 0.8
  shadow(bx, by, 1.6, 1.6, 0.18)
  box(bx, by, 0, 1.6, 1.6, 0.7, GRAY[0], GRAY[1], GRAY[2])
  rim(bx, by, 0.7, 1.6, 1.6)
  box(bx + 0.27, by + 0.27, 0.7, 1.07, 1.07, 0.7, YELLOW[0], YELLOW[1], YELLOW[2])
  rim(bx + 0.27, by + 0.27, 1.4, 1.07, 1.07)
  circle(iso(bx + 0.13, by + 1.5, 0.35), 2.2, '#5E6875')
  circle(iso(bx + 1.5, by + 0.13, 0.35), 2.2, '#5E6875')
  return finishLayer()
}

/** Drawn in front of the upper arm: the IN machine, the belt, the inside of the box and the chute. */
export function drawMiddleLayer() {
  startLayer()
  // IN machine
  shadow(0, 5.6, 2.4, 3.6)
  box(0, 5.6, 0, 2.4, 3.6, 5, '#8C97A4', '#A3ADB9', '#76818E')
  rim(0, 5.6, 5, 2.4, 3.6)
  polygon([iso(2.4, 6.2, 2.1), iso(2.4, 8.6, 2.1), iso(2.4, 8.6, 3.9), iso(2.4, 6.2, 3.9)], '#1F242B')
  for (let fl = 0; fl < 5; fl++)
    polygon(
      [
        iso(2.42, 6.2 + fl * 0.48, 3.9),
        iso(2.42, 6.62 + fl * 0.48, 3.9),
        iso(2.42, 6.62 + fl * 0.48, 3.1),
        iso(2.42, 6.2 + fl * 0.48, 3.1),
      ],
      '#2A2F36',
      0.9,
    )
  circle(iso(1.2, 9.2, 4.3), 4, '#5FD38D')
  const inLabel = iso(0.35, 9.2, 3.2)
  raw(
    `<text transform="matrix(0.866 0.5 0 1 ${n1(inLabel[0])} ${n1(inLabel[1])})" class="mono" font-size="13" font-weight="700" fill="#1C2128">IN ▸</text>`,
  )
  // legs + belt body
  for (const lx of [3.6, 6.3, 8.9, BELT_X1 - 0.7]) {
    shadow(lx, BELT_Y + 0.2, 0.3, 2.4, 0.1)
    box(lx, BELT_Y + 0.2, 0, 0.3, 0.3, 2, GRAY[0], GRAY[1], GRAY[2])
    box(lx, BELT_Y + BELT_D - 0.5, 0, 0.3, 0.3, 2, GRAY[0], GRAY[1], GRAY[2])
  }
  box(BELT_X0, BELT_Y, 2, BELT_X1 - BELT_X0, BELT_D, 0.6, '#3A414B', '#5E6875', '#76818E')
  // box: back flap, left flap, inside
  shadow(BOX_X, BOX_Y, BOX_SIZE, BOX_SIZE, 0.2)
  polygon([iso(BOX_X, BOX_Y, BOX_H), iso(BOX_X + BOX_SIZE, BOX_Y, BOX_H), iso(BOX_X + BOX_SIZE, BOX_Y - 0.8, BOX_H + 1.1), iso(BOX_X, BOX_Y - 0.8, BOX_H + 1.1)], '#B57E45')
  polygon([iso(BOX_X, BOX_Y, BOX_H), iso(BOX_X, BOX_Y + BOX_SIZE, BOX_H), iso(BOX_X - 0.7, BOX_Y + BOX_SIZE, BOX_H - 0.7), iso(BOX_X - 0.7, BOX_Y, BOX_H - 0.7)], '#C9925A')
  polygon([iso(BOX_X, BOX_Y, BOX_H), iso(BOX_X + BOX_SIZE, BOX_Y, BOX_H), iso(BOX_X + BOX_SIZE, BOX_Y + BOX_SIZE, BOX_H), iso(BOX_X, BOX_Y + BOX_SIZE, BOX_H)], '#5E3B1C')
  polygon([iso(BOX_X, BOX_Y, BOX_H), iso(BOX_X + BOX_SIZE, BOX_Y, BOX_H), iso(BOX_X + BOX_SIZE, BOX_Y, 0.8), iso(BOX_X, BOX_Y, 0.8)], '#8A5A2B')
  polygon([iso(BOX_X, BOX_Y, BOX_H), iso(BOX_X, BOX_Y + BOX_SIZE, BOX_H), iso(BOX_X, BOX_Y + BOX_SIZE, 0.8), iso(BOX_X, BOX_Y, 0.8)], '#7E5428')
  // chute
  const CH0 = BELT_X1
  const CH1 = BELT_X1 + 1.4
  polygon([iso(CH0, BELT_Y + 0.3, 2.6), iso(CH1, BELT_Y + 0.3, 2.0), iso(CH1, BELT_Y + BELT_D - 0.3, 2.0), iso(CH0, BELT_Y + BELT_D - 0.3, 2.6)], '#C3CCD6')
  polygon(
    [iso(CH0, BELT_Y + BELT_D - 0.3, 2.6), iso(CH1, BELT_Y + BELT_D - 0.3, 2.0), iso(CH1, BELT_Y + BELT_D - 0.3, 2.3), iso(CH0, BELT_Y + BELT_D - 0.3, 2.9)],
    '#8C97A4',
  )
  for (let cr = 0; cr < 3; cr++)
    line(iso(CH0 + 0.2 + cr * 0.4, BELT_Y + 0.4, 2.52 - cr * 0.17), iso(CH0 + 0.2 + cr * 0.4, BELT_Y + BELT_D - 0.4, 2.52 - cr * 0.17), 2, '#A3ADB9')
  return finishLayer()
}

/** Drawn in front of the items: the front of the box, the desk with its lamp and laptop, and the two cats. */
export function drawFrontLayer() {
  startLayer()
  polygon([iso(BOX_X, BOX_Y + BOX_SIZE, 0), iso(BOX_X + BOX_SIZE, BOX_Y + BOX_SIZE, 0), iso(BOX_X + BOX_SIZE, BOX_Y + BOX_SIZE, BOX_H), iso(BOX_X, BOX_Y + BOX_SIZE, BOX_H)], '#D49A5E')
  polygon([iso(BOX_X + BOX_SIZE, BOX_Y, 0), iso(BOX_X + BOX_SIZE, BOX_Y + BOX_SIZE, 0), iso(BOX_X + BOX_SIZE, BOX_Y + BOX_SIZE, BOX_H), iso(BOX_X + BOX_SIZE, BOX_Y, BOX_H)], '#B9844A')
  polygon([iso(BOX_X + 1.4, BOX_Y + BOX_SIZE, 1.1), iso(BOX_X + 2.0, BOX_Y + BOX_SIZE, 1.1), iso(BOX_X + 2.0, BOX_Y + BOX_SIZE, BOX_H), iso(BOX_X + 1.4, BOX_Y + BOX_SIZE, BOX_H)], '#E9CFA6')
  polygon(
    [iso(BOX_X, BOX_Y + BOX_SIZE, BOX_H), iso(BOX_X + BOX_SIZE, BOX_Y + BOX_SIZE, BOX_H), iso(BOX_X + BOX_SIZE, BOX_Y + BOX_SIZE + 0.9, BOX_H + 0.7), iso(BOX_X, BOX_Y + BOX_SIZE + 0.9, BOX_H + 0.7)],
    '#E2BC8B',
  )
  polygon(
    [iso(BOX_X + BOX_SIZE, BOX_Y, BOX_H), iso(BOX_X + BOX_SIZE, BOX_Y + BOX_SIZE, BOX_H), iso(BOX_X + BOX_SIZE + 0.9, BOX_Y + BOX_SIZE, BOX_H + 0.7), iso(BOX_X + BOX_SIZE + 0.9, BOX_Y, BOX_H + 0.7)],
    '#D7AE7C',
  )
  line(iso(BOX_X + 0.3, BOX_Y + BOX_SIZE, 0.5), iso(BOX_X + 1.0, BOX_Y + BOX_SIZE, 0.5), 2, '#8A5A2B')
  line(iso(BOX_X + 0.3, BOX_Y + BOX_SIZE, 0.75), iso(BOX_X + 0.8, BOX_Y + BOX_SIZE, 0.75), 2, '#8A5A2B')
  const sorted = iso(BOX_X + 0.3, BOX_Y + BOX_SIZE, 1.55)
  raw(
    `<text transform="matrix(0.866 0.5 0 1 ${n1(sorted[0])} ${n1(sorted[1])})" class="mono" font-size="12" font-weight="700" fill="#5A3B1E">SORTED</text>`,
  )
  // desk against the left wall, under the pegboard, facing into the room
  shadow(0.3, 10.8, 1.8, 4.0, 0.12)
  for (const [lx, ly] of [
    [0.5, 11.0],
    [1.8, 11.0],
    [0.5, 14.4],
    [1.8, 14.4],
  ])
    box(lx, ly, 0, 0.25, 0.25, 2.8, GRAY[0], GRAY[1], GRAY[2])
  box(0.3, 10.8, 2.8, 1.9, 4.1, 0.2, '#F7F9FB', '#C3CCD6', '#A3ADB9')
  rim(0.3, 10.8, 3.0, 1.9, 4.1)
  // desk lamp in the back corner of the desk
  box(0.5, 11.0, 3.0, 0.5, 0.5, 0.1, '#5E6875', '#3A414B', '#2A2F36')
  line(iso(0.75, 11.25, 3.1), iso(0.75, 11.25, 4.6), 3, '#3A414B')
  line(iso(0.75, 11.25, 4.6), iso(1.0, 12.0, 4.9), 3, '#3A414B')
  polygon([iso(0.9, 11.8, 4.6), iso(1.1, 12.4, 4.6), iso(1.1, 12.2, 5.1), iso(0.9, 11.7, 5.0)], '#C2523C')
  // laptop, screen facing into the room
  box(0.8, 11.6, 3.0, 1.1, 1.8, 0.08, '#5E6875', '#3A414B', '#2A2F36')
  polygon([iso(0.8, 11.6, 3.08), iso(0.8, 13.4, 3.08), iso(0.5, 13.4, 4.3), iso(0.5, 11.6, 4.3)], '#3A414B')
  polygon([iso(0.78, 11.75, 3.2), iso(0.78, 13.25, 3.2), iso(0.52, 13.25, 4.18), iso(0.52, 11.75, 4.18)], '#A9D4F5')
  line(iso(0.62, 12.05, 3.8), iso(0.62, 12.85, 3.8), 2, '#3B6FB6')
  line(iso(0.69, 12.05, 3.55), iso(0.69, 13.05, 3.55), 2, '#C2523C')
  // coffee
  box(1.0, 13.8, 3.0, 0.45, 0.45, 0.55, '#3A2414', '#F7F9FB', '#DCE3EA')
  line(iso(1.2, 14.02, 3.7), iso(1.1, 13.95, 4.1), 1.5, '#A3ADB9', 0.7)

  // the brown cat lies on the floor in front of the desk
  drawBrownCat(iso(2.9, 13.4, 0))
  // the orange cat sits on the floor in front of the belt
  drawOrangeCat(iso(13.2, 12.4, 0))
  return finishLayer()
}
