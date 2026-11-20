'use server'

import { signIn, signOut } from '@/shared/lib/auth'

export async function signInWithGoogle() {
  await signIn('google', { redirectTo: '/update-site' })
}

export async function signOutOfEditor() {
  await signOut({ redirectTo: '/update-site' })
}
