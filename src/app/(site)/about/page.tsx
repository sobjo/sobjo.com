import type { Metadata } from 'next'

import { about, interests, people } from '@/content/about'
import { FadeLink } from '@/shared/layout/PageTransition'
import { Eyebrow } from '@/shared/ui/Eyebrow'
import { Wrap } from '@/shared/ui/Wrap'

import { InterestIcon } from './_components/InterestIcon'
import { PersonCard } from './_components/PersonCard'
import { PinnedPhotos } from './_components/PinnedPhotos'

export const metadata: Metadata = { title: 'About us' }

/** All the copy on this page comes from src/content/about.ts. */
export default function AboutPage() {
  return (
    <>
      <section className="dots border-b-[1.5px] border-line">
        <Wrap className="grid items-center gap-10 pt-10 pb-12 md:pt-12 md:pb-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div className="flex min-w-0 flex-col gap-3.5">
            <Eyebrow>03 · About us</Eyebrow>
            <h1 className="hl m-0 text-[clamp(42px,11.5vw,80px)] lg:text-[clamp(56px,5.4vw,80px)]">
              Two engineers.
              <br />
              One shared bench.
            </h1>
            <h2 className="mono mt-2.5 mb-0 text-xs font-bold">Why we built Sobjo</h2>
            <p className="m-0 max-w-[520px] text-base leading-[1.6] text-body">{about.why}</p>
            <h2 className="mono mt-1.5 mb-0 text-xs font-bold">Who we are</h2>
            <p className="m-0 max-w-[520px] text-base leading-[1.6] text-body">{about.who}</p>
            <p className="mono m-0 inline-flex items-center gap-2 self-start rounded-md border-[1.5px] border-line bg-white px-3 py-2 text-[11px] font-bold">
              <span className="text-muted">Successful escape room streak:</span>
              <span className="rounded-sm bg-ink px-1.5 py-0.5 text-butter">{about.escapeRoomStreak}</span>
            </p>
          </div>
          <PinnedPhotos />
        </Wrap>
      </section>

      <section className="border-b-[1.5px] border-line bg-white">
        <Wrap className="py-16">
          <Eyebrow className="mb-2.5">Meet us</Eyebrow>
          <h2 className="hl mt-0 mb-7 text-[40px] md:text-[52px]">The two halves of SOBJO</h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr))]">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} />
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
