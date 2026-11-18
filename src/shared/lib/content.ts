import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { placeholderBench, placeholderPosts, placeholderProjects } from '@/content/placeholder'
import type { Media as MediaDoc, Post as PostDoc, Project as ProjectDoc, Tool as ToolDoc } from '@/payload-types'

import { DEFAULT_CTA } from './labels'
import type { BenchContent, Equipment, Image, Part, Post, Project, RichText, Software } from './types'

/*
 * Every page reads its content through the `get…` functions in this file.
 *
 * With DATABASE_URL set they query the Payload CMS. Without it (a fresh clone,
 * or a preview with no database) they return the placeholder content from
 * src/content/placeholder.ts, so the site still renders.
 *
 * The `to…` helpers turn raw CMS documents into the simpler shapes in
 * ./types.ts that the pages use.
 */

const hasDatabase = Boolean(process.env.DATABASE_URL)

/** One Payload client per request. */
const getPayloadClient = cache(() => getPayload({ config }))

/** Only published notebook entries; drafts stay hidden. */
const PUBLISHED_ONLY = { _status: { equals: 'published' } } as const

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// ------------------------------------------------------------------ projects

export const getProjects = cache(async (): Promise<Project[]> => {
  if (!hasDatabase) return placeholderProjects
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'projects', sort: 'order', limit: 100, depth: 1 })
  return docs.map(toProject)
})

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const projects = await getProjects()
  return projects.find((project) => project.slug === slug) ?? null
})

function toProject(doc: ProjectDoc): Project {
  return {
    slug: doc.slug,
    title: doc.title,
    status: doc.status,
    year: doc.year ?? null,
    builders: doc.builders ?? [],
    summary: doc.summary ?? null,
    role: doc.role ?? null,
    tools: doc.tools ?? null,
    progress: toProgress(doc),
    photo: toImage(doc.photo),
    body: (doc.body as RichText | null | undefined) ?? null,
    illustration: doc.illustration ?? 'idea',
    tint: doc.tint ?? 'paper',
    featured: Boolean(doc.featured),
    ctaLabel: doc.ctaLabel || DEFAULT_CTA[doc.status],
  }
}

/** Build progress only makes sense while a project is in progress and has steps. */
function toProgress(doc: ProjectDoc): Project['progress'] {
  const done = doc.progress?.done ?? 0
  const total = doc.progress?.total ?? 0
  if (doc.status !== 'in-progress' || total <= 0) return null
  return { done: Math.min(done, total), total }
}

// ------------------------------------------------------------------ notebook

export const getPosts = cache(async (): Promise<Post[]> => {
  if (!hasDatabase) return placeholderPosts
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: PUBLISHED_ONLY,
    sort: '-publishedAt',
    limit: 100,
    depth: 1,
  })
  return docs.map(toPost)
})

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  if (!hasDatabase) return placeholderPosts.find((post) => post.slug === slug) ?? null
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [PUBLISHED_ONLY, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  })
  return docs[0] ? toPost(docs[0]) : null
})

/** The notebook entries linked to one project, newest first. */
export async function getPostsForProject(projectSlug: string): Promise<Post[]> {
  const posts = await getPosts()
  return posts.filter((post) => post.project?.slug === projectSlug)
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

// ------------------------------------------------------------------ bench

/** Everything on the Bench page, sorted into equipment, hardware parts and software. */
export const getBench = cache(async (): Promise<BenchContent> => {
  if (!hasDatabase) return placeholderBench
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'tools', sort: 'order', limit: 300, depth: 1 })

  const bench: BenchContent = { equipment: [], parts: [], software: [] }
  for (const doc of docs) {
    if (doc.kind === 'equipment') bench.equipment.push(toEquipment(doc))
    else if (doc.kind === 'hardware') bench.parts.push(toPart(doc))
    else bench.software.push(toSoftware(doc))
  }
  return bench
})

function toEquipment(doc: ToolDoc): Equipment {
  return {
    id: String(doc.id),
    name: doc.name,
    model: doc.model ?? null,
    location: doc.location ?? null,
    description: doc.description ?? null,
    spot: doc.benchSpot ?? null,
    usedIn: projectTitles(doc.usedIn),
  }
}

function toPart(doc: ToolDoc): Part {
  return {
    id: String(doc.id),
    name: doc.name,
    group: doc.partGroup ?? 'materials',
    description: doc.description ?? null,
    usedIn: projectTitles(doc.usedIn),
  }
}

function toSoftware(doc: ToolDoc): Software {
  return {
    id: String(doc.id),
    name: doc.name,
    group: doc.softwareGroup ?? 'os',
    tag: doc.tag ?? null,
    description: doc.description ?? null,
  }
}

// ------------------------------------------------------------------ shared helpers

function toImage(media: number | MediaDoc | null | undefined): Image | null {
  if (!media || typeof media === 'number' || !media.url) return null
  return { url: media.url, alt: media.alt, width: media.width ?? undefined, height: media.height ?? undefined }
}

/** The titles of the projects a tool is used in (ignores links that were not loaded). */
function projectTitles(projects: ToolDoc['usedIn']): string[] {
  return (projects ?? []).flatMap((project) => (typeof project === 'object' && project ? [project.title] : []))
}
