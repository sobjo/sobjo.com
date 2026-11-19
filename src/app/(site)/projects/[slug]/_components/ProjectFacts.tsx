/** The small "Tools" card beside a project's write-up. Hidden when there are no tools listed. */
export function ProjectFacts({ tools }: { tools: string | null }) {
  if (!tools) return null

  return (
    <aside className="flex-[1_1_240px]">
      <dl className="card m-0 flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <dt className="mono text-[10px] text-muted">Tools</dt>
          <dd className="m-0 text-sm">{tools}</dd>
        </div>
      </dl>
    </aside>
  )
}
