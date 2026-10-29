'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { STATUS_FILTER_LABEL } from '@/lib/labels'
import type { Project, ProjectStatus } from '@/lib/types'

type Filter = 'all' | ProjectStatus
const FILTERS: Filter[] = ['all', 'in-progress', 'finished', 'napkin']

/** Status filter over the project cards. Cards are rendered on the server and passed in by slug. */
export function ProjectList({ projects, cards }: { projects: Project[]; cards: Record<string, React.ReactNode> }) {
  const [filter, setFilter] = useState<Filter>('all')
  const count = (f: Filter) => (f === 'all' ? projects.length : projects.filter((p) => p.status === f).length)
  const shown = filter === 'all' ? projects : projects.filter((p) => p.status === filter)

  return (
    <>
      <div role="group" aria-label="Project status" className="mb-6 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const pressed = f === filter
          return (
            <button
              key={f}
              type="button"
              aria-pressed={pressed}
              onClick={() => setFilter(f)}
              className={`mono min-h-11 cursor-pointer rounded-md border-[1.5px] px-3.5 text-[11px] font-bold ${
                pressed ? 'border-ink bg-ink text-white' : 'border-chip bg-white text-ink hover:border-ink'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_FILTER_LABEL[f]}
              <span
                className={`ml-1.5 rounded-[3px] px-1.5 py-px text-[10px] text-ink ${pressed ? 'bg-butter' : 'bg-mist'}`}
              >
                {count(f)}
              </span>
            </button>
          )
        })}
      </div>
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p) => (
            <motion.div
              key={p.slug}
              id={p.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {cards[p.slug]}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
