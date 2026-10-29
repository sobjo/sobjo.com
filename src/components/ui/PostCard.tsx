import { FadeLink } from '@/components/site/PageTransition'
import type { Post } from '@/lib/types'

import { BuilderPill } from './bits'

export function entryLabel(n: number | null) {
  return n == null ? 'Entry' : `Entry ${String(n).padStart(2, '0')}`
}

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
