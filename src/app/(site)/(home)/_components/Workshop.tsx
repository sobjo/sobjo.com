'use client'

import { useEffect, useRef } from 'react'

import { usePageTransition } from '@/shared/layout/PageTransition'

import { mountWorkshop } from '../_lib/workshop/engine'

/** What screen readers hear for the whole drawing. */
const LABEL =
  'Playable isometric workshop. A yellow robot arm follows your pointer. Pick up an item riding the conveyor (the Cheetah, our notebook, the plushies for About us, a breadboard for our bench, a letter for Say hi, or the Cubli) and drop it into the cardboard box to open that page. An orange tabby sits on the floor, and a brown tabby with a white tummy lies in front of the desk.'

/**
 * The playable workshop in the home hero. React only renders the empty <svg> and its layer
 * groups; ../_lib/workshop/engine.ts draws into them and runs the animation.
 */
export function Workshop() {
  const svgRef = useRef<SVGSVGElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const navigate = usePageTransition()
  const navigateRef = useRef(navigate)

  // Keep the latest navigate function without restarting the engine when it changes.
  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  useEffect(() => {
    if (!svgRef.current) return
    return mountWorkshop(svgRef.current, {
      status: statusRef.current,
      onSorted: (href) => navigateRef.current(href),
    })
  }, [])

  return (
    <>
      <svg
        ref={svgRef}
        // Crop the 1440-wide canvas to the room so it can be drawn bigger.
        viewBox="505 0 910 860"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={LABEL}
        className="absolute inset-0 block h-full w-full touch-pan-y select-none"
      >
        <defs>
          <radialGradient id="sh-glow">
            <stop offset="0" stopColor="#FFE98A" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFE98A" stopOpacity="0" />
          </radialGradient>
          <filter id="sh-blur" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="sh-cs" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <ellipse cx="960" cy="800" rx="440" ry="40" fill="#1C2128" opacity="0.18" filter="url(#sh-blur)" />
        {/* Drawing layers, back to front. The engine fills these in. */}
        <g id="ws-back" />
        <g id="ws-arm" />
        <g id="ws-mid" />
        <g id="ws-items" />
        <g id="ws-front" />
        <g id="ws-top" />
      </svg>
      <p ref={statusRef} role="status" aria-live="polite" className="sr-only" />
    </>
  )
}
