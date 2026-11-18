import type { Equipment } from '@/shared/lib/types'

/** A lab equipment card. */
export function EquipmentCard({ item, number }: { item: Equipment; number: number }) {
  return (
    <div className="card flex min-h-[230px] flex-col gap-2 p-[18px]">
      <span className="mono inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-bold tracking-normal text-butter">
        {String(number).padStart(2, '0')}
      </span>
      <span className="hl text-[28px]">{item.name}</span>
      {item.model && <span className="mono text-[10px] text-muted">{item.model}</span>}
      {item.description && <span className="text-sm leading-normal text-body">{item.description}</span>}
      {item.usedIn.length > 0 && (
        <span className="mono mt-auto text-[10px] text-muted">Used in: {item.usedIn.join(', ')}</span>
      )}
    </div>
  )
}
