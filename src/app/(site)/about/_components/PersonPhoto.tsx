import Image from 'next/image'

import type { Person } from '@/content/about'

/** The person's photo on their "Meet us" card. */
export function PersonPhoto({ person }: { person: Person }) {
  return (
    <div className="relative flex h-[220px] w-[180px] flex-none items-center justify-center overflow-hidden rounded-md bg-line">
      {person.photo ? (
        <Image
          src={person.photo}
          alt={person.photoAlt}
          fill
          sizes="180px"
          className="object-cover"
          style={{ objectPosition: person.photoPosition }}
        />
      ) : (
        <span className="mono text-[11px] text-muted">[{person.firstName} photo]</span>
      )}
    </div>
  )
}
