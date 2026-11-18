import { site } from '@/content/site'
import { FadeLink } from '@/shared/layout/PageTransition'
import type { Project } from '@/shared/lib/types'
import { BuilderPill } from '@/shared/ui/BuilderPill'
import { Eyebrow } from '@/shared/ui/Eyebrow'
import { CompleteBar, ProgressBar } from '@/shared/ui/ProgressBar'
import { ProjectMedia } from '@/shared/ui/ProjectMedia'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { Wrap } from '@/shared/ui/Wrap'

/** "On the bench this month": the "right now" blurb beside cards for the featured projects. */
export function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section className="dots border-y-[1.5px] border-line">
      <Wrap className="flex flex-wrap items-start gap-10 py-16">
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
          <Eyebrow>Right now</Eyebrow>
          <h2 className="hl m-0 text-[40px] md:text-[52px]">On the bench this month</h2>
          <p className="m-0 text-[15px] leading-[1.6] text-body">{site.rightNow}</p>
          <FadeLink href="/projects" className="btn mt-2 self-start">
            All projects →
          </FadeLink>
        </div>
        <div className="grid min-w-0 flex-[2_1_560px] gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
          {projects.map((project) => (
            <FeaturedProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Wrap>
    </section>
  )
}

function FeaturedProjectCard({ project }: { project: Project }) {
  return (
    <FadeLink href={`/projects/${project.slug}`} className="card flex flex-col overflow-hidden">
      <ProjectMedia project={project} fallback="label" className="h-[180px]" />
      <div className="flex flex-col gap-2.5 p-[18px]">
        <div className="mono flex flex-wrap items-center gap-2 text-[10px] text-muted">
          {project.builders.map((builder) => (
            <BuilderPill key={builder} builder={builder} />
          ))}
          <StatusBadge
            status={project.status}
            label={project.status === 'in-progress' ? 'In progress' : undefined}
            outline
          />
        </div>
        <span className="hl text-[32px]">{project.title}</span>
        {project.progress ? (
          <ProgressBar done={project.progress.done} total={project.progress.total} />
        ) : project.status === 'finished' ? (
          <CompleteBar />
        ) : null}
        <span className="ulink">{project.ctaLabel} →</span>
      </div>
    </FadeLink>
  )
}
