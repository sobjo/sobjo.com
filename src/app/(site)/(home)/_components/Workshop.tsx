'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { FadeLink, usePageTransition } from '@/shared/layout/PageTransition'

import { mountWorkshop } from '../_lib/workshop/engine'
import { VIEWBOX } from '../_lib/workshop/geometry'
import type { DeskProject } from '../_lib/workshop/items'

/** What screen readers hear for the drawing. The links below the drawing do the same job. */
const LABEL =
  'Isometric drawing of our workshop: an L-shaped desk with our projects on it, bookcases, a pegboard of tools, and a Microduck robot walking laps around a track on the rug. A robot claw hanging from the top of the screen follows your pointer; grab a project to open it.'

/**
 * The home hero: the intro (passed in as `children`) beside the playable workshop, with
 * the robot claw drawn over the whole thing. React only renders the empty <svg>s and the
 * room's layer groups; ../_lib/workshop/engine.ts draws into them and runs the animation.
 */
export function Workshop({ projects, children }: { projects: DeskProject[]; children: ReactNode }) {
  const stageRef = useRef<HTMLElement>(null)
  const roomRef = useRef<SVGSVGElement>(null)
  const overlayRef = useRef<SVGSVGElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const navigate = usePageTransition()
  const navigateRef = useRef(navigate)

  // Keep the latest navigate function without restarting the engine when it changes.
  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  useEffect(() => {
    if (!stageRef.current || !roomRef.current || !overlayRef.current) return
    return mountWorkshop({
      stage: stageRef.current,
      room: roomRef.current,
      overlay: overlayRef.current,
      projects,
      status: statusRef.current,
      onPick: (href) => navigateRef.current(href),
    })
  }, [projects])

  return (
    <section
      ref={stageRef}
      className="workshop-stage dots relative flex h-[calc(100svh-var(--header-h))] touch-pan-y flex-col overflow-hidden select-none landscape:flex-row"
    >
      {children}
      <div className="stage-blur relative min-h-0 min-w-0 flex-1">
        <svg
          ref={roomRef}
          viewBox={VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={LABEL}
          className="absolute inset-0 block h-full w-full"
        >
          <defs>
            <filter id="sh-blur" x="-30%" y="-80%" width="160%" height="260%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
            <filter id="sh-cs" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <ellipse cx="960" cy="790" rx="400" ry="36" fill="#1C2128" opacity="0.14" filter="url(#sh-blur)" />
          {/* Drawing layers, back to front. The engine fills these in. */}
          <g id="ws-back" />
          <g id="ws-items" />
          <g id="ws-front" />
          <g id="ws-duck" />
          <g id="ws-plant" />
          <g id="ws-top" />
        </svg>
      </div>
      {/* The robot claw, drawn over the whole hero so it can follow the pointer anywhere. */}
      <svg ref={overlayRef} aria-hidden="true" className="arm-layer pointer-events-none absolute inset-0 z-10 h-full w-full" />
      {/* Keyboard and screen reader route to the same pages the claw opens. */}
      <nav
        aria-label="Projects on the desk"
        className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:bottom-4 focus-within:left-4 focus-within:z-20 focus-within:flex focus-within:gap-2"
      >
        {projects.map((p) => (
          <FadeLink key={p.slug} href={`/projects/${p.slug}`} className="btn">
            {p.title}
          </FadeLink>
        ))}
      </nav>
      <p ref={statusRef} role="status" aria-live="polite" className="sr-only" />
    </section>
  )
}
