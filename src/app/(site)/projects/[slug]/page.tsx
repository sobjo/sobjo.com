import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FadeLink } from '@/components/site/PageTransition'
import { BuilderPill, Eyebrow, ProgressBar, StatusBadge, Wrap } from '@/components/ui/bits'
import { PostCard } from '@/components/ui/PostCard'
import { ProjectMedia } from '@/components/ui/ProjectMedia'
import { getPostsForProject, getProject, getProjects } from '@/lib/content'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug)
  return project ? { title: project.title, description: project.summary ?? undefined } : {}
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()
  const posts = await getPostsForProject(slug)

  return (
    <>
      <section className="dots border-b-[1.5px] border-line">
        <Wrap className="flex flex-wrap items-center gap-10 pt-12 pb-14">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
            <Eyebrow>
              <FadeLink href="/projects" className="no-underline">
                04 · Projects
              </FadeLink>{' '}
              / {project.title}
            </Eyebrow>
            <div className="mono flex flex-wrap items-center gap-2 text-[10px] text-muted">
              <StatusBadge status={project.status} />
              {project.builders.map((b) => (
                <BuilderPill key={b} builder={b} />
              ))}
              {project.year && <span>{project.year}</span>}
            </div>
            <h1 className="hl m-0 text-[64px] md:text-[96px]">{project.title}</h1>
            {project.summary && <p className="m-0 max-w-[520px] text-base leading-[1.6] text-body">{project.summary}</p>}
            {project.progress && (
              <div className="flex max-w-[360px] flex-col gap-2">
                <span className="mono text-[10px] text-muted">
                  Build progress · {project.progress.done} of {project.progress.total}
                </span>
                <ProgressBar done={project.progress.done} total={project.progress.total} />
              </div>
            )}
          </div>
          <div className="card flex-[1_1_380px] overflow-hidden p-3">
            <ProjectMedia
              project={project}
              fallback="art"
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
              <RichText data={project.body} className="richtext" />
            ) : (
              <p className="text-[17px] leading-[1.7] text-body">
                [The full write-up goes here: the build log, what broke, and what we learned.]
              </p>
            )}
          </article>
          {(project.role || project.tools) && (
            <aside className="flex-[1_1_240px]">
              <dl className="card m-0 flex flex-col gap-4 p-5">
                {project.role && (
                  <div className="flex flex-col gap-1">
                    <dt className="mono text-[10px] text-muted">Role</dt>
                    <dd className="m-0 text-sm">{project.role}</dd>
                  </div>
                )}
                {project.tools && (
                  <div className="flex flex-col gap-1">
                    <dt className="mono text-[10px] text-muted">Tools</dt>
                    <dd className="m-0 text-sm">{project.tools}</dd>
                  </div>
                )}
              </dl>
            </aside>
          )}
        </Wrap>
      </section>

      {posts.length > 0 && (
        <section className="dots border-b-[1.5px] border-line">
          <Wrap className="py-16">
            <Eyebrow className="mb-2.5">From the notebook</Eyebrow>
            <h2 className="hl mt-0 mb-6 text-[40px] md:text-[52px]">Build log</h2>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </Wrap>
        </section>
      )}

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
