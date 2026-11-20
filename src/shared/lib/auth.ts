import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

/*
 * Sign-in for the private /update-site editor (Auth.js with Google).
 *
 * Only the Google accounts listed in ALLOWED_EMAILS can sign in. Everyone else
 * is turned away at the Google step, and every save checks the list again.
 *
 * Needs AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET (see .env.example).
 */

/** The emails in ALLOWED_EMAILS, lowercased. Separate them with commas or spaces. */
export function allowedEmails() {
  return (process.env.ALLOWED_EMAILS ?? '')
    .split(/[\s,]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowed(email: string | null | undefined) {
  return Boolean(email) && allowedEmails().includes(email!.toLowerCase())
}

/**
 * The sign-in keys. Each also accepts the older or more common names people use for
 * it (NEXTAUTH_SECRET, GOOGLE_CLIENT_ID…), so whichever was added in Vercel works.
 */
export const AUTH_KEYS = {
  AUTH_SECRET: ['AUTH_SECRET', 'NEXTAUTH_SECRET'],
  AUTH_GOOGLE_ID: ['AUTH_GOOGLE_ID', 'GOOGLE_CLIENT_ID', 'GOOGLE_ID'],
  AUTH_GOOGLE_SECRET: ['AUTH_GOOGLE_SECRET', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_SECRET'],
  ALLOWED_EMAILS: ['ALLOWED_EMAILS'],
  GITHUB_TOKEN: ['GITHUB_TOKEN'],
} as const

export function envValue(key: keyof typeof AUTH_KEYS) {
  for (const name of AUTH_KEYS[key]) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
  return undefined
}

/** Whether the sign-in keys are set, so the page can explain what's missing instead of crashing. */
export const authConfigured = Boolean(
  envValue('AUTH_SECRET') && envValue('AUTH_GOOGLE_ID') && envValue('AUTH_GOOGLE_SECRET'),
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: envValue('AUTH_SECRET'),
  providers: [Google({ clientId: envValue('AUTH_GOOGLE_ID'), clientSecret: envValue('AUTH_GOOGLE_SECRET') })],
  // Vercel sets the host header correctly, so Auth.js can trust it for its callback URLs.
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: '/update-site', error: '/update-site' },
  callbacks: {
    signIn({ profile }) {
      return Boolean(profile?.email_verified) && isAllowed(profile?.email)
    },
  },
})

/** The signed-in editor's email, or null when nobody allowed is signed in. */
export async function currentEditor(): Promise<string | null> {
  if (!authConfigured) return null
  const session = await auth()
  const email = session?.user?.email
  return isAllowed(email) ? email! : null
}
