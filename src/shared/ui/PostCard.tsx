import { FadeLink } from '@/shared/layout/PageTransition'
import type { Post } from '@/shared/lib/types'

import { BuilderPill } from './BuilderPill'

/** "Entry 06", or just "Entry" when the post has no number yet. */
export function entryLabel(entryNumber: number | null) {
  return entryNumber == null ? 'Entry' : `Entry ${String(entryNumber).padStart(2, '0')}`
}

/** A notebook entry preview that links to the full entry. Used on the Notebook page and on project pages. */
export function PostCard({ post }: { post: Post }) {
  const meta = [post.dateLabel, post.readLabel, post.project?.title].filter(Boolean).join(' · ')

  return (
    <FadeLink href={`/notebook/${post.slug}`} className="card flex flex-col gap-2.5 p-5">
      <div className="mono flex flex-wrap items-center gap-2 text-[10px] text-muted">
        <span>{entryLabel(post.entryNumber)}</span>
        <BuilderPill builder={post.author} />
        {post.category && <span>{post.category}</span>}
      </div>
      <span className="hl text-[28px]">{post.title}</span>
      {post.summary && <span className="text-sm leading-normal text-body">{post.summary}</span>}
      {meta && <span className="mono text-[10px] text-muted">{meta}</span>}
    </FadeLink>
  )
}
