import { Octokit } from '@octokit/rest'

/*
 * Reads and commits files in the site's GitHub repo, for the /update-site editor.
 * Every save is one commit on GITHUB_BRANCH, which makes Vercel redeploy the site.
 *
 * Needs GITHUB_TOKEN: a fine-grained token with "Contents: read and write" on the repo.
 */

const [owner, repo] = (process.env.GITHUB_REPO || 'sobjo/sobjo.com').split('/')
const branch = process.env.GITHUB_BRANCH || 'main'

/** Commits from the editor are made as the site's own account, like every other commit in the repo. */
const COMMIT_AUTHOR = { name: 'sobjo', email: '349906495+sobjo@users.noreply.github.com' }

export const githubConfigured = Boolean(process.env.GITHUB_TOKEN)

function client() {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not set')
  return new Octokit({
    auth: process.env.GITHUB_TOKEN,
    // Only for testing against a stand-in server; leave unset to use github.com.
    ...(process.env.GITHUB_API_URL ? { baseUrl: process.env.GITHUB_API_URL } : {}),
    userAgent: 'sobjo-update-site',
  })
}

/** Someone else saved the same file since this copy was loaded. */
export class ConflictError extends Error {}

/** A text file on the branch, with the id ("sha") of the version read, so a save can tell if it changed since. */
export async function readTextFile(path: string): Promise<{ text: string; sha: string }> {
  const { data } = await client().repos.getContent({ owner, repo, path, ref: branch })
  if (Array.isArray(data) || data.type !== 'file') throw new Error(`${path} is not a file`)
  // The contents API leaves out the text of files over 1 MB; the blob API always has it.
  const content =
    'content' in data && data.content
      ? data.content
      : (await client().git.getBlob({ owner, repo, file_sha: data.sha })).data.content
  return { text: Buffer.from(content, 'base64').toString('utf8'), sha: data.sha }
}

export interface FileChange {
  path: string
  /** Text files as text, pictures as base64. */
  content: string
  encoding: 'utf-8' | 'base64'
}

/**
 * Commits all `files` together as one commit on the branch.
 *
 * `guard` names a file and the version of it the editor started from; if that file
 * changed on the branch since then, nothing is committed and a ConflictError is thrown.
 */
export async function commitFiles({
  files,
  message,
  guard,
}: {
  files: FileChange[]
  message: string
  guard?: { path: string; sha: string }
}): Promise<{ commitSha: string; commitUrl: string }> {
  const gh = client()

  // Tries twice, in case another commit lands on the branch between reading and updating it.
  for (let attempt = 0; ; attempt++) {
    const { data: ref } = await gh.git.getRef({ owner, repo, ref: `heads/${branch}` })
    const parentSha = ref.object.sha

    if (guard) {
      const current = await gh.repos.getContent({ owner, repo, path: guard.path, ref: parentSha })
      if (Array.isArray(current.data) || current.data.sha !== guard.sha) throw new ConflictError(guard.path)
    }

    const { data: parent } = await gh.git.getCommit({ owner, repo, commit_sha: parentSha })
    const tree = await Promise.all(
      files.map(async (file) => {
        const { data: blob } = await gh.git.createBlob({ owner, repo, content: file.content, encoding: file.encoding })
        return { path: file.path, mode: '100644' as const, type: 'blob' as const, sha: blob.sha }
      }),
    )
    const { data: newTree } = await gh.git.createTree({ owner, repo, base_tree: parent.tree.sha, tree })
    const now = new Date().toISOString()
    const { data: commit } = await gh.git.createCommit({
      owner,
      repo,
      message,
      tree: newTree.sha,
      parents: [parentSha],
      author: { ...COMMIT_AUTHOR, date: now },
      committer: { ...COMMIT_AUTHOR, date: now },
    })

    try {
      await gh.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: commit.sha, force: false })
      return { commitSha: commit.sha, commitUrl: `https://github.com/${owner}/${repo}/commit/${commit.sha}` }
    } catch (error) {
      // 422 means the branch moved on; read it again and retry once.
      if (attempt === 0 && (error as { status?: number }).status === 422) continue
      throw error
    }
  }
}
