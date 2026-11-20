import type { Metadata } from 'next'

import { Wrap } from '@/shared/ui/Wrap'

export const metadata: Metadata = { title: 'Notebook' }

/**
 * The notebook is on hold for now: the entries stay in the CMS (and each entry's own page
 * still works), but this page only shows a short note until we're ready to publish them.
 */
export default function NotebookPage() {
  return (
    <>
      <section className="dots border-b-[1.5px] border-line">
        <Wrap className="py-14">
          <h1 className="hl m-0 text-[64px] md:text-[96px]">The notebook</h1>
        </Wrap>
      </section>
      <section className="bg-white">
        <Wrap className="py-16">
          <p className="m-0 text-[17px] leading-[1.6] text-body">Nothing to see here yet, hopefully soon though!</p>
        </Wrap>
      </section>
    </>
  )
}
