import type { Metadata } from 'next'

import { getPosts } from '@/shared/lib/content'
import { Eyebrow } from '@/shared/ui/Eyebrow'
import { PostCard } from '@/shared/ui/PostCard'
import { Wrap } from '@/shared/ui/Wrap'

export const metadata: Metadata = { title: 'Notebook' }
/** Refresh the page from the CMS at most every 5 minutes. */
export const revalidate = 300

export default async function NotebookPage() {
  const posts = await getPosts()

  return (
    <>
      <section className="dots border-b-[1.5px] border-line">
        <Wrap className="py-14">
          <div className="flex max-w-[640px] flex-col gap-3.5">
            <Eyebrow>Notebook</Eyebrow>
            <h1 className="hl m-0 text-[64px] md:text-[96px]">The notebook</h1>
            <p className="m-0 max-w-[480px] text-base leading-[1.6] text-body">
              Build logs, things that broke, how we fixed them, and small wins.
            </p>
          </div>
        </Wrap>
      </section>
      <section className="bg-white">
        <Wrap className="py-16">
          {posts.length > 0 ? (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-body">The first entry is still on the bench.</p>
          )}
        </Wrap>
      </section>
    </>
  )
}
