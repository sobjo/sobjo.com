/** A small isometric chip in the part's group colors (top, left, right faces), centered on its base tile. */
export function PartIcon({ colors }: { colors: [string, string, string] }) {
  return (
    <svg width="64" height="32" viewBox="0 22 64 32" aria-hidden="true" className="flex-none">
      <path d="M32 52L60 38L32 24L4 38Z" fill="#EEF2F5" />
      <path d="M32 44L50 35L32 26L14 35Z" fill={colors[0]} />
      <path d="M14 35L32 44V50L14 41Z" fill={colors[1]} />
      <path d="M32 44L50 35V41L32 50Z" fill={colors[2]} />
    </svg>
  )
}
