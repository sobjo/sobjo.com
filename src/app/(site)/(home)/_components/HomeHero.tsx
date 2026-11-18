import { Eyebrow } from '@/shared/ui/Eyebrow'

import { Workshop } from './Workshop'

/**
 * The hero is exactly one screen tall under the header. Wide screens put the intro beside the
 * workshop; tall ones stack it above. The workshop drawing scales to whatever space is left.
 */
export function HomeHero() {
  return (
    <section className="dots relative flex h-[calc(100svh-var(--header-h))] flex-col overflow-hidden landscape:flex-row">
      <div className="flex flex-none flex-col px-6 pt-6 landscape:w-[min(500px,42%)] landscape:justify-center landscape:py-6 landscape:pr-2 landscape:pl-10">
        <Eyebrow className="mb-3 short:mb-2">SOBJO · The workshop&apos;s open, come on in</Eyebrow>
        <h1 className="hl m-0 text-[clamp(32px,min(13vw,6.5svh),64px)] landscape:text-[clamp(28px,min(5.5vw,8.5svh),76px)]">
          Hi, we&apos;re
          <br />
          <span className="text-gunnar">Gunnar</span> &amp;
          <br />
          <span className="text-ivanna">Ivanna</span>.
        </h1>
        <p className="mt-4 mb-0 text-base leading-[1.55] text-body short:hidden">
          Two engineers who build little robots together on nights and weekends. This is the room where we tinker, and
          every project we&apos;ve made is riding the line.
        </p>
        <div className="mono mt-5 flex flex-wrap items-center gap-3 text-[11px] font-bold short:mt-3">
          <span className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-butter">
            ▸ Grab something off the line
          </span>
          <span className="text-muted">Drop it in the box to go there</span>
        </div>
      </div>
      <div className="relative min-h-0 min-w-0 flex-1">
        <Workshop />
      </div>
    </section>
  )
}
