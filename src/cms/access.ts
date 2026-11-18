import type { Access } from 'payload'

/*
 * Who may read and change each CMS collection. Signed-in editors can do anything;
 * visitors can only read what is published.
 */

export const signedIn: Access = ({ req }) => Boolean(req.user)

export const anyone: Access = () => true

/** Signed-in editors see drafts; everyone else only sees published documents. */
export const publishedOrSignedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
