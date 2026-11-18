/** The small "Role" and "Tools" card beside a project's write-up. Hidden when both are empty. */
export function ProjectFacts({ role, tools }: { role: string | null; tools: string | null }) {
  if (!role && !tools) return null

  return (
    <aside className="flex-[1_1_240px]">
      <dl className="card m-0 flex flex-col gap-4 p-5">
        {role && <Fact label="Role" value={role} />}
        {tools && <Fact label="Tools" value={tools} />}
      </dl>
    </aside>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="mono text-[10px] text-muted">{label}</dt>
      <dd className="m-0 text-sm">{value}</dd>
    </div>
  )
}
