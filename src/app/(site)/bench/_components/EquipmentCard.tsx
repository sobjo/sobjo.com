import type { Equipment } from '@/shared/lib/types'

/** A lab equipment card. */
export function EquipmentCard({ item }: { item: Equipment }) {
  return (
    <div className="card flex min-h-[230px] flex-col gap-2 p-[18px]">
      <span className="hl text-[28px]">{item.name}</span>
      {item.model && <span className="mono text-[10px] text-muted">{item.model}</span>}
      {item.description && <span className="text-sm leading-normal text-body">{item.description}</span>}
      {item.usedIn.length > 0 && (
        <span className="mono mt-auto text-[10px] text-muted">Used in: {item.usedIn.join(', ')}</span>
      )}
    </div>
  )
}
