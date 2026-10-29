/* The 72 × 56 icons in "What we geek out about" on the About page. */

const FLOOR = <path d="M36 50L66 35L36 20L6 35Z" fill="#EEF2F5" />

const ICONS: Record<string, React.ReactNode> = {
  'Control systems': (
    <>
      <path d="M20 30L30 25L40 30L30 35Z" fill="#7FA2CC" />
      <path d="M20 30L30 35V43L20 38Z" fill="#5E86B8" />
      <path d="M30 35L40 30V38L30 43Z" fill="#4A6FA0" />
      <path d="M38 22L48 17L58 22L48 27Z" fill="#F8D664" />
      <path d="M38 22L48 27V35L38 30Z" fill="#F2BE22" />
      <path d="M48 27L58 22V30L48 35Z" fill="#D9A40F" />
      <path d="M40 30Q44 34 48 30" stroke="#1C2128" strokeWidth="2" fill="none" />
    </>
  ),
  Robotics: (
    <>
      <path d="M24 36L32 32L40 36L32 40Z" fill="#A3ADB9" />
      <path d="M32 36L28 14" stroke="#F2BE22" strokeWidth="7" strokeLinecap="round" />
      <path d="M28 14L48 22" stroke="#F2BE22" strokeWidth="5" strokeLinecap="round" />
      <circle cx="28" cy="14" r="4" fill="#8C97A4" />
      <path d="M48 22V30" stroke="#2A2F36" strokeWidth="3" />
    </>
  ),
  'Embedded systems': (
    <>
      <path d="M36 42L56 32L36 22L16 32Z" fill="#2E7D6B" />
      <path d="M16 32L36 42V45L16 35Z" fill="#246553" />
      <path d="M36 42L56 32V35L36 45Z" fill="#1C5244" />
      <path d="M32 30L40 26L46 29L38 33Z" fill="#2A2F36" />
      <circle cx="26" cy="33" r="2" fill="#F2BE22" />
      <circle cx="48" cy="33" r="2" fill="#C2523C" />
    </>
  ),
  Mechatronics: (
    <>
      <ellipse cx="30" cy="30" rx="12" ry="7" fill="#8C97A4" />
      <ellipse cx="30" cy="27" rx="12" ry="7" fill="#A3ADB9" />
      <ellipse cx="30" cy="27" rx="4" ry="2.4" fill="#2A2F36" />
      <ellipse cx="48" cy="24" rx="8" ry="5" fill="#D9A40F" />
      <ellipse cx="48" cy="22" rx="8" ry="5" fill="#F2BE22" />
    </>
  ),
  '3D printing': (
    <>
      <path d="M22 38V12M50 38V12M22 12H50" stroke="#3A414B" strokeWidth="3" />
      <path d="M32 16L40 16L38 21L34 21Z" fill="#C2523C" />
      <path d="M28 36L36 32L44 36L36 40Z" fill="#F8D664" />
      <path d="M28 36L36 40V43L28 39Z" fill="#F2BE22" />
      <path d="M36 40L44 36V39L36 43Z" fill="#D9A40F" />
    </>
  ),
  'CAD & design': (
    <>
      <path d="M36 12L50 19L36 26L22 19Z" fill="none" stroke="#3B6FB6" strokeWidth="2" />
      <path d="M22 19V33L36 40V26M50 19V33L36 40" fill="none" stroke="#3B6FB6" strokeWidth="2" />
      <path d="M36 26L50 19V33L36 40Z" fill="#3B6FB6" opacity="0.25" />
    </>
  ),
}

export function InterestIcon({ name }: { name: string }) {
  return (
    <svg width="72" height="56" viewBox="0 0 72 56" aria-hidden="true">
      {FLOOR}
      {ICONS[name]}
    </svg>
  )
}
