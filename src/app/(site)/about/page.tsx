import type { Metadata } from 'next'

import { PhotoSwap } from '@/components/about/PhotoSwap'
import { PinnedPhotos } from '@/components/about/PinnedPhotos'
import { InterestIcon } from '@/components/art/InterestIcon'
import { FadeLink } from '@/components/site/PageTransition'
import { BuilderPill, Eyebrow, Wrap } from '@/components/ui/bits'
import { about, interests, people } from '@/content/site'

export const metadata: Metadata = { title: 'About us' }

export default function AboutPage() {
  return (
    <>
      <section className="dots border-b-[1.5px] border-line">
        <Wrap className="flex flex-wrap items-center gap-12 pt-12 pb-14">
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-3.5">
            <Eyebrow>03 · About us</Eyebrow>
            <h1 className="hl m-0 text-[56px] md:text-[80px]">
              Two engineers.
              <br />
              One shared bench.
            </h1>
            <h2 className="mono mt-2.5 mb-0 text-xs font-bold">Why we built SOBJO</h2>
            <p className="m-0 max-w-[520px] text-base leading-[1.6] text-body">{about.why}</p>
            <h2 className="mono mt-1.5 mb-0 text-xs font-bold">Who we are</h2>
            <p className="m-0 max-w-[520px] text-base leading-[1.6] text-body">{about.who}</p>
          </div>
          <PinnedPhotos />
        </Wrap>
      </section>

      <section className="border-b-[1.5px] border-line bg-white">
        <Wrap className="py-16">
          <Eyebrow className="mb-2.5">Meet us</Eyebrow>
          <h2 className="hl mt-0 mb-2 text-[40px] md:text-[52px]">The two halves of SOBJO</h2>
          <p className="mt-0 mb-7 text-[15px] text-body">Hover over a photo to meet our cartoon selves.</p>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr))]">
            {people.map((person) => (
              <article
                key={person.id}
                className={`card flex flex-wrap gap-6 border-t-[6px]! p-6 ${person.id === 'gunnar' ? 'border-t-gunnar!' : 'border-t-ivanna!'}`}
              >
                <PhotoSwap person={person} />
                <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-3">
                  <span className="mono self-start text-[11px]">
                    <BuilderPill builder={person.id} />
                  </span>
                  <h3 className="hl m-0 text-[40px]">
                    {person.firstName} {person.lastName}
                  </h3>
                  <dl className="m-0 grid grid-cols-[100px_1fr] gap-x-3 gap-y-2 text-sm leading-normal">
                    <dt className="mono pt-[3px] text-[10px] text-muted">Education</dt>
                    <dd className="m-0">{person.education}</dd>
                    <dt className="mono pt-[3px] text-[10px] text-muted">Work</dt>
                    <dd className="m-0">{person.work}</dd>
                    <dt className="mono pt-[3px] text-[10px] text-muted">On our builds</dt>
                    <dd className="m-0 text-body">{person.onOurBuilds}</dd>
                  </dl>
                  <div className="flex flex-wrap gap-5">
                    <a href={person.linkedin} className="ulink py-2">
                      LinkedIn
                    </a>
                    <a href={person.github} className="ulink py-2">
                      GitHub
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Wrap>
      </section>

      <section className="dots border-b-[1.5px] border-line">
        <Wrap className="py-16">
          <Eyebrow className="mb-2.5">Shared interests</Eyebrow>
          <h2 className="hl mt-0 mb-7 text-[40px] md:text-[52px]">What we geek out about</h2>
          <ul className="m-0 grid list-none gap-3.5 p-0 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
            {interests.map((name) => (
              <li key={name} className="card flex flex-col gap-3 p-4">
                <InterestIcon name={name} />
                <span className="hl text-2xl">{name}</span>
              </li>
            ))}
          </ul>
        </Wrap>
      </section>

      <section className="bg-white">
        <Wrap className="flex flex-wrap items-center justify-between gap-5 py-12">
          <h2 className="hl m-0 text-[40px]">See what we&apos;ve been building</h2>
          <FadeLink href="/projects" className="btn">
            View projects →
          </FadeLink>
        </Wrap>
      </section>
    </>
  )
}
