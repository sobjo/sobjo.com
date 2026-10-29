'use client'

import type { Equipment } from '@/lib/types'

import { useBench } from './BenchContext'

export function EquipmentCard({ item, number }: { item: Equipment; number: number }) {
  const { active, setActive } = useBench()
  const on = item.spot !== null && item.spot === active
  const activate = () => {
    if (item.spot) setActive(item.spot)
  }

  return (
    <div
      tabIndex={0}
      onMouseEnter={activate}
      onFocus={activate}
      className={`card flex min-h-[230px] cursor-default flex-col gap-2 p-[18px] ${on ? 'border-ivanna! shadow-[0_3px_0_var(--color-ivanna)]!' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`mono inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold tracking-normal ${on ? 'bg-ivanna text-white' : 'bg-ink text-butter'}`}
        >
          {String(number).padStart(2, '0')}
        </span>
        {item.location && <span className="mono text-[10px] text-muted">{item.location}</span>}
      </div>
      <span className="hl text-[28px]">{item.name}</span>
      {item.model && <span className="mono text-[10px] text-muted">{item.model}</span>}
      {item.description && <span className="text-sm leading-normal text-body">{item.description}</span>}
      {item.usedIn.length > 0 && (
        <span className="mono mt-auto text-[10px] text-muted">Used in: {item.usedIn.join(', ')}</span>
      )}
    </div>
  )
}
