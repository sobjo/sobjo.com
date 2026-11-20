import type { Metadata } from 'next'

import { getPosts } from '@/shared/lib/content'
import { PostCard } from '@/shared/ui/PostCard'
import { Wrap } from '@/shared/ui/Wrap'

export const metadata: Metadata = { title: 'Notebook' }

/**
 * Every published notebook entry, newest first. Entries are written at /update-site
 * and stay hidden while they're drafts; until one is published this page shows a short note.
 */
export default async function NotebookPage() {
  const posts = await getPosts()

  return (
    <>
      <section className="dots border-b-[1.5px] border-line">
        <Wrap className="py-14">
          <h1 className="hl m-0 text-[64px] md:text-[96px]">The notebook</h1>
        </Wrap>
      </section>
      <section className="bg-white">
        <Wrap className="py-16">
          {posts.length === 0 ? (
            <p className="m-0 text-[17px] leading-[1.6] text-body">Nothing to see here yet, hopefully soon though!</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </Wrap>
      </section>
    </>
  )
}
