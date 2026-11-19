'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { STATUS_FILTER_LABEL } from '@/shared/lib/labels'
import type { Project, ProjectStatus } from '@/shared/lib/types'
import { FilterButton } from '@/shared/ui/FilterButton'

type Filter = 'all' | ProjectStatus
const FILTERS: Filter[] = ['all', 'in-progress', 'finished', 'napkin']

/**
 * The status filter buttons and the filtered list of project cards, which animate in and out.
 * The cards are rendered on the server and passed in by slug.
 */
export function ProjectList({ projects, cards }: { projects: Project[]; cards: Record<string, React.ReactNode> }) {
  const [filter, setFilter] = useState<Filter>('all')
  const matches = (project: Project, f: Filter) => f === 'all' || project.status === f
  const shown = projects.filter((project) => matches(project, filter))

  return (
    <>
      <div role="group" aria-label="Project status" className="mb-6 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const pressed = f === filter
          return (
            <FilterButton key={f} size="large" pressed={pressed} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : STATUS_FILTER_LABEL[f]}
            </FilterButton>
          )
        })}
      </div>
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((project) => (
            <motion.div
              key={project.slug}
              id={project.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {cards[project.slug]}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
