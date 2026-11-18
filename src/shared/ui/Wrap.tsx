/** Centers a section's content and caps its width. Every section on the site uses it. */
export function Wrap({
  children,
  className = '',
  width = 1240,
}: {
  children: React.ReactNode
  className?: string
  width?: 1060 | 1240
}) {
  const maxWidth = width === 1060 ? 'max-w-[1060px]' : 'max-w-[1240px]'
  return <div className={`mx-auto px-6 ${maxWidth} ${className}`}>{children}</div>
}
