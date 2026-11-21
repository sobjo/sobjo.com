import type { Metadata } from 'next'

import { getBench } from '@/shared/lib/content'
import { Eyebrow } from '@/shared/ui/Eyebrow'
import { Wrap } from '@/shared/ui/Wrap'

import { EquipmentCard } from './_components/EquipmentCard'
import { PartsGrid } from './_components/PartsGrid'
import { SoftwareGroupCard } from './_components/SoftwareGroupCard'
import { groupSoftware } from './_lib/bench-page-data'

export const metadata: Metadata = { title: 'Our bench' }
/** Refresh the page from the CMS at most every 5 minutes. */
export const revalidate = 300

/** The "jump to section" links under the page title. */
const SECTION_LINKS = [
  { href: '#hardware', label: 'Hardware' },
  { href: '#software', label: 'Software' },
  { href: '#equipment', label: 'Lab equipment' },
]

export default async function BenchPage() {
  const { equipment, parts, software } = await getBench()
  const softwareGroups = groupSoftware(software)

  return (
    <>
      <section className="dots border-b-[1.5px] border-line">
        <Wrap className="py-14">
          <div className="flex max-w-[640px] flex-col gap-3.5">
            <h1 className="hl m-0 text-[64px] md:text-[96px]">Our bench</h1>
            <p className="m-0 max-w-[480px] text-base leading-[1.6] text-body">
              The equipment, parts and software behind every SOBJO build.
            </p>
            <nav aria-label="On this page" className="mono mt-1.5 flex flex-wrap gap-2 text-[11px] font-bold">
              {SECTION_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-md border-[1.5px] border-line bg-white px-3 py-2 no-underline"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </Wrap>
      </section>

      <section id="hardware" className="scroll-mt-4 border-b-[1.5px] border-line bg-white">
        <Wrap className="py-16">
          {/* The heading is passed in so it sits on the same row as the part filters. */}
          <PartsGrid
            parts={parts}
            heading={
              <div>
                <Eyebrow className="mb-2.5">Hardware</Eyebrow>
                <h2 className="hl m-0 text-[40px] md:text-[52px]">The parts in our builds</h2>
                <p className="mt-2.5 mb-0 max-w-[520px] text-[15px] leading-[1.55] text-body">
                  The boards, sensors, motors and radios we build with.
                </p>
              </div>
            }
          />
        </Wrap>
      </section>

      <section id="software" className="scroll-mt-4 border-b-[1.5px] border-line bg-white">
        <Wrap className="py-16">
          <Eyebrow className="mb-2.5">Software</Eyebrow>
          <h2 className="hl mt-0 mb-2 text-[40px] md:text-[52px]">What runs on our computers</h2>
          <p className="mt-0 mb-7 max-w-[560px] text-[15px] leading-[1.55] text-body">
            From the languages our firmware is written in to the tools we design and plan with.
          </p>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
            {softwareGroups.map((group) => (
              <SoftwareGroupCard key={group.value} group={group} />
            ))}
          </div>
        </Wrap>
      </section>

      <section id="equipment" className="scroll-mt-4 bg-white">
        <Wrap className="py-16">
          <Eyebrow className="mb-2.5">Lab equipment</Eyebrow>
          <h2 className="hl mt-0 mb-7 text-[40px] md:text-[52px]">The big stuff on the bench</h2>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {equipment.map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>
        </Wrap>
      </section>
    </>
  )
}
