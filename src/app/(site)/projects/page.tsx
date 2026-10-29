import type { Metadata } from 'next'

import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectList } from '@/components/projects/ProjectList'
import { FadeLink } from '@/components/site/PageTransition'
import { Eyebrow, Wrap } from '@/components/ui/bits'
import { getProjects } from '@/lib/content'

export const metadata: Metadata = { title: 'Projects' }
export const revalidate = 300

const LEGEND = [
  { label: 'On the bench', swatch: 'bg-sun' },
  { label: 'Finished', swatch: 'bg-moss' },
  { label: 'Napkin sketch', swatch: 'border-[1.5px] border-dashed border-steel' },
]

export default async function ProjectsPage() {
  const projects = await getProjects()
  const cards = Object.fromEntries(projects.map((p) => [p.slug, <ProjectCard key={p.slug} project={p} />]))

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
              {LEGEND.map((l) => (
                <span key={l.label} className="inline-flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-[3px] ${l.swatch}`} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </Wrap>
      </section>

      <section className="border-b-[1.5px] border-line bg-white">
        <Wrap width={1060} className="pt-12 pb-[72px]">
          <ProjectList projects={projects} cards={cards} />
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
