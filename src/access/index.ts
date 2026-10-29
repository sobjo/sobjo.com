import type { Access } from 'payload'

export const signedIn: Access = ({ req }) => Boolean(req.user)

export const anyone: Access = () => true

/** Signed-in editors see drafts; everyone else only sees published documents. */
export const publishedOrSignedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
