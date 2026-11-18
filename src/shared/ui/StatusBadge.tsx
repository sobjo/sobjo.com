import { STATUS_LABEL } from '@/shared/lib/labels'
import type { ProjectStatus } from '@/shared/lib/types'

/**
 * Shows where a project stands: yellow for in progress, green for finished,
 * dashed for napkin sketches. `outline` is the quieter finished badge used on
 * the home page cards. `label` overrides the default text.
 */
export function StatusBadge({ status, label, outline }: { status: ProjectStatus; label?: string; outline?: boolean }) {
  const text = label ?? STATUS_LABEL[status]

  if (status === 'in-progress') {
    return <span className="rounded bg-sun px-2 py-[3px] font-bold text-ink">{text}</span>
  }
  if (status === 'finished' && outline) {
    return <span className="rounded border-[1.5px] border-ink px-2 py-[3px] font-bold text-ink">{text}</span>
  }
  if (status === 'finished') {
    return <span className="rounded bg-moss px-2 py-[3px] font-bold text-white">{text}</span>
  }
  return <span className="rounded border-[1.5px] border-dashed border-steel px-2 py-0.5 text-muted">{text}</span>
}
