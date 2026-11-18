import type { Metadata } from 'next'

import { FadeLink } from '@/shared/layout/PageTransition'
import { getProjects } from '@/shared/lib/content'
import { Eyebrow } from '@/shared/ui/Eyebrow'
import { Wrap } from '@/shared/ui/Wrap'

import { ProjectCard } from './_components/ProjectCard'
import { ProjectList } from './_components/ProjectList'

export const metadata: Metadata = { title: 'Projects' }
/** Refresh the page from the CMS at most every 5 minutes. */
export const revalidate = 300

/** The color key under the page title; it matches the status badges. */
const STATUS_LEGEND = [
  { label: 'On the bench', swatch: 'bg-sun' },
  { label: 'Finished', swatch: 'bg-moss' },
  { label: 'Napkin sketch', swatch: 'border-[1.5px] border-dashed border-steel' },
]

export default async function ProjectsPage() {
  const projects = await getProjects()
  // The cards are rendered here on the server; ProjectList (a client component) only filters them.
  const cardsBySlug = Object.fromEntries(
    projects.map((project) => [project.slug, <ProjectCard key={project.slug} project={project} />]),
  )

  return (
    <>
      <section className="dots border-b-[1.5px] border-line">
        <Wrap className="py-14">
          <div className="flex max-w-[640px] flex-col gap-3.5">
            <Eyebrow>04 · Projects</Eyebrow>
            <h1 className="hl m-0 text-[64px] md:text-[96px]">The work.</h1>
            <p className="m-0 max-w-[480px] text-base leading-[1.6] text-body">
              Everything we&apos;ve built, are building, or keep sketching on napkins. Each one has a full write-up with
              the build log, what broke, and what we learned.
            </p>
            <div className="mono mt-1 flex flex-wrap gap-[18px] text-[11px] text-muted">
              {STATUS_LEGEND.map((entry) => (
                <span key={entry.label} className="inline-flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-[3px] ${entry.swatch}`} />
                  {entry.label}
                </span>
              ))}
            </div>
          </div>
        </Wrap>
      </section>

      <section className="border-b-[1.5px] border-line bg-white">
        <Wrap width={1060} className="pt-12 pb-[72px]">
          <ProjectList projects={projects} cards={cardsBySlug} />
        </Wrap>
      </section>

      <section className="dots">
        <Wrap width={1060} className="flex flex-wrap items-center justify-between gap-5 py-12">
          <div className="flex flex-col gap-1.5">
            <h2 className="hl m-0 text-[40px]">Got an idea for us?</h2>
            <span className="text-[15px] text-body">We keep a list. Yours might end up on a napkin.</span>
          </div>
          <FadeLink href="/say-hi" className="btn">
            Say hi →
          </FadeLink>
        </Wrap>
      </section>
    </>
  )
}
