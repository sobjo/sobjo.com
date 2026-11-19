import Image from 'next/image'

import { TINT_HEX } from '@/shared/lib/labels'
import type { Project } from '@/shared/lib/types'

import { IsoArt } from './IsoArt'

/**
 * The project's isometric drawing on its background tint. When the project has a
 * photo of the real build, hovering (or focusing) the picture fades the photo in
 * over the drawing, and a small "Photo" tag hints that it's there.
 */
export function ProjectMedia({
  project,
  className = '',
  artSize = 150,
  sizes = '(max-width: 768px) 100vw, 400px',
}: {
  project: Project
  className?: string
  artSize?: number
  sizes?: string
}) {
  const { photo } = project
  return (
    <div
      className={`group/media relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: TINT_HEX[project.tint] }}
      tabIndex={photo ? 0 : undefined}
    >
      <IsoArt
        name={project.illustration}
        floor={false}
        width={artSize}
        height={artSize * 0.8}
        className="transition-transform duration-300 group-hover/media:scale-95"
      />
      {photo && (
        <>
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-300 group-hover/media:opacity-100 group-focus/media:opacity-100"
          />
          <span className="mono pointer-events-none absolute right-2 bottom-2 rounded bg-white/85 px-1.5 py-0.5 text-[9px] text-muted transition-opacity duration-300 group-hover/media:opacity-0 group-focus/media:opacity-0">
            <span className="pointer-coarse:hidden">Hover for photo</span>
            <span className="hidden pointer-coarse:inline">Tap for photo</span>
          </span>
        </>
      )}
    </div>
  )
}
