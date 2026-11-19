/** The small uppercase label that sits above a heading, like "Projects". */
export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mono text-xs text-muted ${className}`}>{children}</div>
}
