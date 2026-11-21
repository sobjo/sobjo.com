import type { Equipment } from '@/shared/lib/types'

/** A lab equipment card: just the name and the model. */
export function EquipmentCard({ item }: { item: Equipment }) {
  return (
    <div className="card flex flex-col gap-2 p-[18px]">
      <span className="hl text-[28px]">{item.name}</span>
      {item.model && <span className="mono text-[11px] text-muted">{item.model}</span>}
    </div>
  )
}
