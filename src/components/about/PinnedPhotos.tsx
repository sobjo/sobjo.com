import Image from 'next/image'

import { about } from '@/content/site'

const FRAMES = [
  {
    pin: 'bg-ivanna',
    box: 'left-[2%] top-[46px] w-[54%] -rotate-3 p-3 pb-3.5',
    tint: 'bg-line',
    height: 'h-[220px]',
  },
  { pin: 'bg-gunnar', box: 'right-0 top-[30px] w-[40%] rotate-[4deg] p-2.5 pb-3', tint: 'bg-blush', height: 'h-[150px]' },
  {
    pin: 'bg-sun',
    box: 'right-[10%] top-[250px] w-[46%] -rotate-[1.5deg] p-2.5 pb-3',
    tint: 'bg-sand',
    height: 'h-[150px]',
  },
]

/** Three photos hanging off a wire, from the About hero. */
export function PinnedPhotos() {
  return (
    <div role="group" aria-label="Photos of us" className="relative h-[470px] min-w-0 flex-[1_1_420px]">
      <svg viewBox="0 0 520 470" aria-hidden="true" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 18H520" stroke="#3A414B" strokeWidth="3" />
        <path d="M150 18L150 46M390 18L390 30M285 18L285 250" stroke="#3A414B" strokeWidth="1.5" />
      </svg>
      {FRAMES.map((frame, i) => {
        const photo = about.photos[i]
        return (
          <figure
            key={i}
            className={`absolute m-0 rounded border-[1.5px] border-line bg-white shadow-[0_10px_22px_rgba(28,33,40,0.14)] ${frame.box}`}
          >
            <span className={`mx-auto mb-2.5 block h-2.5 w-2.5 rounded-full ${frame.pin}`} />
            <div className={`relative flex items-center justify-center overflow-hidden ${frame.height} ${frame.tint}`}>
              {photo.src ? (
                <Image src={photo.src} alt={photo.alt} fill sizes="300px" className="object-cover" />
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
