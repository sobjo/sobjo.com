import { FadeLink } from '@/components/site/PageTransition'
import { BuilderPill, StatusBadge } from '@/components/ui/bits'
import { ProjectMedia } from '@/components/ui/ProjectMedia'
import type { Project } from '@/lib/types'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card flex flex-wrap gap-6 p-5">
      <ProjectMedia project={project} fallback="art" className="h-[150px] w-[180px] flex-none rounded-md" sizes="180px" />
      <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-2.5">
        <div className="mono flex flex-wrap items-center gap-2 text-[10px] text-muted">
          <StatusBadge status={project.status} />
          {project.builders.map((b) => (
            <BuilderPill key={b} builder={b} />
          ))}
          {project.year && <span>{project.year}</span>}
        </div>
        <h2 className="hl m-0 text-[44px]">{project.title}</h2>
        {project.summary && <p className="m-0 text-[15px] leading-[1.55] text-body">{project.summary}</p>}
        {(project.role || project.tools) && (
          <dl className="mono m-0 grid grid-cols-[72px_1fr] gap-y-1 text-[10px]">
            {project.role && (
              <>
                <dt className="text-muted">Role</dt>
                <dd className="m-0 font-sans text-[13px] tracking-normal normal-case">{project.role}</dd>
              </>
            )}
            {project.tools && (
              <>
                <dt className="text-muted">Tools</dt>
                <dd className="m-0 font-sans text-[13px] tracking-normal normal-case">{project.tools}</dd>
              </>
            )}
          </dl>
        )}
        <FadeLink href={`/projects/${project.slug}`} className="ulink self-start py-2">
          {project.ctaLabel} →
        </FadeLink>
      </div>
    </article>
  )
}
