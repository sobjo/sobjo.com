'use client'

import { useEffect, useRef } from 'react'

import { usePageTransition } from '@/components/site/PageTransition'

import { mountWorkshop } from './workshop-engine'

const LABEL =
  'Playable isometric workshop. A yellow robot arm follows your pointer. Pick up an item riding the conveyor (the Cheetah, our notebook, the plushies for About us, a breadboard for our bench, a letter for Say hi, or the Cubli) and drop it into the cardboard box to open that page. Every page is also linked in the cards below.'

export function Workshop() {
  const svgRef = useRef<SVGSVGElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const navigate = usePageTransition()
  const navigateRef = useRef(navigate)

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
        // The left of the 1440-wide canvas is empty floor; crop it so the room can be bigger.
        viewBox="470 0 978 860"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={LABEL}
        className="absolute inset-0 block h-full w-full touch-pan-y select-none"
      >
        <defs>
          <filter id="sh-blur" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="sh-cs" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <ellipse cx="960" cy="800" rx="440" ry="40" fill="#1C2128" opacity="0.18" filter="url(#sh-blur)" />
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
