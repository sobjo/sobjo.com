import { IsoArt } from '@/components/art/ProjectArt'
import { FadeLink } from '@/components/site/PageTransition'
import { Eyebrow, Wrap } from '@/components/ui/bits'

export default function NotFound() {
  return (
    <section className="dots">
      <Wrap className="flex flex-wrap items-center gap-10 py-20">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
          <Eyebrow>404 · Fell off the line</Eyebrow>
          <h1 className="hl m-0 text-[64px] md:text-[96px]">Nothing here.</h1>
          <p className="m-0 max-w-[480px] text-base leading-[1.6] text-body">
            That page isn&apos;t on the bench. Head back to the workshop and grab something else.
          </p>
          <FadeLink href="/" className="btn mt-2 self-start">
            Back to the line ↑
          </FadeLink>
        </div>
        <div className="card flex flex-[1_1_320px] items-center justify-center p-6">
          <IsoArt name="idea" width={300} height={240} />
        </div>
      </Wrap>
    </section>
  )
}
