'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { slugify, type NotebookEntry, type ProjectEntry } from '@/shared/lib/content-files'
import { TINT_HEX } from '@/shared/lib/labels'
import { IsoArt } from '@/shared/ui/IsoArt'
import { entryLabel } from '@/shared/ui/PostCard'
import { StatusBadge } from '@/shared/ui/StatusBadge'

import { signOutOfEditor } from '../_lib/actions'
import type { Loaded } from '../_lib/load'
import type { PendingPhoto } from '../_lib/photos'
import { EntryForm } from './EntryForm'
import { PhotosContext } from './fields'
import { ProjectForm } from './ProjectForm'

/*
 * The /update-site editor. Two tabs, Projects and Notebook, each with a list on
 * the left and the picked item's form on the right. Changes stay in the browser
 * until "Save and publish", which sends the whole tab (plus any new photos) to
 * /api/update-site to be committed in one go.
 */

type Kind = 'projects' | 'notebook'
type Item = ProjectEntry | NotebookEntry

/** One tab's state. Items carry a `key` so they keep their place while their link name is edited. */
interface Collection<T> {
  items: (T & { key: string })[]
  /** The items as last saved, to tell what changed. */
  saved: string
  sha: string
  selected: string | null
  /** Items added since the last save; their link name follows their title until it's edited by hand. */
  fresh: string[]
  status: { kind: 'idle' | 'saving' | 'saved' | 'error'; text?: string; link?: string }
}

/** Today where the editor is open, like "2026-11-20". */
function localDay() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

let nextKey = 0
const newKey = () => `item-${nextKey++}`
const strip = <T,>(items: (T & { key: string })[]) => items.map(({ key: _key, ...item }) => item as T)

function start<T>(loaded: Loaded<T>): Collection<T> {
  const items = loaded.items.map((item) => ({ ...item, key: newKey() }))
  return {
    items,
    saved: JSON.stringify(loaded.items),
    sha: loaded.sha,
    selected: items[0]?.key ?? null,
    fresh: [],
    status: { kind: 'idle' },
  }
}

function blankProject(): ProjectEntry {
  return {
    slug: '',
    title: '',
    status: 'napkin',
    year: 'Someday',
    builders: ['gunnar', 'ivanna'],
    summary: null,
    tools: null,
    illustration: 'idea',
    tint: 'paper',
    featured: false,
    ctaLabel: '',
    photo: null,
    body: '',
    updatedAt: null,
  }
}

function blankEntry(entries: NotebookEntry[]): NotebookEntry {
  const highest = Math.max(0, ...entries.map((entry) => entry.entryNumber ?? 0))
  return {
    slug: '',
    title: '',
    summary: null,
    entryNumber: highest + 1,
    author: 'ivanna',
    category: null,
    publishedAt: null,
    status: 'draft',
    coverImage: null,
    content: '',
  }
}

