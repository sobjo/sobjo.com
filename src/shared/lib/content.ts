import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import notebookFile from '@/content/notebook.json'
import { placeholderBench } from '@/content/placeholder'
import projectsFile from '@/content/projects.json'
import type { Tool as ToolDoc } from '@/payload-types'

import type { NotebookEntry, ProjectEntry, StoredImage } from './content-files'
import { readMinutes } from './content-files'
import { DEFAULT_CTA } from './labels'
import type { BenchContent, Equipment, Image, Part, Post, Project, Software } from './types'

/*
 * Every page reads its content through the `get…` functions in this file.
 *
 * Projects and notebook entries come from the content files src/content/projects.json
 * and src/content/notebook.json, which the private /update-site editor commits to
 * GitHub (each save redeploys the site).
 *
 * Bench items come from the Payload CMS when DATABASE_URL is set, and from the
 * placeholder content in src/content/placeholder.ts when it isn't.
 */

const hasDatabase = Boolean(process.env.DATABASE_URL)

/** One Payload client per request. */
const getPayloadClient = cache(() => getPayload({ config }))

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

// ------------------------------------------------------------------ projects

export const getProjects = cache(async (): Promise<Project[]> => (projectsFile as ProjectEntry[]).map(toProject))

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const projects = await getProjects()
  return projects.find((project) => project.slug === slug) ?? null
})

function toProject(entry: ProjectEntry): Project {
  return {
    ...entry,
    photo: fileImage(entry.photo),
    body: entry.body.trim() || null,
    ctaLabel: entry.ctaLabel || DEFAULT_CTA[entry.status],
  }
}

// ------------------------------------------------------------------ notebook

/** Published notebook entries, newest first. Drafts stay hidden. */
export const getPosts = cache(async (): Promise<Post[]> =>
  (notebookFile as NotebookEntry[])
    .filter((entry) => entry.status === 'published')
    .map(toPost)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')),
)

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const posts = await getPosts()
  return posts.find((post) => post.slug === slug) ?? null
})

function toPost(entry: NotebookEntry): Post {
  const minutes = readMinutes(entry.content)
  return {
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    entryNumber: entry.entryNumber,
    author: entry.author,
    category: entry.category,
    publishedAt: entry.publishedAt,
    dateLabel: entry.publishedAt ? dateFormat.format(new Date(`${entry.publishedAt}T00:00:00Z`)) : null,
    readLabel: minutes ? `${minutes} min` : null,
    content: entry.content.trim() || null,
    coverImage: fileImage(entry.coverImage),
  }
}

function fileImage(image: StoredImage | null): Image | null {
  return image ? { url: image.url, alt: image.alt, width: image.width, height: image.height } : null
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

/** The titles of the projects a tool is used in (ignores links that were not loaded). */
function projectTitles(projects: ToolDoc['usedIn']): string[] {
  return (projects ?? []).flatMap((project) => (typeof project === 'object' && project ? [project.title] : []))
}
