import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { slugField } from '../fields/slug'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'year', 'featured'],
  },
  defaultSort: 'order',
  access: {
    read: anyone,
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
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'napkin',
          options: [
            { label: 'On the bench', value: 'in-progress' },
            { label: 'Finished', value: 'finished' },
            { label: 'Napkin sketch', value: 'napkin' },
          ],
        },
        { name: 'year', type: 'text', admin: { description: 'e.g. "Started 2025", "2024" or "Someday"' } },
      ],
    },
    {
      name: 'builders',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Gunnar', value: 'gunnar' },
        { label: 'Ivanna', value: 'ivanna' },
      ],
    },
    { name: 'summary', type: 'textarea', admin: { description: 'One or two sentences for the project card.' } },
    {
      type: 'row',
      fields: [
        { name: 'role', type: 'text', admin: { description: 'Who did what' } },
        { name: 'tools', type: 'text', admin: { description: 'Parts and software' } },
      ],
    },
    {
      name: 'progress',
      type: 'group',
      admin: {
        description: 'Build steps done, shown as the progress bar on the home page.',
        condition: (_, siblingData) => siblingData?.status === 'in-progress',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'done', type: 'number', min: 0, defaultValue: 0 },
            { name: 'total', type: 'number', min: 1, defaultValue: 8 },
          ],
        },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'body',
      type: 'richText',
      admin: { description: 'The full write-up: build log, what broke, what you learned.' },
    },
    {
      name: 'illustration',
      type: 'select',
      defaultValue: 'idea',
      admin: { position: 'sidebar', description: 'Isometric drawing used when there is no photo.' },
      options: [
        { label: 'Cheetah', value: 'cheetah' },
        { label: 'Cube', value: 'cube' },
        { label: 'Napkin idea', value: 'idea' },
      ],
    },
    {
      name: 'tint',
      type: 'select',
      defaultValue: 'paper',
      admin: { position: 'sidebar', description: 'Background behind the drawing or photo.' },
      options: [
        { label: 'Sand', value: 'sand' },
        { label: 'Steel', value: 'steel' },
        { label: 'Blush', value: 'blush' },
        { label: 'Paper', value: 'paper' },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Show under "On the bench this month" on the home page.' },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      admin: { position: 'sidebar', description: 'Link text, e.g. "Follow the build". Leave empty for the default.' },
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar', description: 'Lower comes first.' } },
  ],
}
