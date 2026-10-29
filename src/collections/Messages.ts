import type { CollectionConfig } from 'payload'

import { signedIn } from '../access'

/**
 * Messages from the Say hi form. The form handler writes these on the server
 * (after checking Turnstile), so nobody can create them through the public API.
 */
export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'createdAt'],
  },
  defaultSort: '-createdAt',
  access: {
    read: signedIn,
    create: signedIn,
    update: signedIn,
    delete: signedIn,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'message', type: 'textarea', required: true },
  ],
}
