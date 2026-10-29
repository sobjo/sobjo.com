import type { Metadata } from 'next'

import { IsoArt } from '@/components/art/ProjectArt'
import { FadeLink } from '@/components/site/PageTransition'
import { Eyebrow, Wrap } from '@/components/ui/bits'

export const metadata: Metadata = { title: 'Say hi' }

/**
 * Placeholder until the contact form is designed. The plan: a form that checks
 * Cloudflare Turnstile, stores the message in the `messages` collection and
 * emails it to both of you with Resend.
 */
export default function SayHiPage() {
  return (
    <section className="dots">
      <Wrap className="flex flex-wrap items-center gap-10 py-20">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
          <Eyebrow>06 · Say hi</Eyebrow>
          <h1 className="hl m-0 text-[64px] md:text-[96px]">Say hi.</h1>
          <p className="m-0 max-w-[480px] text-base leading-[1.6] text-body">
            Questions about a build, an idea, or just hello. We read everything. The contact form is still on the
            bench, so check back soon.
          </p>
          <FadeLink href="/" className="btn mt-2 self-start">
            Back to the line ↑
          </FadeLink>
        </div>
        <div className="card flex flex-[1_1_320px] items-center justify-center p-6">
          <IsoArt name="letter" width={300} height={240} />
        </div>
      </Wrap>
    </section>
  )
}
