import type { CollectionConfig } from 'payload'

import { publishedOrSignedIn, signedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { slugField } from '../fields/slug'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Notebook entry', plural: 'Notebook entries' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['entryNumber', 'title', 'author', 'publishedAt', '_status'],
  },
  defaultSort: '-publishedAt',
  versions: { drafts: true },
  access: {
    read: publishedOrSignedIn,
    create: signedIn,
    update: signedIn,
    delete: signedIn,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'summary', type: 'textarea', admin: { description: 'One sentence for the entry card.' } },
    { name: 'content', type: 'richText' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'entryNumber',
      type: 'number',
      admin: { position: 'sidebar', description: 'Shown as "Entry 06".' },
    },
    {
      name: 'author',
      type: 'select',
      required: true,
      defaultValue: 'gunnar',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Gunnar', value: 'gunnar' },
        { label: 'Ivanna', value: 'ivanna' },
      ],
    },
    {
      name: 'category',
      type: 'text',
      admin: { position: 'sidebar', description: 'e.g. Build log, Controls, 3D printing' },
    },
    { name: 'project', type: 'relationship', relationTo: 'projects', admin: { position: 'sidebar' } },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'readMinutes', type: 'number', min: 1, admin: { position: 'sidebar' } },
  ],
}
