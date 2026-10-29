import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { FadeLink } from '@/components/site/PageTransition'
import { BuilderPill, Eyebrow, Wrap } from '@/components/ui/bits'
import { entryLabel } from '@/components/ui/PostCard'
import { getPost, getPosts } from '@/lib/content'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  return post ? { title: post.title, description: post.summary ?? undefined } : {}
}

export default async function NotebookEntryPage({ params }: Props) {
  const post = await getPost((await params).slug)
  if (!post) notFound()
  const meta = [post.dateLabel, post.readLabel].filter(Boolean).join(' · ')

  return (
    <>
      <section className="dots border-b-[1.5px] border-line">
        <Wrap width={1060} className="flex flex-col gap-3.5 py-14">
          <Eyebrow>
            <FadeLink href="/notebook" className="no-underline">
              05 · Notebook
            </FadeLink>{' '}
            / {entryLabel(post.entryNumber)}
          </Eyebrow>
          <div className="mono flex flex-wrap items-center gap-2 text-[10px] text-muted">
            <BuilderPill builder={post.author} />
            {post.category && <span>{post.category}</span>}
            {post.project && (
              <FadeLink href={`/projects/${post.project.slug}`} className="underline underline-offset-2">
                {post.project.title}
              </FadeLink>
            )}
          </div>
          <h1 className="hl m-0 max-w-[900px] text-[56px] md:text-[80px]">{post.title}</h1>
          {post.summary && <p className="m-0 max-w-[620px] text-lg leading-[1.55] text-body">{post.summary}</p>}
          {meta && <span className="mono text-[10px] text-muted">{meta}</span>}
        </Wrap>
      </section>
      <section className="bg-white">
        <Wrap width={1060} className="py-16">
          <article className="max-w-[700px]">
            {post.coverImage && (
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.alt}
                width={post.coverImage.width ?? 1400}
                height={post.coverImage.height ?? 900}
                sizes="(max-width: 760px) 100vw, 700px"
                className="mb-10 h-auto w-full rounded-lg border-[1.5px] border-line"
              />
            )}
            {post.content ? (
              <RichText data={post.content} className="richtext" />
            ) : (
              <p className="text-[17px] leading-[1.7] text-body">[The entry goes here.]</p>
            )}
          </article>
          <FadeLink href="/notebook" className="ulink mt-12 inline-block py-2.5">
            ← Back to the notebook
          </FadeLink>
        </Wrap>
      </section>
    </>
  )
}
