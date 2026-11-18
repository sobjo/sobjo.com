import { SOFTWARE_GROUPS } from '@/shared/lib/labels'
import type { Software } from '@/shared/lib/types'

/** Software sorted into its display groups, leaving out groups with nothing in them. */
export function groupSoftware(software: Software[]) {
  return SOFTWARE_GROUPS.map((group) => ({
    ...group,
    items: software.filter((item) => item.group === group.value),
  })).filter((group) => group.items.length > 0)
}

export type SoftwareGroupWithItems = ReturnType<typeof groupSoftware>[number]
