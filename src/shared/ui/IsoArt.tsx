import { drawProjectIcon } from '@/app/(site)/(home)/_lib/workshop/items'
import type { Illustration } from '@/shared/lib/types'

/*
 * Small isometric drawings from the mockups, each on a 120 × 96 tile, with an
 * optional floor slab underneath (project pictures leave it off). Projects pick one as their `illustration`; the 404 and
 * Say hi pages use `idea` and `letter`. The Cubli (`cube`), MiniQ, Cheetah and KVM board
 * are the same drawings as on the home page desk, built by `drawProjectIcon`.
 */

/** The home page's Cubli and Cheetah drawings, built once each. */
const PROJECT_ICONS = {
  cube: drawProjectIcon('cube'),
  miniq: drawProjectIcon('miniq'),
  cheetah: drawProjectIcon('cheetah'),
  kvm: drawProjectIcon('kvm'),
}

function Slab() {
  return (
    <>
      <path d="M60 84L108 60L60 36L12 60Z" fill="#EEF2F5" />
      <path d="M12 60L60 84V89L12 65Z" fill="#B5BFCB" />
      <path d="M60 84L108 60V65L60 89Z" fill="#C9D2DC" />
    </>
  )
}

function Idea() {
  return (
    <>
      <path
        d="M60 14L84 26L60 38L36 26Z M36 26V52L60 64V38 M84 26V52L60 64"
        fill="none"
        stroke="#8C97A4"
        strokeWidth="2"
        strokeDasharray="5 4"
      />
      <path d="M60 34V48M53 41H67" stroke="#5B6573" strokeWidth="3" strokeLinecap="round" />
    </>
  )
}

function Plushies() {
  return (
    <>
      <ellipse cx="60" cy="68" rx="26" ry="8" fill="#1C2128" opacity="0.12" />
      <circle cx="48" cy="56" r="13" fill="#C2523C" />
      <circle cx="48" cy="38" r="11" fill="#C2523C" />
      <circle cx="72" cy="58" r="13" fill="#3B6FB6" />
      <circle cx="72" cy="40" r="11" fill="#3B6FB6" />
      <circle cx="45" cy="37" r="1.8" fill="#1C2128" />
      <circle cx="51" cy="37" r="1.8" fill="#1C2128" />
      <circle cx="69" cy="39" r="1.8" fill="#1C2128" />
      <circle cx="75" cy="39" r="1.8" fill="#1C2128" />
      <path d="M60 26l-6 -5c-4 -4 2 -9 6 -4c4 -5 10 0 6 4z" fill="#C2523C" />
    </>
  )
}

function Breadboard() {
  return (
    <>
      <path d="M60 72L96 54L60 36L24 54Z" fill="#F7F9FB" />
      <path d="M24 54L60 72V76L24 58Z" fill="#DCE3EA" />
      <path d="M60 72L96 54V58L60 76Z" fill="#C3CCD6" />
      <g fill="#C3CCD6">
        <circle cx="44" cy="52" r="1.5" />
        <circle cx="50" cy="55" r="1.5" />
        <circle cx="56" cy="58" r="1.5" />
        <circle cx="62" cy="61" r="1.5" />
        <circle cx="56" cy="46" r="1.5" />
        <circle cx="62" cy="49" r="1.5" />
        <circle cx="68" cy="52" r="1.5" />
        <circle cx="74" cy="55" r="1.5" />
      </g>
      <path d="M46 50Q54 38 66 46" stroke="#C2523C" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M58 62Q70 52 80 58" stroke="#3B6FB6" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M64 46L72 42L78 45L70 49Z" fill="#2A2F36" />
    </>
  )
}

function Books() {
  return (
    <>
      <path d="M60 72L90 57L60 42L30 57Z" fill="#5E86B8" />
      <path d="M30 57L60 72V77L30 62Z" fill="#3B6FB6" />
      <path d="M60 72L90 57V62L60 77Z" fill="#2F5C99" />
      <path d="M60 64L88 50L60 36L32 50Z" fill="#4E9A85" />
      <path d="M32 50L60 64V69L32 55Z" fill="#2E7D6B" />
      <path d="M60 64L88 50V55L60 69Z" fill="#246553" />
      <path d="M60 56L90 41L60 26L30 41Z" fill="#D4705B" />
      <path d="M30 41L60 56V61L30 46Z" fill="#C2523C" />
      <path d="M60 56L90 41V46L60 61Z" fill="#A8412D" />
      <path d="M66 30L74 26L76 27L68 31Z" fill="#F2BE22" />
    </>
  )
}

function Letter() {
  return (
    <>
      <path d="M60 70L90 55L60 40L30 55Z" fill="#F7F9FB" />
      <path d="M30 55L60 70V73L30 58Z" fill="#DCE3EA" />
      <path d="M60 70L90 55V58L60 73Z" fill="#C3CCD6" />
      <path d="M30 55L60 52L90 55" stroke="#8C97A4" strokeWidth="2" fill="none" />
      <circle cx="60" cy="54" r="5" fill="#C2523C" />
      <path d="M74 30l-6 -5c-4 -4 2 -9 6 -4c4 -5 10 0 6 4z" fill="#C2523C" opacity="0.8" />
    </>
  )
}

