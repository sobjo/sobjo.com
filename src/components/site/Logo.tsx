/** The cardboard box mark. `withTape` adds the strip of tape used in the footer. */
export function Logo({ size = 20, withTape = false }: { size?: number; withTape?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="flex-none">
      <path d="M10 2L18 6.5L10 11L2 6.5Z" fill="#7E5428" />
      <path d="M2 6.5L10 11V19L2 14.5Z" fill="#D49A5E" />
      <path d="M18 6.5L10 11V19L18 14.5Z" fill="#B9844A" />
      {withTape && <path d="M8.6 2.8L10 2L16.6 5.7L15.2 6.5Z" fill="#E9CFA6" />}
    </svg>
  )
}
