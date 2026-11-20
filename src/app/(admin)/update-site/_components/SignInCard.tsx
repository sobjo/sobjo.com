import { signInWithGoogle } from '../_lib/actions'

/** The only thing a signed-out visitor sees at /update-site. */
export function SignInCard({ error }: { error?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card flex w-full max-w-[420px] flex-col gap-4 p-8 hover:border-line hover:shadow-[0_3px_0_var(--color-line)]">
        <span className="mono text-[11px] text-muted">SOBJO</span>
        <h1 className="hl m-0 text-[56px]">Update the site</h1>
        <p className="m-0 text-[15px] leading-[1.55] text-body">
          Edit projects and write notebook entries. Only Gunnar and Ivanna can sign in.
        </p>
        {error && (
          <p role="alert" className="m-0 rounded-md bg-ivanna-tint px-3 py-2 text-sm text-ivanna">
            {error === 'AccessDenied'
              ? "That Google account isn't on the list. Try the other one?"
              : 'Signing in didn’t work. Try again.'}
          </p>
        )}
        <form action={signInWithGoogle}>
          <button type="submit" className="btn w-full cursor-pointer justify-center border-0">
            Sign in with Google
          </button>
        </form>
      </div>
    </main>
  )
}