/** Napkin corners on the 120 × 96 tile, and the matrix that maps a unit square (u, v) onto it. */
const NAPKIN = 'M16 46L60 24L104 46L60 68Z'
const ON_NAPKIN = 'matrix(44 -22 44 22 16 46)'

/** A paper napkin lying flat with a ballpoint sketch on it and a pen beside it. */
function Napkin({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ellipse cx="60" cy="50" rx="46" ry="21" fill="#1C2128" opacity="0.08" />
      <path d={NAPKIN} fill="#FFFFFF" stroke="#E6E1D8" strokeWidth="1" />
      <path d="M38 35L82 57" stroke="#E6E1D8" strokeWidth="1" />
      <g
        transform={ON_NAPKIN}
        fill="none"
        stroke="#3B6FB6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        {children}
        {/* coffee ring */}
        <circle cx="0.8" cy="0.78" r="0.11" stroke="#C9A27A" opacity="0.6" vectorEffect="non-scaling-stroke" />
      </g>
      {/* the pen */}
      <path d="M86 30L108 48" stroke="#2A2F36" strokeWidth="4" strokeLinecap="round" />
      <path d="M105 45.5L108 48" stroke="#3B6FB6" strokeWidth="4" strokeLinecap="round" />
    </>
  )
}

/** Lab ASRS: a rack of bins with a gantry rail above it and a carriage dropping into a bin. */
function NapkinRack() {
  const cells = [0.3, 0.45, 0.6, 0.75]
  return (
    <Napkin>
      <path d="M0.3 0.3H0.75V0.75H0.3Z" vectorEffect="non-scaling-stroke" />
      {cells.slice(1, 3).map((c) => (
        <path key={c} d={`M${c} 0.3V0.75M0.3 ${c}H0.75`} vectorEffect="non-scaling-stroke" />
      ))}
      <path d="M0.22 0.16H0.83" vectorEffect="non-scaling-stroke" />
      <path d="M0.42 0.11H0.52V0.21H0.42Z" vectorEffect="non-scaling-stroke" />
      <path d="M0.47 0.23V0.4M0.43 0.36L0.47 0.4L0.51 0.36" vectorEffect="non-scaling-stroke" />
    </Napkin>
  )
}

/** Home Agent: a house with a chat bubble beside it. */
function NapkinHouse() {
  return (
    <Napkin>
      <path d="M0.2 0.8V0.47L0.4 0.27L0.6 0.47V0.8Z" vectorEffect="non-scaling-stroke" />
      <path d="M0.34 0.8V0.62H0.46V0.8" vectorEffect="non-scaling-stroke" />
      <circle cx="0.76" cy="0.36" r="0.11" vectorEffect="non-scaling-stroke" />
      <path d="M0.69 0.44L0.64 0.52" vectorEffect="non-scaling-stroke" />
      <g fill="#3B6FB6" stroke="none">
        <circle cx="0.72" cy="0.36" r="0.012" />
        <circle cx="0.76" cy="0.36" r="0.012" />
        <circle cx="0.8" cy="0.36" r="0.012" />
      </g>
    </Napkin>
  )
}

/** Any other idea: a gear with a question mark. */
function NapkinGear() {
  const teeth = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2
    const r = i % 2 ? 0.24 : 0.19
    return `${(0.45 + Math.cos(a) * r).toFixed(3)} ${(0.48 + Math.sin(a) * r).toFixed(3)}`
  })
  return (
    <Napkin>
      <path d={`M${teeth.join('L')}Z`} vectorEffect="non-scaling-stroke" />
      <circle cx="0.45" cy="0.48" r="0.07" vectorEffect="non-scaling-stroke" />
    </Napkin>
  )
}

/** Every drawing, by name. */
const ART = {
  idea: Idea,
  'napkin-rack': NapkinRack,
  'napkin-house': NapkinHouse,
  'napkin-gear': NapkinGear,
  plushies: Plushies,
  breadboard: Breadboard,
  books: Books,
  letter: Letter,
}

type ArtName = Illustration | keyof typeof ART

function hasProjectIcon(name: ArtName): name is keyof typeof PROJECT_ICONS {
  return name in PROJECT_ICONS
}

/** Draws the named isometric picture, on its floor slab unless `floor` is false. */
export function IsoArt({
  name,
  floor = true,
  width = 120,
  height = 96,
  className,
  style,
}: {
  name: ArtName
  floor?: boolean
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}) {
  if (hasProjectIcon(name)) {
    const icon = PROJECT_ICONS[name]
    return (
      <svg
        width={width}
        height={height}
        viewBox={icon.viewBox}
        aria-hidden="true"
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: icon.markup }}
      />
    )
  }
  const Drawing = ART[name]
  return (
    <svg width={width} height={height} viewBox="0 0 120 96" aria-hidden="true" className={className} style={style}>
      {floor && <Slab />}
      <Drawing />
    </svg>
  )
}
