import type { Illustration } from '@/lib/types'

/* Small isometric drawings from the mockups, on a 120 × 96 tile. */

function Slab() {
  return (
    <>
      <path d="M60 84L108 60L60 36L12 60Z" fill="#EEF2F5" />
      <path d="M12 60L60 84V89L12 65Z" fill="#B5BFCB" />
      <path d="M60 84L108 60V65L60 89Z" fill="#C9D2DC" />
    </>
  )
}

function Cheetah() {
  return (
    <>
      <path d="M42 62V72M52 67V77M66 60V70M76 55V65" stroke="#3A414B" strokeWidth="4" strokeLinecap="round" />
      <path d="M36 52L66 37L86 47L56 62Z" fill="#F8D664" />
      <path d="M36 52L56 62V68L36 58Z" fill="#F2BE22" />
      <path d="M56 62L86 47V53L56 68Z" fill="#D9A40F" />
      <path d="M78 39L88 34L96 38L86 43Z" fill="#F8D664" />
      <path d="M78 39L86 43V51L78 47Z" fill="#F2BE22" />
      <path d="M86 43L96 38V46L86 51Z" fill="#D9A40F" />
      <circle cx="50" cy="51" r="2.5" fill="#2A2F36" />
      <circle cx="60" cy="47" r="2.5" fill="#2A2F36" />
      <circle cx="68" cy="51" r="2" fill="#2A2F36" />
      <path d="M36 52Q26 50 26 40" stroke="#D9A40F" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  )
}

function Cube() {
  return (
    <>
      <ellipse cx="60" cy="68" rx="24" ry="8" fill="#1C2128" opacity="0.12" />
      <path d="M60 14L84 26L60 38L36 26Z" fill="#7FA2CC" />
      <path d="M36 26L60 38V64L36 52Z" fill="#5E86B8" />
      <path d="M60 38L84 26V52L60 64Z" fill="#4A6FA0" />
      <ellipse cx="48" cy="45" rx="6" ry="8" fill="#F2BE22" />
      <ellipse cx="72" cy="45" rx="6" ry="8" fill="#F2BE22" opacity="0.85" />
      <path d="M60 24L66 27L60 30L54 27Z" fill="#F8D664" />
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

const ART = {
  cheetah: Cheetah,
  cube: Cube,
  idea: Idea,
  plushies: Plushies,
  breadboard: Breadboard,
  books: Books,
  letter: Letter,
}

export type ArtName = Illustration | keyof typeof ART

export function IsoArt({
  name,
  width = 120,
  height = 96,
  className,
  style,
}: {
  name: ArtName
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}) {
  const Drawing = ART[name]
  return (
    <svg width={width} height={height} viewBox="0 0 120 96" aria-hidden="true" className={className} style={style}>
      <Slab />
      <Drawing />
    </svg>
  )
}
