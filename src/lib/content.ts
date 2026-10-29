import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { placeholderBench, placeholderPosts, placeholderProjects } from '@/content/placeholder'
import type { Media as MediaDoc, Post as PostDoc, Project as ProjectDoc, Tool as ToolDoc } from '@/payload-types'

import { DEFAULT_CTA } from './labels'
import type { BenchContent, Image, Post, Project, RichText } from './types'

/**
 * Every page reads its content through these functions. With DATABASE_URL set
 * they query Payload; without it (a fresh clone, a preview with no database)
 * they return the placeholder content so the site still renders.
 */
export const hasDatabase = Boolean(process.env.DATABASE_URL)

const payload = cache(() => getPayload({ config }))

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function toImage(media: number | MediaDoc | null | undefined): Image | null {
  if (!media || typeof media === 'number' || !media.url) return null
  return { url: media.url, alt: media.alt, width: media.width ?? undefined, height: media.height ?? undefined }
}

function toProject(doc: ProjectDoc): Project {
  const done = doc.progress?.done ?? 0
  const total = doc.progress?.total ?? 0
  return {
    slug: doc.slug,
    title: doc.title,
    status: doc.status,
    year: doc.year ?? null,
    builders: doc.builders ?? [],
    summary: doc.summary ?? null,
    role: doc.role ?? null,
    tools: doc.tools ?? null,
    progress: doc.status === 'in-progress' && total > 0 ? { done: Math.min(done, total), total } : null,
    photo: toImage(doc.photo),
    body: (doc.body as RichText | null | undefined) ?? null,
    illustration: doc.illustration ?? 'idea',
    tint: doc.tint ?? 'paper',
    featured: Boolean(doc.featured),
    ctaLabel: doc.ctaLabel || DEFAULT_CTA[doc.status],
  }
}

function toPost(doc: PostDoc): Post {
  const project = doc.project && typeof doc.project === 'object' ? doc.project : null
  return {
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary ?? null,
    entryNumber: doc.entryNumber ?? null,
    author: doc.author,
    category: doc.category ?? null,
    project: project ? { slug: project.slug, title: project.title } : null,
    dateLabel: doc.publishedAt ? dateFormat.format(new Date(doc.publishedAt)) : null,
    readLabel: doc.readMinutes ? `${doc.readMinutes} min` : null,
    content: (doc.content as RichText | null | undefined) ?? null,
    coverImage: toImage(doc.coverImage),
  }
}

function projectTitles(list: ToolDoc['usedIn']): string[] {
  return (list ?? []).flatMap((p) => (typeof p === 'object' && p ? [p.title] : []))
}

export const getProjects = cache(async (): Promise<Project[]> => {
  if (!hasDatabase) return placeholderProjects
  const { docs } = await (await payload()).find({ collection: 'projects', sort: 'order', limit: 100, depth: 1 })
  return docs.map(toProject)
})

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const projects = await getProjects()
  return projects.find((p) => p.slug === slug) ?? null
})

const published = { _status: { equals: 'published' } } as const

export const getPosts = cache(async (limit = 100): Promise<Post[]> => {
  if (!hasDatabase) return placeholderPosts.slice(0, limit)
  const { docs } = await (await payload()).find({
    collection: 'posts',
    where: published,
    sort: '-publishedAt',
    limit,
    depth: 1,
  })
  return docs.map(toPost)
})

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  if (!hasDatabase) return placeholderPosts.find((p) => p.slug === slug) ?? null
  const { docs } = await (await payload()).find({
    collection: 'posts',
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  })
  return docs[0] ? toPost(docs[0]) : null
})

export async function getPostsForProject(projectSlug: string): Promise<Post[]> {
  const posts = await getPosts()
  return posts.filter((p) => p.project?.slug === projectSlug)
}

export const getBench = cache(async (): Promise<BenchContent> => {
  if (!hasDatabase) return placeholderBench
  const { docs } = await (await payload()).find({ collection: 'tools', sort: 'order', limit: 300, depth: 1 })
  const bench: BenchContent = { equipment: [], parts: [], software: [] }
  for (const doc of docs) {
    const id = String(doc.id)
    const description = doc.description ?? null
    if (doc.kind === 'equipment') {
      bench.equipment.push({
        id,
        name: doc.name,
        model: doc.model ?? null,
        location: doc.location ?? null,
        description,
        spot: doc.benchSpot ?? null,
        usedIn: projectTitles(doc.usedIn),
      })
    } else if (doc.kind === 'hardware') {
      bench.parts.push({
        id,
        name: doc.name,
        group: doc.partGroup ?? 'materials',
        description,
        usedIn: projectTitles(doc.usedIn),
      })
    } else {
      bench.software.push({ id, name: doc.name, group: doc.softwareGroup ?? 'os', tag: doc.tag ?? null, description })
    }
  }
  return bench
})
