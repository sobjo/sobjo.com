/** The small uppercase label that sits above a heading, like "04 · Projects". */
export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mono text-xs text-muted ${className}`}>{children}</div>
}
