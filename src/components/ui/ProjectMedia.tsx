import Image from 'next/image'

import { IsoArt } from '@/components/art/ProjectArt'
import { TINT_HEX } from '@/lib/labels'
import type { Project } from '@/lib/types'

/**
 * The project's photo when it has one, otherwise its isometric drawing (or a
 * "[Name photo]" placeholder) on the project's tint.
 */
export function ProjectMedia({
  project,
  fallback,
  className = '',
  artSize = 150,
  sizes = '(max-width: 768px) 100vw, 400px',
}: {
  project: Project
  fallback: 'art' | 'label'
  className?: string
  artSize?: number
  sizes?: string
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: TINT_HEX[project.tint] }}
    >
      {project.photo ? (
        <Image src={project.photo.url} alt={project.photo.alt} fill sizes={sizes} className="object-cover" />
      ) : fallback === 'art' ? (
        <IsoArt name={project.illustration} width={artSize} height={artSize * 0.8} />
      ) : (
        <span className="mono text-[11px] text-muted">[{project.title} photo]</span>
      )}
    </div>
  )
}
