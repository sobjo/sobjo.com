'use client'

import { createContext, useContext, useId, useRef, useState } from 'react'

import type { StoredImage } from '@/shared/lib/content-files'
import { Markdown } from '@/shared/ui/Markdown'

import { shrinkPhoto, type PendingPhoto } from '../_lib/photos'

/*
 * The small form pieces both editor forms are built from: labeled fields, text
 * inputs, button groups, a photo picker and a Markdown box with a preview.
 */

export const inputClass =
  'w-full rounded-md border-[1.5px] border-line bg-white px-3 py-2.5 font-sans text-[15px] text-ink outline-none transition-colors focus:border-ink'

// ------------------------------------------------------------------ photos that aren't committed yet

interface Photos {
  /** Keeps a new photo until it's saved, so it can be committed with the content. */
  add: (photo: PendingPhoto) => void
  /** The address to show a photo at: its preview while it's new, its real URL once it's on the site. */
  src: (url: string) => string
}
export const PhotosContext = createContext<Photos>({ add: () => {}, src: (url) => url })
export const usePhotos = () => useContext(PhotosContext)

// ------------------------------------------------------------------ layout

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string
  hint?: React.ReactNode
  children: (id: string) => React.ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="mono text-[10px] font-bold text-muted">
        {label}
      </label>
      {children(id)}
      {hint && <span className="text-[12px] leading-[1.45] text-muted">{hint}</span>}
    </div>
  )
}

