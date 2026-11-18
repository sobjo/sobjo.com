import type { Person } from '@/content/about'
import { BuilderPill } from '@/shared/ui/BuilderPill'

import { PhotoSwap } from './PhotoSwap'

/** One of the two "Meet us" cards: photo, name, background and links. The top border is the person's color. */
export function PersonCard({ person }: { person: Person }) {
  const accentBorder = person.id === 'gunnar' ? 'border-t-gunnar!' : 'border-t-ivanna!'

  return (
    <article className={`card flex flex-wrap gap-6 border-t-[6px]! p-6 ${accentBorder}`}>
      <PhotoSwap person={person} />
      <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-3">
        <span className="mono self-start text-[11px]">
          <BuilderPill builder={person.id} />
        </span>
        <h3 className="hl m-0 text-[40px]">
          {person.firstName} {person.lastName}
        </h3>
        <dl className="m-0 grid grid-cols-[100px_1fr] gap-x-3 gap-y-2 text-sm leading-normal">
          {person.education && (
            <>
              <dt className="mono pt-[3px] text-[10px] text-muted">Education</dt>
              <dd className="m-0">{person.education}</dd>
            </>
          )}
          <dt className="mono pt-[3px] text-[10px] text-muted">Work</dt>
          <dd className="m-0">{person.work}</dd>
          <dt className="mono pt-[3px] text-[10px] text-muted">On our builds</dt>
          <dd className="m-0 text-body">{person.onOurBuilds}</dd>
        </dl>
        <div className="flex flex-wrap gap-5">
          <a href={person.linkedin} className="ulink py-2">
            LinkedIn
          </a>
          <a href={person.github} className="ulink py-2">
            GitHub
          </a>
        </div>
      </div>
    </article>
  )
}
