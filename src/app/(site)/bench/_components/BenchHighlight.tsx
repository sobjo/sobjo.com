'use client'

import { createContext, useContext, useState } from 'react'

import type { BenchSpot } from '@/shared/lib/types'

interface BenchHighlight {
  /** The piece of equipment lit up in the drawing. */
  active: BenchSpot | null
  setActive: (spot: BenchSpot) => void
}

const BenchHighlightContext = createContext<BenchHighlight>({ active: null, setActive: () => {} })

/**
 * Shares which piece of equipment is highlighted between the bench drawing and the
 * equipment cards: hovering a card lights up its spot in the drawing.
 */
export function BenchHighlightProvider({
  initial,
  children,
}: {
  initial: BenchSpot | null
  children: React.ReactNode
}) {
  const [active, setActive] = useState<BenchSpot | null>(initial)
  return <BenchHighlightContext.Provider value={{ active, setActive }}>{children}</BenchHighlightContext.Provider>
}

export const useBenchHighlight = () => useContext(BenchHighlightContext)
