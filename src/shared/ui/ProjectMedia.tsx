import Image from 'next/image'

import { TINT_HEX } from '@/shared/lib/labels'
import type { Project } from '@/shared/lib/types'

import { IsoArt } from './IsoArt'

/**
 * The project's photo when it has one. Without a photo it falls back to either
 * the project's isometric drawing (`fallback="art"`) or a "[Name photo]"
 * placeholder (`fallback="label"`), on the project's background tint.
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
