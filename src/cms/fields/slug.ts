import type { TextField } from 'payload'

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** A URL slug that fills itself in from another field when left empty. */
export function slugField(from: string): TextField {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: { position: 'sidebar', description: 'Used in the URL. Filled in from the title if left empty.' },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === 'string' && value.trim()) return slugify(value)
          const source = data?.[from]
          return typeof source === 'string' ? slugify(source) : value
        },
      ],
    },
  }
}
