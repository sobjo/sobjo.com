import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FadeLink } from '@/shared/layout/PageTransition'
import { getProject, getProjects } from '@/shared/lib/content'
import { Eyebrow } from '@/shared/ui/Eyebrow'
import { Markdown } from '@/shared/ui/Markdown'
import { ProjectMedia } from '@/shared/ui/ProjectMedia'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { Wrap } from '@/shared/ui/Wrap'

import { ProjectFacts } from './_components/ProjectFacts'

type Props = { params: Promise<{ slug: string }> }

/** Builds a page for every project ahead of time. */
export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug)
  return project ? { title: project.title, description: project.summary ?? undefined } : {}
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  return (
    <>
      <section className="dots border-b-[1.5px] border-line">
        <Wrap className="flex flex-wrap items-center gap-10 pt-12 pb-14">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
            <div className="mono flex flex-wrap items-center gap-2 text-[10px] text-muted">
              <StatusBadge status={project.status} />
              {project.year && <span>{project.year}</span>}
            </div>
            <h1 className="hl m-0 text-[64px] md:text-[96px]">{project.title}</h1>
            {project.summary && <p className="m-0 max-w-[520px] text-base leading-[1.6] text-body">{project.summary}</p>}
          </div>
          <div className="card flex-[1_1_380px] overflow-hidden p-3">
            <ProjectMedia
              project={project}
              artSize={300}
              className="h-[300px] rounded-md"
              sizes="(max-width: 900px) 100vw, 560px"
            />
          </div>
        </Wrap>
      </section>

      <section className="border-b-[1.5px] border-line bg-white">
        <Wrap width={1060} className="flex flex-wrap gap-12 py-16">
          <article className="min-w-0 flex-[2_1_520px]">
            <Eyebrow className="mb-2.5">The write-up</Eyebrow>
            {project.body ? (
              <Markdown text={project.body} />
            ) : (
              <p className="text-[17px] leading-[1.7] text-body">
                [The full write-up goes here: the build log, what broke, and what we learned.]
              </p>
            )}
          </article>
          <ProjectFacts tools={project.tools} />
        </Wrap>
      </section>

      <section className="bg-white">
        <Wrap className="flex flex-wrap items-center justify-between gap-5 py-12">
          <h2 className="hl m-0 text-[40px]">See the rest of the work</h2>
          <FadeLink href="/projects" className="btn">
            All projects →
          </FadeLink>
        </Wrap>
      </section>
    </>
  )
}
