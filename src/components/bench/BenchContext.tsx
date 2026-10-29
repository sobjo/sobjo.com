'use client'

import { createContext, useContext, useState } from 'react'

import type { BenchSpot } from '@/lib/types'

interface BenchState {
  active: BenchSpot | null
  setActive: (spot: BenchSpot) => void
}

const BenchContext = createContext<BenchState>({ active: null, setActive: () => {} })

/** Shares the highlighted piece of equipment between the drawing and the cards. */
export function BenchProvider({ initial, children }: { initial: BenchSpot | null; children: React.ReactNode }) {
  const [active, setActive] = useState<BenchSpot | null>(initial)
  return <BenchContext.Provider value={{ active, setActive }}>{children}</BenchContext.Provider>
}

export const useBench = () => useContext(BenchContext)
