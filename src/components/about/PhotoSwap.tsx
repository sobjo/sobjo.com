import Image from 'next/image'

import type { Person } from '@/content/site'

/** A photo that cross-fades to the person's cartoon on hover or keyboard focus. */
export function PhotoSwap({ person }: { person: Person }) {
  const isGunnar = person.id === 'gunnar'
  return (
    <div
      tabIndex={0}
      aria-label={`Photo of ${person.firstName}; hover to see ${person.possessive} cartoon`}
      className="group relative h-[220px] w-[180px] flex-none overflow-hidden rounded-md bg-line"
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-[400ms] group-hover:opacity-0 group-focus-visible:opacity-0">
        {person.photo ? (
          <Image src={person.photo} alt="" fill sizes="180px" className="object-cover" />
        ) : (
          <span className="mono text-[11px] text-muted">[{person.firstName} photo]</span>
        )}
      </div>
      <div
        className={`absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100 group-focus-visible:opacity-100 ${isGunnar ? 'bg-gunnar-tint' : 'bg-ivanna-tint'}`}
      >
        {person.cartoon ? (
          <Image src={person.cartoon} alt="" fill sizes="180px" className="object-cover" />
        ) : (
          <span className={`mono text-[11px] ${isGunnar ? 'text-gunnar' : 'text-ivanna'}`}>
            [{person.firstName} cartoon]
          </span>
        )}
      </div>
    </div>
  )
}
