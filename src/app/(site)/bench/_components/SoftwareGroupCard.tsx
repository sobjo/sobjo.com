import type { SoftwareGroupWithItems } from '../_lib/bench-page-data'

/** One card in the Software section, like "Languages", listing each tool with its short tag. */
export function SoftwareGroupCard({ group }: { group: SoftwareGroupWithItems }) {
  return (
    <div className="card flex flex-col gap-3.5 p-5">
      <div className="flex items-center gap-2.5">
        <span className="h-3 w-3 rounded-[3px]" style={{ background: group.color }} />
        <span className="hl text-[26px]">{group.label}</span>
      </div>
      {group.items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 border-t-[1.5px] border-mist pt-3">
          <span className="mono min-w-10 flex-none rounded bg-ink p-1.5 text-center text-[10px] font-bold text-butter">
            {item.tag || '·'}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-bold">{item.name}</span>
            {item.description && <span className="text-[13px] text-muted">{item.description}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
