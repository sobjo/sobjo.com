import Image from 'next/image'

import { about } from '@/content/about'

/**
 * How each photo frame sits: its pin color, its place in the grid, its shape and tilt, and the
 * color behind the photo while it loads. They pair up, in order, with `about.photos`.
 * The escape room photo is the big full-body one on the left; the other two stack beside it.
 */
const FRAMES = [
  { pin: 'bg-ivanna', cell: 'col-start-2 row-start-1 rotate-[2.5deg]', aspect: 'aspect-[4/3]', tint: 'bg-line' },
  { pin: 'bg-gunnar', cell: 'col-start-1 row-span-2 row-start-1 -rotate-2', aspect: 'aspect-[3/4]', tint: 'bg-blush' },
  { pin: 'bg-sun', cell: 'col-start-2 row-start-2 -rotate-[1.5deg]', aspect: 'aspect-[4/3]', tint: 'bg-sand' },
]

/** Three pinned photos beside the About intro: one big full-body shot and two smaller ones. */
export function PinnedPhotos() {
  return (
    <div
      role="group"
      aria-label="Photos of us"
      className="mx-auto grid w-full max-w-[560px] min-w-0 grid-cols-[1.2fr_1fr] items-center gap-x-3 gap-y-4 py-2 sm:gap-x-6 sm:gap-y-5 lg:max-w-none lg:py-4"
    >
      {FRAMES.map((frame, i) => {
        const photo = about.photos[i]
        return (
          <figure
            key={i}
            className={`m-0 rounded border-[1.5px] border-line bg-white p-2.5 pb-3 shadow-[0_10px_22px_rgba(28,33,40,0.14)] ${frame.cell}`}
          >
            <span className={`mx-auto mb-2.5 block h-2.5 w-2.5 rounded-full ${frame.pin}`} />
            <div className={`relative flex items-center justify-center overflow-hidden ${frame.aspect} ${frame.tint}`}>
              {photo.src ? (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 55vw, 340px"
                  className="object-cover"
                  style={{ objectPosition: photo.position }}
                />
              ) : (
                <span className="mono text-center text-[11px] text-muted">{photo.placeholder}</span>
              )}
            </div>
            {photo.caption && <figcaption className="mono mt-2.5 text-[10px] text-muted">{photo.caption}</figcaption>}
          </figure>
        )
      })}
    </div>
  )
}
