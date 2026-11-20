'use client'

import type { NotebookEntry } from '@/shared/lib/content-files'
import { BUILDER_NAME } from '@/shared/lib/labels'
import type { Builder } from '@/shared/lib/types'

import { Choice, MarkdownField, PhotoField, TextArea, TextInput } from './fields'
import { Group } from './ProjectForm'

export function EntryForm({
  entry,
  onChange,
  onTitleChange,
  isNew,
}: {
  entry: NotebookEntry
  onChange: (patch: Partial<NotebookEntry>) => void
  onTitleChange: (title: string) => void
  isNew: boolean
}) {
  return (
    <div className="flex flex-col gap-8">
      <Group title="The entry">
        <Choice
          label="Visibility"
          options={[
            { value: 'draft', label: 'Draft, only here' },
            { value: 'published', label: 'Published on the site' },
          ]}
          value={entry.status}
          onChange={(status) =>
            // Publishing for the first time stamps today's date, unless one is already set.
            onChange(
              status === 'published' && !entry.publishedAt
                ? { status, publishedAt: new Date().toLocaleDateString('en-CA') }
                : { status },
            )
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Title" value={entry.title} onChange={onTitleChange} />
          <TextInput
            label="Link name"
            value={entry.slug}
            onChange={(slug) => onChange({ slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            hint={
              isNew
                ? `The page will be sobjo.com/notebook/${entry.slug || '…'}`
                : 'Changing this changes the entry’s address, so old links stop working.'
            }
          />
        </div>
        <TextArea
          label="Summary"
          value={entry.summary ?? ''}
          onChange={(summary) => onChange({ summary })}
          hint="One sentence for the entry’s card on the Notebook page."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Choice<Builder>
            label="Written by"
            options={(['gunnar', 'ivanna'] as const).map((builder) => ({ value: builder, label: BUILDER_NAME[builder] }))}
            value={entry.author}
            onChange={(author) => onChange({ author })}
          />
          <TextInput
            label="Category"
            value={entry.category ?? ''}
            onChange={(category) => onChange({ category })}
            placeholder="Build log, Controls, 3D printing…"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Date"
            type="date"
            value={entry.publishedAt ?? ''}
            onChange={(publishedAt) => onChange({ publishedAt })}
            hint="Newest entries show first."
          />
          <TextInput
            label="Entry number"
            type="number"
            value={entry.entryNumber == null ? '' : String(entry.entryNumber)}
            onChange={(value) => onChange({ entryNumber: value === '' ? null : Math.max(0, Math.round(Number(value))) })}
            hint="Shown as “Entry 07” on the page."
          />
        </div>
      </Group>

      <Group title="Writing">
        <PhotoField
          label="Cover photo"
          hint="Shown at the top of the entry."
          photo={entry.coverImage}
          onChange={(coverImage) => onChange({ coverImage })}
          folder="notebook"
          name={entry.slug}
        />
        <MarkdownField
          label="Text"
          value={entry.content}
          onChange={(content) => onChange({ content })}
          folder="notebook"
          name={entry.slug}
          placeholder="What we tried, what happened, what's next."
        />
      </Group>
    </div>
  )
}
