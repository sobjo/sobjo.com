import { AUTH_KEYS, envValue } from '@/shared/lib/auth'

/** Shown instead of the editor until the sign-in keys are added (in Vercel, or in .env when running locally). */
export function SetupNotice() {
  const missing = (Object.keys(AUTH_KEYS) as (keyof typeof AUTH_KEYS)[]).filter((key) => !envValue(key))
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card flex w-full max-w-[520px] flex-col gap-4 p-8 hover:border-line hover:shadow-[0_3px_0_var(--color-line)]">
        <span className="mono text-[11px] text-muted">SOBJO</span>
        <h1 className="hl m-0 text-[48px]">Almost ready</h1>
        <p className="m-0 text-[15px] leading-[1.55] text-body">
          The editor turns on once these settings are added to the project in Vercel. The README explains where each one
          comes from.
        </p>
        <p className="m-0 text-[13px] leading-[1.5] text-muted">
          Already added them? In Vercel, check they’re ticked for Production, then redeploy: a deploy only sees settings
          that existed when it started.
        </p>
        <ul className="mono m-0 flex list-none flex-col gap-1.5 p-0 text-[12px]">
          {missing.map((key) => (
            <li key={key} className="rounded bg-mist px-2.5 py-1.5">
              {AUTH_KEYS[key].join(' or ')}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
