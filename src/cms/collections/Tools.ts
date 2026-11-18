import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Tools: CollectionConfig = {
  slug: 'tools',
  labels: { singular: 'Bench item', plural: 'Bench items' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'order'],
    description: 'Everything on the Bench page: lab equipment, hardware parts and software.',
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
    { name: 'name', type: 'text', required: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'hardware',
      options: [
        { label: 'Lab equipment', value: 'equipment' },
        { label: 'Hardware part', value: 'hardware' },
        { label: 'Software', value: 'software' },
      ],
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'model',
      type: 'text',
      admin: { condition: (_, s) => s?.kind === 'equipment' },
    },
    {
      name: 'benchSpot',
      type: 'select',
      admin: {
        condition: (_, s) => s?.kind === 'equipment',
        description: 'Which piece of the bench drawing lights up when someone hovers this card.',
      },
      options: [
        { label: 'Power supply (left end)', value: 'psu' },
        { label: 'Soldering station (front left)', value: 'solder' },
        { label: '3D printer (middle)', value: 'printer' },
        { label: 'Oscilloscope (right of center)', value: 'scope' },
        { label: 'Computer (right end)', value: 'monitor' },
      ],
    },
    {
      name: 'location',
      type: 'text',
      admin: { condition: (_, s) => s?.kind === 'equipment', description: 'e.g. "Left end"' },
    },
    {
      name: 'partGroup',
      type: 'select',
      admin: { condition: (_, s) => s?.kind === 'hardware' },
      options: [
        { label: 'Microcontrollers', value: 'microcontrollers' },
        { label: 'Sensors', value: 'sensors' },
        { label: 'Motors & drivers', value: 'motors' },
        { label: 'Materials', value: 'materials' },
      ],
    },
    {
      type: 'row',
      admin: { condition: (_, s) => s?.kind === 'software' },
      fields: [
        {
          name: 'softwareGroup',
          type: 'select',
          options: [
            { label: 'Languages', value: 'languages' },
            { label: 'CAD & design', value: 'cad' },
            { label: 'OS & tools', value: 'os' },
            { label: 'AI & productivity', value: 'ai' },
          ],
        },
        { name: 'tag', type: 'text', maxLength: 5, admin: { description: 'Short badge, e.g. F360' } },
      ],
    },
    { name: 'usedIn', type: 'relationship', relationTo: 'projects', hasMany: true },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar', description: 'Lower comes first.' } },
  ],
}
