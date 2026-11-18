import { BUILDER_NAME } from '@/shared/lib/labels'
import type { Builder } from '@/shared/lib/types'

/** A rounded name tag in the builder's color: blue for Gunnar, red for Ivanna. */
export function BuilderPill({ builder }: { builder: Builder }) {
  const color = builder === 'gunnar' ? 'bg-gunnar' : 'bg-ivanna'
  return <span className={`pill ${color}`}>{BUILDER_NAME[builder]}</span>
}
