import type { Builder, Illustration, ProjectStatus, Tint } from './types'

/*
 * The shapes of the two content files that the /update-site editor writes:
 *
 *   src/content/projects.json   every project, in the order the site shows them
 *   src/content/notebook.json   every notebook entry, drafts included
 *
 * Long text (a project's write-up, a notebook entry) is Markdown. Photos live in
 * public/uploads/ and are referenced by their URL, like "/uploads/projects/cheetah-1732.jpg".
 *
 * `cleanProjects` and `cleanEntries` check whatever the editor sends before it is
 * committed, so a bad save can never break the build.
 */

export const CONTENT_PATHS = {
  projects: 'src/content/projects.json',
  notebook: 'src/content/notebook.json',
} as const
export type ContentKind = keyof typeof CONTENT_PATHS

export interface StoredImage {
  url: string
  alt: string
  width?: number
  height?: number
}

export interface ProjectEntry {
  slug: string
  title: string
  status: ProjectStatus
  year: string | null
  builders: Builder[]
  summary: string | null
  tools: string | null
  illustration: Illustration
  tint: Tint
  featured: boolean
  /** Link text on the project's card. Empty means the default for its status. */
  ctaLabel: string
  photo: StoredImage | null
  /** The write-up, in Markdown. */
  body: string
}

export interface NotebookEntry {
  slug: string
  title: string
  summary: string | null
  entryNumber: number | null
  author: Builder
  category: string | null
  /** A day, like "2026-11-20". */
  publishedAt: string | null
  /** Drafts stay off the site. */
  status: 'draft' | 'published'
  coverImage: StoredImage | null
  /** The entry, in Markdown. */
  content: string
}

export const BUILDERS: Builder[] = ['gunnar', 'ivanna']
export const STATUSES: ProjectStatus[] = ['in-progress', 'finished', 'napkin']
export const ILLUSTRATIONS: Illustration[] = ['cheetah', 'cube', 'miniq', 'kvm', 'idea']
export const TINTS: Tint[] = ['sand', 'steel', 'blush', 'paper']

/** Turns a title into a URL slug: "Lab ASRS" → "lab-asrs". */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Minutes to read a Markdown text, at about 220 words a minute. */
export function readMinutes(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  return words === 0 ? null : Math.max(1, Math.round(words / 220))
}

// ------------------------------------------------------------------ checking what the editor sends

class ContentError extends Error {}
export { ContentError }

function text(value: unknown, field: string, { required = false, max = 20000 } = {}): string | null {
  if (value == null || value === '') {
    if (required) throw new ContentError(`${field} is required`)
    return null
  }
  if (typeof value !== 'string') throw new ContentError(`${field} must be text`)
  const trimmed = value.trim()
  if (required && !trimmed) throw new ContentError(`${field} is required`)
  if (trimmed.length > max) throw new ContentError(`${field} is too long`)
  return trimmed || null
}

function oneOf<T extends string>(value: unknown, options: readonly T[], field: string): T {
  if (typeof value === 'string' && (options as readonly string[]).includes(value)) return value as T
  throw new ContentError(`${field} must be one of ${options.join(', ')}`)
}

/** Only our own uploads or https links, so nobody can sneak a script URL into an image. */
function image(value: unknown, field: string): StoredImage | null {
  if (value == null) return null
  if (typeof value !== 'object') throw new ContentError(`${field} is not a picture`)
  const { url, alt, width, height } = value as Record<string, unknown>
  if (typeof url !== 'string' || !/^(\/uploads\/[\w./-]+|https:\/\/\S+)$/.test(url) || url.includes('..'))
    throw new ContentError(`${field} has a bad link`)
  return {
    url,
    alt: text(alt, `${field} description`, { max: 300 }) ?? '',
    ...(typeof width === 'number' && width > 0 ? { width: Math.round(width) } : {}),
    ...(typeof height === 'number' && height > 0 ? { height: Math.round(height) } : {}),
  }
}

function uniqueSlugs(slugs: string[], what: string) {
  const seen = new Set<string>()
  for (const slug of slugs) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new ContentError(`"${slug}" is not a valid link name for a ${what}`)
    if (seen.has(slug)) throw new ContentError(`Two ${what}s share the link name "${slug}"`)
    seen.add(slug)
  }
}

export function cleanProjects(input: unknown): ProjectEntry[] {
  if (!Array.isArray(input)) throw new ContentError('Projects must be a list')
  const projects = input.map((raw, i): ProjectEntry => {
    const p = (raw ?? {}) as Record<string, unknown>
    const title = text(p.title, `Project ${i + 1} title`, { required: true, max: 120 })!
    return {
      slug: text(p.slug, `${title} link name`, { required: true, max: 60 })!,
      title,
      status: oneOf(p.status, STATUSES, `${title} status`),
      year: text(p.year, `${title} dates`, { max: 80 }),
      builders: Array.isArray(p.builders) ? BUILDERS.filter((b) => (p.builders as unknown[]).includes(b)) : [],
      summary: text(p.summary, `${title} summary`, { max: 600 }),
      tools: text(p.tools, `${title} parts and software`, { max: 2000 }),
      illustration: oneOf(p.illustration, ILLUSTRATIONS, `${title} drawing`),
      tint: oneOf(p.tint, TINTS, `${title} background`),
      featured: p.featured === true,
      ctaLabel: text(p.ctaLabel, `${title} link text`, { max: 60 }) ?? '',
      photo: image(p.photo, `${title} photo`),
      body: text(p.body, `${title} write-up`, { max: 200000 }) ?? '',
    }
  })
  uniqueSlugs(
    projects.map((p) => p.slug),
    'project',
  )
  return projects
}

export function cleanEntries(input: unknown): NotebookEntry[] {
  if (!Array.isArray(input)) throw new ContentError('Notebook entries must be a list')
  const entries = input.map((raw, i): NotebookEntry => {
    const e = (raw ?? {}) as Record<string, unknown>
    const title = text(e.title, `Entry ${i + 1} title`, { required: true, max: 160 })!
    const date = text(e.publishedAt, `${title} date`, { max: 10 })
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ContentError(`${title} date must look like 2026-11-20`)
    const number = e.entryNumber
    if (number != null && number !== '' && !(Number.isInteger(number) && (number as number) >= 0))
      throw new ContentError(`${title} entry number must be a whole number`)
    return {
      slug: text(e.slug, `${title} link name`, { required: true, max: 60 })!,
      title,
      summary: text(e.summary, `${title} summary`, { max: 600 }),
      entryNumber: typeof number === 'number' ? number : null,
      author: oneOf(e.author, BUILDERS, `${title} author`),
      category: text(e.category, `${title} category`, { max: 60 }),
      publishedAt: date,
      status: oneOf(e.status, ['draft', 'published'] as const, `${title} status`),
      coverImage: image(e.coverImage, `${title} cover photo`),
      content: text(e.content, `${title} text`, { max: 200000 }) ?? '',
    }
  })
  uniqueSlugs(
    entries.map((e) => e.slug),
    'notebook entry',
  )
  return entries
}