export function Editor({
  email,
  projects,
  notebook,
  canSave,
}: {
  email: string
  projects: Loaded<ProjectEntry>
  notebook: Loaded<NotebookEntry>
  canSave: boolean
}) {
  const [tab, setTab] = useState<Kind>('projects')
  const [state, setState] = useState({ projects: start(projects), notebook: start(notebook) })
  /** New photos by their future URL. `committed` ones are on GitHub but maybe not on the site yet. */
  const [photos, setPhotos] = useState<Record<string, PendingPhoto & { committed?: boolean }>>({})

  const current = state[tab] as Collection<Item>
  const selected = current.items.find((item) => item.key === current.selected) ?? null
  const dirty = {
    projects: JSON.stringify(strip(state.projects.items)) !== state.projects.saved,
    notebook: JSON.stringify(strip(state.notebook.items)) !== state.notebook.saved,
  }

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty.projects && !dirty.notebook) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty.projects, dirty.notebook])

  const update = useCallback(
    (kind: Kind, change: (collection: Collection<Item>) => Collection<Item>) =>
      setState((all) => ({ ...all, [kind]: change(all[kind] as Collection<Item>) })),
    [],
  )

  const photoContext = useMemo(
    () => ({
      add: (photo: PendingPhoto) => setPhotos((all) => ({ ...all, [`/${photo.path}`]: photo })),
      src: (url: string) => photos[url]?.preview ?? url,
    }),
    [photos],
  )

  function edit(patch: Partial<Item>) {
    update(tab, (c) => ({
      ...c,
      status: c.status.kind === 'saving' ? c.status : { kind: 'idle' },
      items: c.items.map((item) => (item.key === c.selected ? ({ ...item, ...patch } as typeof item) : item)),
    }))
  }

  function editTitle(title: string) {
    const follow = selected && current.fresh.includes(selected.key) && selected.slug === slugify(selected.title)
    edit(follow ? { title, slug: slugify(title) } : { title })
  }

  function add() {
    const item = {
      ...(tab === 'projects' ? blankProject() : blankEntry(strip(state.notebook.items))),
      key: newKey(),
    } as Item & { key: string }
    // New projects go at the end of the list; new notebook entries at the top, where the newest are.
    update(tab, (c) => ({
      ...c,
      items: tab === 'projects' ? [...c.items, item] : [item, ...c.items],
      selected: item.key,
      fresh: [...c.fresh, item.key],
    }))
  }

  function remove(key: string) {
    update(tab, (c) => {
      const items = c.items.filter((item) => item.key !== key)
      return { ...c, items, selected: c.selected === key ? (items[0]?.key ?? null) : c.selected }
    })
  }

  function move(key: string, by: -1 | 1) {
    update(tab, (c) => {
      const from = c.items.findIndex((item) => item.key === key)
      const to = from + by
      if (to < 0 || to >= c.items.length) return c
      const items = [...c.items]
      ;[items[from], items[to]] = [items[to], items[from]]
      return { ...c, items }
    })
  }

  function discard() {
    const original = JSON.parse(current.saved) as Item[]
    update(tab, (c) => start({ items: original, sha: c.sha, source: 'github' }) as Collection<Item>)
  }

  async function save() {
    const kind = tab
    const items = strip(state[kind].items as (Item & { key: string })[])
    const text = JSON.stringify(items)
    const uploads = Object.entries(photos)
      .filter(([url, photo]) => !photo.committed && url.startsWith(`/uploads/${kind}/`) && text.includes(`"${url}"`))
      .map(([, photo]) => ({ path: photo.path, data: photo.data }))

    update(kind, (c) => ({ ...c, status: { kind: 'saving' } }))
    try {
      const response = await fetch('/api/update-site', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind, items, sha: state[kind].sha, uploads, today: localDay() }),
      })
      const result = (await response.json().catch(() => ({}))) as {
        sha?: string
        commitUrl?: string
        error?: string
        /** What was saved, with projects' new last updated dates filled in. */
        items?: Item[]
      }
      if (!response.ok || !result.sha) throw new Error(result.error ?? 'Saving didn’t work. Try again.')

      setPhotos((all) =>
        Object.fromEntries(
          Object.entries(all).map(([url, photo]) => [
            url,
            uploads.some((upload) => upload.path === photo.path) ? { ...photo, committed: true } : photo,
          ]),
        ),
      )
      // Only the dates come back from the server; everything else stays as typed.
      const dates = new Map(
        (result.items ?? []).filter((item) => 'updatedAt' in item).map((item) => [item.slug, (item as ProjectEntry).updatedAt]),
      )
      const withDate = <T extends Item>(item: T): T =>
        dates.has(item.slug) ? { ...item, updatedAt: dates.get(item.slug) } : item
      update(kind, (c) => ({
        ...c,
        items: c.items.map((item) => withDate(item)),
        saved: JSON.stringify(items.map((item) => withDate(item))),
        sha: result.sha!,
        fresh: [],
        status: { kind: 'saved', text: 'Saved. The site updates in a minute or two.', link: result.commitUrl },
      }))
    } catch (error) {
      update(kind, (c) => ({
        ...c,
        status: { kind: 'error', text: error instanceof Error ? error.message : 'Saving didn’t work.' },
      }))
    }
  }

  const isProjects = tab === 'projects'

  return (
    <PhotosContext.Provider value={photoContext}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b-[1.5px] border-line bg-white">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <div className="flex items-baseline gap-3">
              <span className="hl text-[28px]">SOBJO</span>
              <span className="mono text-[10px] text-muted">Update the site</span>
            </div>
            <nav className="flex gap-1" aria-label="What to edit">
              {(['projects', 'notebook'] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setTab(kind)}
                  aria-current={tab === kind ? 'page' : undefined}
                  className={`mono relative cursor-pointer rounded-md px-3 py-2 text-[11px] font-bold ${
                    tab === kind ? 'bg-ink text-butter' : 'text-muted hover:bg-mist'
                  }`}
                >
                  {kind === 'projects' ? 'Projects' : 'Notebook'}
                  {dirty[kind] && (
                    <span className="absolute top-1 right-1 size-1.5 rounded-full bg-ivanna" aria-label="unsaved" />
                  )}
                </button>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-4 text-[13px] text-muted">
              <a href={isProjects ? '/projects' : '/notebook'} target="_blank" rel="noreferrer" className="ulink text-[10px]">
                View site ↗
              </a>
              <span className="hidden md:inline">{email}</span>
              <form action={signOutOfEditor}>
                <button type="submit" className="mono cursor-pointer border-0 bg-transparent text-[10px] text-muted hover:text-ivanna">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        {!canSave && (
          <div className="border-b-[1.5px] border-sun bg-butter/40">
            <p className="mx-auto m-0 max-w-[1240px] px-4 py-2 text-[13px]">
              Saving is off until GITHUB_TOKEN is added in Vercel. You can look around, but changes won’t be kept.
            </p>
          </div>
        )}

        <div className="mx-auto grid w-full max-w-[1240px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* The list */}
          <aside className="flex flex-col gap-3 self-start lg:sticky lg:top-[80px]">
            <div className="flex items-center justify-between">
              <h1 className="hl m-0 text-[36px]">{isProjects ? 'Projects' : 'Notebook'}</h1>
              <button type="button" onClick={add} className="btn min-h-[36px] cursor-pointer border-0 px-3 text-[11px]">
                + New
              </button>
            </div>
            <ul className="m-0 flex max-h-[50vh] list-none flex-col gap-2 overflow-auto p-0 lg:max-h-[calc(100vh-200px)]">
              {current.items.map((item, index) => (
                <li key={item.key}>
                  <ListRow
                    item={item}
                    isProjects={isProjects}
                    active={item.key === current.selected}
                    onPick={() => {
                      update(tab, (c) => ({ ...c, selected: item.key }))
                      // On a phone the form is below the list, so bring it into view.
                      if (window.innerWidth < 1024)
                        document.getElementById('editor-form')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    onMove={isProjects ? (by) => move(item.key, by) : undefined}
                    first={index === 0}
                    last={index === current.items.length - 1}
                  />
                </li>
              ))}
              {current.items.length === 0 && (
                <li className="rounded-md border-[1.5px] border-dashed border-rule p-4 text-[14px] text-muted">
                  {isProjects ? 'No projects yet.' : 'No entries yet. Start one with + New.'}
                </li>
              )}
            </ul>
            {isProjects && (
              <p className="m-0 text-[12px] leading-[1.45] text-muted">
                The order here is the order on the Projects page and on the workshop desk.
              </p>
            )}
          </aside>

          {/* The form */}
          <main id="editor-form" className="card min-w-0 scroll-mt-[90px] p-5 pb-8 hover:border-line hover:shadow-[0_3px_0_var(--color-line)] md:p-8">
            {selected ? (
              <>
                {isProjects ? (
                  <ProjectForm
                    key={selected.key}
                    project={selected as ProjectEntry}
                    onChange={edit}
                    onTitleChange={editTitle}
                    isNew={current.fresh.includes(selected.key)}
                  />
                ) : (
                  <EntryForm
                    key={selected.key}
                    entry={selected as NotebookEntry}
                    onChange={edit}
                    onTitleChange={editTitle}
                    isNew={current.fresh.includes(selected.key)}
                  />
                )}
                <DeleteButton
                  label={isProjects ? 'Delete this project' : 'Delete this entry'}
                  onDelete={() => remove(selected.key)}
                />
              </>
            ) : (
              <p className="m-0 text-muted">Pick something on the left, or start something new.</p>
            )}
          </main>
        </div>

        {/* Save bar */}
        <footer className="sticky bottom-0 z-20 border-t-[1.5px] border-line bg-white">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-3 px-4 py-3">
            <SaveStatus status={current.status} dirty={dirty[tab]} />
            <div className="ml-auto flex gap-2">
              {dirty[tab] && current.status.kind !== 'saving' && (
                <button
                  type="button"
                  onClick={discard}
                  className="mono cursor-pointer rounded-md border-[1.5px] border-line bg-white px-3 text-[11px] text-muted hover:border-rule"
                >
                  Undo changes
                </button>
              )}
              <button
                type="button"
                onClick={save}
                disabled={!canSave || !dirty[tab] || current.status.kind === 'saving'}
                className="btn cursor-pointer border-0 disabled:cursor-default disabled:bg-mist disabled:text-steel"
              >
                {current.status.kind === 'saving' ? 'Saving…' : 'Save and publish'}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </PhotosContext.Provider>
  )
}

function ListRow({
  item,
  isProjects,
  active,
  onPick,
  onMove,
  first,
  last,
}: {
  item: Item
  isProjects: boolean
  active: boolean
  onPick: () => void
  onMove?: (by: -1 | 1) => void
  first: boolean
  last: boolean
}) {
  const project = item as ProjectEntry
  const entry = item as NotebookEntry
  return (
    <div
      className={`flex items-center gap-2 rounded-md border-[1.5px] bg-white pr-1 transition-colors ${
        active ? 'border-ink shadow-[0_3px_0_var(--color-ink)]' : 'border-line hover:border-rule'
      }`}
    >
      <button type="button" onClick={onPick} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 p-2 text-left">
        {isProjects ? (
          <span
            className="flex size-[44px] flex-none items-center justify-center rounded"
            style={{ background: TINT_HEX[project.tint] }}
          >
            <IsoArt
              name={project.illustration === 'idea' ? 'napkin-gear' : project.illustration}
              floor={false}
              width={40}
              height={32}
            />
          </span>
        ) : null}
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[15px] font-semibold">{item.title || 'Untitled'}</span>
          <span className="mono flex flex-wrap items-center gap-1.5 text-[9px] text-muted">
            {isProjects ? (
              <StatusBadge status={project.status} />
            ) : (
              <>
                <span>{entryLabel(entry.entryNumber)}</span>
                <span
                  className={`rounded px-1.5 py-0.5 ${entry.status === 'published' ? 'bg-moss text-white' : 'bg-mist'}`}
                >
                  {entry.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </>
            )}
          </span>
        </span>
      </button>
      {onMove && (
        <span className="flex flex-col">
          <button
            type="button"
            aria-label={`Move ${item.title} up`}
            disabled={first}
            onClick={() => onMove(-1)}
            className="cursor-pointer rounded px-1.5 text-[12px] text-muted hover:bg-mist disabled:opacity-25"
          >
            ▲
          </button>
          <button
            type="button"
            aria-label={`Move ${item.title} down`}
            disabled={last}
            onClick={() => onMove(1)}
            className="cursor-pointer rounded px-1.5 text-[12px] text-muted hover:bg-mist disabled:opacity-25"
          >
            ▼
          </button>
        </span>
      )}
    </div>
  )
}

function DeleteButton({ label, onDelete }: { label: string; onDelete: () => void }) {
  const [asking, setAsking] = useState(false)
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t-[1.5px] border-line pt-5">
      {asking ? (
        <>
          <span className="text-[14px]">Delete it? It leaves the site when you save.</span>
          <button
            type="button"
            onClick={onDelete}
            className="mono cursor-pointer rounded-md border-0 bg-ivanna px-3 py-2 text-[11px] text-white"
          >
            Yes, delete
          </button>
          <button
            type="button"
            onClick={() => setAsking(false)}
            className="mono cursor-pointer rounded-md border-[1.5px] border-line bg-white px-3 py-2 text-[11px] text-muted"
          >
            Keep it
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="mono cursor-pointer border-0 bg-transparent p-0 text-[11px] text-muted hover:text-ivanna"
        >
          {label}
        </button>
      )}
    </div>
  )
}

function SaveStatus({ status, dirty }: { status: Collection<Item>['status']; dirty: boolean }) {
  if (status.kind === 'error')
    return (
      <span role="alert" className="text-[14px] text-ivanna">
        {status.text}
      </span>
    )
  if (status.kind === 'saved' && !dirty)
    return (
      <span className="text-[14px] text-moss">
        {status.text}{' '}
        {status.link && (
          <a href={status.link} target="_blank" rel="noreferrer" className="underline">
            See the change
          </a>
        )}
      </span>
    )
  return <span className="text-[14px] text-muted">{dirty ? 'You have unsaved changes.' : 'Everything is saved.'}</span>
}
