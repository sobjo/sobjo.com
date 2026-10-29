import type { Metadata } from 'next'

import { BenchProvider } from '@/components/bench/BenchContext'
import { BenchScene } from '@/components/bench/BenchScene'
import type { Pin } from '@/components/bench/bench-scene'
import { EquipmentCard } from '@/components/bench/EquipmentCard'
import { PartsGrid } from '@/components/bench/PartsGrid'
import { Eyebrow, Wrap } from '@/components/ui/bits'
import { getBench } from '@/lib/content'
import { SOFTWARE_GROUPS } from '@/lib/labels'
import type { BenchSpot } from '@/lib/types'

export const metadata: Metadata = { title: 'Our bench' }
export const revalidate = 300

const JUMPS = [
  { href: '#equipment', label: '01 Lab equipment' },
  { href: '#hardware', label: '02 Hardware' },
  { href: '#software', label: '03 Software' },
]

export default async function BenchPage() {
  const { equipment, parts, software } = await getBench()
  // Each card's number is pinned over its spot on the drawing; pieces with no card get no pin.
  const pins: Pin[] = []
  equipment.forEach((e, i) => {
    if (e.spot && !pins.some((p) => p.spot === e.spot)) pins.push({ spot: e.spot, number: i + 1 })
  })
  const initial: BenchSpot | null = pins.some((p) => p.spot === 'printer') ? 'printer' : (pins[0]?.spot ?? null)
  const softwareGroups = SOFTWARE_GROUPS.map((g) => ({ ...g, items: software.filter((s) => s.group === g.value) })).filter(
    (g) => g.items.length > 0,
  )

  return (
    <BenchProvider initial={initial}>
      <section className="dots border-b-[1.5px] border-line">
        <Wrap className="flex flex-wrap items-center gap-8 pt-10 pb-6">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
            <Eyebrow>Room 02 · Our bench</Eyebrow>
            <h1 className="hl m-0 text-[56px] md:text-[80px]">
              Everything
              <br />
              on our bench.
            </h1>
            <p className="m-0 max-w-[480px] text-base leading-[1.6] text-body">
              The equipment, parts and software behind every SOBJO build. Hover over a card below to find it on the
              bench.
            </p>
            <nav aria-label="On this page" className="mono mt-1.5 flex flex-wrap gap-2 text-[11px] font-bold">
              {JUMPS.map((j) => (
                <a
                  key={j.href}
                  href={j.href}
                  className="rounded-md border-[1.5px] border-line bg-white px-3 py-2 no-underline"
                >
                  {j.label}
                </a>
              ))}
            </nav>
          </div>
          <BenchScene pins={pins} />
        </Wrap>
      </section>

      <section id="equipment" className="scroll-mt-4 border-b-[1.5px] border-line bg-white">
        <Wrap className="py-16">
          <Eyebrow className="mb-2.5">01 · Lab equipment</Eyebrow>
          <h2 className="hl mt-0 mb-7 text-[40px] md:text-[52px]">The big stuff on the bench</h2>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {equipment.map((item, i) => (
              <EquipmentCard key={item.id} item={item} number={i + 1} />
            ))}
          </div>
        </Wrap>
      </section>

      <section id="hardware" className="dots scroll-mt-4 border-b-[1.5px] border-line">
        <Wrap className="py-16">
          <PartsGrid
            parts={parts}
            heading={
              <div>
                <Eyebrow className="mb-2.5">02 · Hardware</Eyebrow>
                <h2 className="hl m-0 text-[40px] md:text-[52px]">The parts in our builds</h2>
                <p className="mt-2.5 mb-0 max-w-[520px] text-[15px] leading-[1.55] text-body">
                  Boards, sensors, motors and materials, each tagged with the projects that use them.
                </p>
              </div>
            }
          />
        </Wrap>
      </section>

      <section id="software" className="scroll-mt-4 bg-white">
        <Wrap className="py-16">
          <Eyebrow className="mb-2.5">03 · Software</Eyebrow>
          <h2 className="hl mt-0 mb-2 text-[40px] md:text-[52px]">What runs on our computers</h2>
          <p className="mt-0 mb-7 max-w-[560px] text-[15px] leading-[1.55] text-body">
            From the languages our firmware is written in to the tools we design and plan with.
          </p>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
            {softwareGroups.map((group) => (
              <div key={group.value} className="card flex flex-col gap-3.5 p-5">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-[3px]" style={{ background: group.color }} />
                  <span className="hl text-[26px]">{group.label}</span>
                </div>
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 border-t-[1.5px] border-mist pt-3">
                    <span className="mono min-w-10 flex-none rounded bg-ink p-1.5 text-center text-[10px] font-bold text-butter">
                      {item.tag || '·'}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-bold">{item.name}</span>
                      {item.description && <span className="text-[13px] text-muted">{item.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Wrap>
      </section>
    </BenchProvider>
  )
}