export function TextInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
  className,
  type = 'text',
}: {
  label: string
  hint?: React.ReactNode
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  type?: 'text' | 'date' | 'number'
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </Field>
  )
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string
  hint?: React.ReactNode
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <textarea
          id={id}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} resize-y leading-[1.55]`}
        />
      )}
    </Field>
  )
}

/** A row of buttons where one (or, with `multiple`, several) is picked. */
export function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: React.ReactNode; title?: string }[]
  value: T | T[]
  onChange: (value: T) => void
}) {
  const picked = (option: T) => (Array.isArray(value) ? value.includes(option) : value === option)
  return (
    <div role="group" aria-label={label} className="flex min-w-0 flex-col gap-1.5">
      <span className="mono text-[10px] font-bold text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-pressed={picked(option.value)}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer rounded-md border-[1.5px] px-3 py-2 text-[14px] transition-colors ${
              picked(option.value)
                ? 'border-ink bg-ink text-butter'
                : 'border-line bg-white text-ink hover:border-rule'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border-[1.5px] border-line bg-white px-3 py-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 accent-ink"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[15px]">{label}</span>
        {hint && <span className="text-[12px] text-muted">{hint}</span>}
      </span>
    </label>
  )
}

// ------------------------------------------------------------------ photo picker

export function PhotoField({
  label,
  hint,
  photo,
  onChange,
  folder,
  name,
}: {
  label: string
  hint?: string
  photo: StoredImage | null
  onChange: (photo: StoredImage | null) => void
  folder: 'projects' | 'notebook'
  /** Used to name the file, like the project's link name. */
  name: string
}) {
  const photos = usePhotos()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function pick(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const shrunk = await shrinkPhoto(file, folder, name)
      photos.add(shrunk)
      onChange({ url: `/${shrunk.path}`, alt: photo?.alt ?? '', width: shrunk.width, height: shrunk.height })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That photo couldn’t be read.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="mono text-[10px] font-bold text-muted">{label}</span>
      <div className="flex flex-wrap items-start gap-3 rounded-md border-[1.5px] border-dashed border-rule bg-white p-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- the preview may be a data: URL
          <img
            src={photos.src(photo.url)}
            alt=""
            className="h-[96px] w-[128px] flex-none rounded border-[1.5px] border-line object-cover"
          />
        ) : (
          <div className="mono flex h-[96px] w-[128px] flex-none items-center justify-center rounded bg-mist text-center text-[10px] text-muted">
            No photo
          </div>
        )}
        <div className="flex min-w-[180px] flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="cursor-pointer rounded-md border-[1.5px] border-ink bg-white px-3 py-1.5 text-[14px] hover:bg-mist disabled:opacity-50"
            >
              {busy ? 'Shrinking…' : photo ? 'Replace' : 'Add a photo'}
            </button>
            {photo && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="cursor-pointer rounded-md border-[1.5px] border-line bg-white px-3 py-1.5 text-[14px] text-muted hover:border-ivanna hover:text-ivanna"
              >
                Remove
              </button>
            )}
          </div>
          {photo && (
            <input
              aria-label={`${label} description`}
              value={photo.alt}
              placeholder="Describe the photo for screen readers"
              onChange={(event) => onChange({ ...photo, alt: event.target.value })}
              className={`${inputClass} py-1.5 text-[14px]`}
            />
          )}
          {hint && <span className="text-[12px] leading-[1.45] text-muted">{hint}</span>}
          {error && <span className="text-[12px] text-ivanna">{error}</span>}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => pick(event.target.files?.[0])}
        />
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ Markdown box

const TOOLS = [
  { label: 'B', title: 'Bold', className: 'font-bold' },
  { label: 'I', title: 'Italic', className: 'italic' },
  { label: 'Heading', title: 'Heading' },
  { label: 'List', title: 'Bulleted list' },
  { label: 'Quote', title: 'Quote' },
  { label: 'Link', title: 'Link' },
  { label: 'Code', title: 'Code' },
  { label: 'Photo', title: 'Add a photo here' },
] as const
type ToolName = (typeof TOOLS)[number]['title']

/** A text box for long writing, with buttons for the common formatting and a preview. */
export function MarkdownField({
  label,
  value,
  onChange,
  folder,
  name,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  folder: 'projects' | 'notebook'
  name: string
  placeholder?: string
}) {
  const photos = usePhotos()
  const id = useId()
  const area = useRef<HTMLTextAreaElement>(null)
  const photoInput = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  /** Wraps the selected text (or a placeholder word) in `before`/`after`. */
  function wrap(before: string, after = before, fallback = 'text') {
    const el = area.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end } = el
    const picked = value.slice(start, end) || fallback
    const next = value.slice(0, start) + before + picked + after + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + picked.length)
    })
  }

  /** Starts the current line (or each selected line) with `prefix`. */
  function prefixLines(prefix: string) {
    const el = area.current
    if (!el) return
    const lineStart = value.lastIndexOf('\n', el.selectionStart - 1) + 1
    const end = el.selectionEnd
    const lines = value.slice(lineStart, end).split('\n').map((line) => prefix + line)
    onChange(value.slice(0, lineStart) + lines.join('\n') + value.slice(end))
    requestAnimationFrame(() => el.focus())
  }

  function insertBlock(text: string) {
    const el = area.current
    const at = el ? el.selectionEnd : value.length
    const before = value.slice(0, at)
    const gap = before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : ''
    onChange(before + gap + text + '\n\n' + value.slice(at).replace(/^\n+/, ''))
  }

  async function addPhoto(file: File | undefined) {
    if (!file) return
    try {
      const shrunk = await shrinkPhoto(file, folder, name)
      photos.add(shrunk)
      insertBlock(`![${file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')}](/${shrunk.path})`)
    } finally {
      if (photoInput.current) photoInput.current.value = ''
    }
  }

  function runTool(tool: ToolName) {
    if (tool === 'Bold') wrap('**')
    else if (tool === 'Italic') wrap('*')
    else if (tool === 'Heading') prefixLines('## ')
    else if (tool === 'Bulleted list') prefixLines('- ')
    else if (tool === 'Quote') prefixLines('> ')
    else if (tool === 'Link') wrap('[', '](https://)', 'link text')
    else if (tool === 'Code') wrap('`')
    else photoInput.current?.click()
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <label htmlFor={id} className="mono text-[10px] font-bold text-muted">
          {label}
        </label>
        <div className="flex rounded-md border-[1.5px] border-line bg-white p-0.5" role="tablist">
          {(['write', 'preview'] as const).map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`mono cursor-pointer rounded px-2.5 py-1 text-[10px] ${tab === name ? 'bg-ink text-butter' : 'text-muted'}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      {tab === 'write' ? (
        <div className="overflow-hidden rounded-md border-[1.5px] border-line bg-white focus-within:border-ink">
          <div className="flex flex-wrap gap-1 border-b-[1.5px] border-line bg-paper/60 px-2 py-1.5">
            {TOOLS.map((tool) => (
              <button
                key={tool.title}
                type="button"
                title={tool.title}
                onClick={() => runTool(tool.title)}
                className={`cursor-pointer rounded px-2 py-1 text-[13px] text-body hover:bg-white ${'className' in tool ? tool.className : ''}`}
              >
                {tool.label}
              </button>
            ))}
          </div>
          <textarea
            id={id}
            ref={area}
            rows={14}
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="block min-h-[260px] w-full resize-y border-0 bg-white px-3 py-3 font-mono text-[14px] leading-[1.6] text-ink outline-none"
          />
        </div>
      ) : (
        <div className="min-h-[260px] rounded-md border-[1.5px] border-line bg-white px-5 py-4">
          {value.trim() ? (
            <Markdown text={value} imageSrc={photos.src} />
          ) : (
            <p className="m-0 text-muted">Nothing written yet.</p>
          )}
        </div>
      )}
      <span className="text-[12px] leading-[1.45] text-muted">
        Leave an empty line between paragraphs. **bold**, *italic*, ## for a heading, - for a list.
      </span>
      <input ref={photoInput} type="file" accept="image/*" hidden onChange={(event) => addPhoto(event.target.files?.[0])} />
    </div>
  )
}
