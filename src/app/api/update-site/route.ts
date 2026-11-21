import { NextResponse } from 'next/server'

import { blobSha, serialize } from '@/app/(admin)/update-site/_lib/load'
import { currentEditor } from '@/shared/lib/auth'
import {
  CONTENT_PATHS,
  ContentError,
  cleanEntries,
  cleanProjects,
  saveDay,
  stampProjects,
  type ContentKind,
  type ProjectEntry,
} from '@/shared/lib/content-files'
import { ConflictError, commitFiles, githubConfigured, readTextFile, type FileChange } from '@/shared/lib/github'

/*
 * Saves the /update-site editor's changes: checks who is signed in, checks the
 * content, then commits the content file (plus any new photos) to GitHub as one
 * commit. Vercel redeploys the site from that commit in a minute or two.
 */

/** Photos are shrunk in the browser before upload; this is a backstop. */
const MAX_PHOTO_BYTES = 3 * 1024 * 1024
const PHOTO_PATH = /^uploads\/(projects|notebook)\/[a-z0-9][a-z0-9-]*\.(jpg|png|webp)$/

interface SaveRequest {
  kind: ContentKind
  items: unknown
  /** The version of the content file the editor started from. */
  sha: string
  /** New photos, with paths inside public/. */
  uploads?: { path: string; data: string }[]
  message?: string
  /** The day it is for the person saving, like "2026-11-20", used for projects' last updated date. */
  today?: string
}

/** Checks the first bytes, so only real JPEG, PNG or WebP pictures get committed. */
function isPicture(bytes: Buffer) {
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const png = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const webp = bytes.subarray(0, 4).toString('latin1') === 'RIFF' && bytes.subarray(8, 12).toString('latin1') === 'WEBP'
  return jpeg || png || webp
}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: Request) {
  const editor = await currentEditor()
  if (!editor) return fail(401, 'Please sign in again.')
  if (!githubConfigured) return fail(503, 'Saving is off until GITHUB_TOKEN is added in Vercel.')

  let body: SaveRequest
  try {
    body = (await request.json()) as SaveRequest
  } catch {
    return fail(400, 'That save was garbled. Try again.')
  }
  if (body.kind !== 'projects' && body.kind !== 'notebook') return fail(400, 'Unknown content.')
  if (typeof body.sha !== 'string' || !/^[0-9a-f]{40}$/.test(body.sha)) return fail(400, 'Missing version.')

  const path = CONTENT_PATHS[body.kind]
  const conflict = () =>
    fail(409, 'Someone saved these since you opened the page. Reload to get their changes, then redo yours.')

  let items: unknown[]
  try {
    if (body.kind === 'projects') {
      // Compare with the saved file, so only the projects this save changes get a new last updated date.
      const saved = await readTextFile(path)
      if (saved.sha !== body.sha) return conflict()
      items = stampProjects(cleanProjects(body.items), JSON.parse(saved.text) as ProjectEntry[], saveDay(body.today))
    } else {
      items = cleanEntries(body.items)
    }
  } catch (error) {
    if (error instanceof ContentError) return fail(400, error.message)
    throw error
  }
  const text = serialize(items)
  const files: FileChange[] = [{ path, content: text, encoding: 'utf-8' }]
  for (const upload of body.uploads ?? []) {
    if (typeof upload?.path !== 'string' || !PHOTO_PATH.test(upload.path) || typeof upload.data !== 'string')
      return fail(400, 'A photo had a bad name.')
    const bytes = Buffer.from(upload.data, 'base64')
    if (bytes.length > MAX_PHOTO_BYTES) return fail(413, 'A photo is too big, even after shrinking.')
    if (!isPicture(bytes)) return fail(400, 'Only JPEG, PNG or WebP photos can be added.')
    files.push({ path: `public/${upload.path}`, content: upload.data, encoding: 'base64' })
  }

  const what = body.kind === 'projects' ? 'projects' : 'notebook'
  const message = (typeof body.message === 'string' && body.message.trim().slice(0, 120)) || `update ${what}`

  try {
    const { commitUrl } = await commitFiles({ files, message, guard: { path, sha: body.sha } })
    // The items as saved (with any new dates), so the editor's copy matches the file.
    return NextResponse.json({ ok: true, sha: blobSha(text), commitUrl, items })
  } catch (error) {
    if (error instanceof ConflictError) return conflict()
    console.error('update-site save failed', error)
    return fail(502, 'GitHub refused the save. Check that GITHUB_TOKEN is valid and can write to the repo.')
  }
}
