import { authConfigured, currentEditor } from '@/shared/lib/auth'
import { githubConfigured } from '@/shared/lib/github'

import { Editor } from './_components/Editor'
import { SetupNotice } from './_components/SetupNotice'
import { SignInCard } from './_components/SignInCard'
import { loadNotebook, loadProjects } from './_lib/load'

/*
 * /update-site: the private editor for projects and notebook entries.
 *
 * Signed out, it shows a Google sign-in button. Signed in with an email from
 * ALLOWED_EMAILS, it loads the newest content files from GitHub and shows the
 * editor. Saving commits to GitHub (see src/app/api/update-site/route.ts).
 */

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ error?: string }> }

export default async function UpdateSitePage({ searchParams }: Props) {
  if (!authConfigured) return <SetupNotice />

  const editor = await currentEditor()
  if (!editor) {
    const { error } = await searchParams
    return <SignInCard error={error} />
  }

  const [projects, notebook] = await Promise.all([loadProjects(), loadNotebook()])
  return <Editor email={editor} projects={projects} notebook={notebook} canSave={githubConfigured} />
}
