import { BUILDER_NAME, STATUS_LABEL } from '@/lib/labels'
import type { Builder, ProjectStatus } from '@/lib/types'

export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mono text-xs text-muted ${className}`}>{children}</div>
}

/** Page width container used by every section. */
export function Wrap({
  children,
  className = '',
  width = 1240,
}: {
  children: React.ReactNode
  className?: string
  width?: 1060 | 1240
}) {
  return (
    <div className={`mx-auto px-6 ${width === 1060 ? 'max-w-[1060px]' : 'max-w-[1240px]'} ${className}`}>{children}</div>
  )
}

export function BuilderPill({ builder }: { builder: Builder }) {
  return <span className={`pill ${builder === 'gunnar' ? 'bg-gunnar' : 'bg-ivanna'}`}>{BUILDER_NAME[builder]}</span>
}

/** `outline` is the quieter finished badge used on the home page cards. */
export function StatusBadge({ status, label, outline }: { status: ProjectStatus; label?: string; outline?: boolean }) {
  const text = label ?? STATUS_LABEL[status]
  if (status === 'in-progress') return <span className="rounded bg-sun px-2 py-[3px] font-bold text-ink">{text}</span>
  if (status === 'finished' && outline)
    return <span className="rounded border-[1.5px] border-ink px-2 py-[3px] font-bold text-ink">{text}</span>
  if (status === 'finished') return <span className="rounded bg-moss px-2 py-[3px] font-bold text-white">{text}</span>
  return <span className="rounded border-[1.5px] border-dashed border-steel px-2 py-0.5 text-muted">{text}</span>
}

export function ProgressBar({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex gap-[3px]" role="img" aria-label={`Progress: ${done} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-2 flex-1 rounded-sm ${i < done ? 'bg-ink' : 'bg-line'}`} />
      ))}
    </div>
  )
}
