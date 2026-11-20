import { createHash } from 'crypto'

import notebookFile from '@/content/notebook.json'
import projectsFile from '@/content/projects.json'
import { CONTENT_PATHS, type ContentKind, type NotebookEntry, type ProjectEntry } from '@/shared/lib/content-files'
import { githubConfigured, readTextFile } from '@/shared/lib/github'

/** The id GitHub gives a file's contents, worked out locally so a save can return it without another request. */
export function blobSha(text: string) {
  const bytes = Buffer.from(text, 'utf8')
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
}

/** How a content file is written: two-space JSON with a newline at the end, like the rest of the repo. */
export function serialize(data: unknown) {
  return JSON.stringify(data, null, 2) + '\n'
}

export interface Loaded<T> {
  items: T[]
  /** The version this copy was read from; a save is refused if the file changed since. */
  sha: string
  /** Where it was read from: the live repo, or this deploy's own copy (when GitHub isn't set up). */
  source: 'github' | 'deploy'
}

const bundled = { projects: projectsFile, notebook: notebookFile }

/**
 * Reads a content file. It reads the newest version straight from GitHub, so an edit
 * saved a minute ago shows up even before Vercel finishes redeploying.
 */
async function load<T>(kind: ContentKind): Promise<Loaded<T>> {
  if (githubConfigured) {
    const { text, sha } = await readTextFile(CONTENT_PATHS[kind])
    return { items: JSON.parse(text) as T[], sha, source: 'github' }
  }
  const items = bundled[kind] as T[]
  return { items, sha: blobSha(serialize(items)), source: 'deploy' }
}

export const loadProjects = () => load<ProjectEntry>('projects')
export const loadNotebook = () => load<NotebookEntry>('notebook')
