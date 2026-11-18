import { SOFTWARE_GROUPS } from '@/shared/lib/labels'
import type { BenchSpot, Equipment, Software } from '@/shared/lib/types'

import type { Pin } from './bench-drawing'

/**
 * Numbers each piece of equipment that appears in the bench drawing, so its pin
 * shows the same number as its card. Only the first card for a spot gets a pin,
 * and cards with no spot get none.
 */
export function pinsForEquipment(equipment: Equipment[]): Pin[] {
  const pins: Pin[] = []
  equipment.forEach((item, index) => {
    const alreadyPinned = pins.some((pin) => pin.spot === item.spot)
    if (item.spot && !alreadyPinned) pins.push({ spot: item.spot, number: index + 1 })
  })
  return pins
}

/** Highlight the 3D printer when the page opens (it's the most fun), otherwise the first pinned piece. */
export function initialHighlight(pins: Pin[]): BenchSpot | null {
  if (pins.some((pin) => pin.spot === 'printer')) return 'printer'
  return pins[0]?.spot ?? null
}

/** Software sorted into its display groups, leaving out groups with nothing in them. */
export function groupSoftware(software: Software[]) {
  return SOFTWARE_GROUPS.map((group) => ({
    ...group,
    items: software.filter((item) => item.group === group.value),
  })).filter((group) => group.items.length > 0)
}

export type SoftwareGroupWithItems = ReturnType<typeof groupSoftware>[number]
