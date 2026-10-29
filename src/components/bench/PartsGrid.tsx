'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { PartIcon } from '@/components/art/PartIcon'
import { PART_GROUPS } from '@/lib/labels'
import type { Part, PartGroup } from '@/lib/types'

type Filter = 'all' | PartGroup

export function FilterButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`mono min-h-10 cursor-pointer rounded-md border-[1.5px] px-3 text-[11px] font-bold ${
        pressed ? 'border-ink bg-ink text-white' : 'border-chip bg-white text-ink hover:border-ink'
      }`}
    >
      {children}
    </button>
  )
}

export function PartsGrid({ parts, heading }: { parts: Part[]; heading: React.ReactNode }) {
  const [filter, setFilter] = useState<Filter>('all')
  const groups = PART_GROUPS.filter((g) => parts.some((p) => p.group === g.value))
  const shown = filter === 'all' ? parts : parts.filter((p) => p.group === filter)

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        {heading}
        <div role="group" aria-label="Filter parts" className="flex flex-wrap gap-1.5">
          <FilterButton pressed={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </FilterButton>
          {groups.map((g) => (
            <FilterButton key={g.value} pressed={filter === g.value} onClick={() => setFilter(g.value)}>
              {g.label}
            </FilterButton>
          ))}
        </div>
      </div>
      <motion.div layout className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr))]">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((part) => {
            const group = PART_GROUPS.find((g) => g.value === part.group) ?? PART_GROUPS[0]
            return (
              <motion.div
                key={part.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="card flex items-center gap-3.5 p-4"
              >
                <PartIcon colors={group.colors} />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="mono text-[10px] text-muted">{group.label}</span>
                  <span className="hl text-2xl">{part.name}</span>
                  {part.description && <span className="text-[13px] text-body">{part.description}</span>}
                  {part.usedIn.length > 0 && (
                    <span className="mono text-[9px] text-muted">Used in: {part.usedIn.join(', ')}</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
