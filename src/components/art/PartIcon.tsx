/** A small isometric chip in the part's group colors (top, left, right faces). */
export function PartIcon({ colors }: { colors: [string, string, string] }) {
  return (
    <svg width="64" height="56" viewBox="0 0 64 56" aria-hidden="true" className="flex-none">
      <path d="M32 52L60 38L32 24L4 38Z" fill="#EEF2F5" />
      <path d="M32 40L50 31L32 22L14 31Z" fill={colors[0]} />
      <path d="M14 31L32 40V46L14 37Z" fill={colors[1]} />
      <path d="M32 40L50 31V37L32 46Z" fill={colors[2]} />
    </svg>
  )
}
