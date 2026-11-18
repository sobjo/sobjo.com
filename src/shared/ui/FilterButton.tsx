/**
 * A toggle button for filter rows (project status, part groups).
 * `size="large"` is the slightly taller version used on the Projects page.
 */
export function FilterButton({
  pressed,
  onClick,
  size = 'normal',
  children,
}: {
  pressed: boolean
  onClick: () => void
  size?: 'normal' | 'large'
  children: React.ReactNode
}) {
  const sizing = size === 'large' ? 'min-h-11 px-3.5' : 'min-h-10 px-3'
  const colors = pressed ? 'border-ink bg-ink text-white' : 'border-chip bg-white text-ink hover:border-ink'
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`mono ${sizing} cursor-pointer rounded-md border-[1.5px] text-[11px] font-bold ${colors}`}
    >
      {children}
    </button>
  )
}
