'use client'

import { ILLUSTRATIONS, STATUSES, TINTS, type ProjectEntry } from '@/shared/lib/content-files'
import { BUILDER_NAME, DEFAULT_CTA, STATUS_LABEL, TINT_HEX } from '@/shared/lib/labels'
import type { Builder, Illustration } from '@/shared/lib/types'
import { IsoArt } from '@/shared/ui/IsoArt'
import { ProjectMedia } from '@/shared/ui/ProjectMedia'
import { StatusBadge } from '@/shared/ui/StatusBadge'

import { Choice, MarkdownField, PhotoField, TextArea, TextInput, Toggle, usePhotos } from './fields'

/** What each drawing is, in words. The drawings themselves are code, shared with the home page desk. */
const DRAWING_LABEL: Record<Illustration, string> = {
  cheetah: 'Robot dog',
  cube: 'Cubli',
  miniq: 'MiniQ',
  kvm: 'KVM board',
  idea: 'Napkin sketch',
}

const TINT_LABEL = { sand: 'Sand', steel: 'Steel', blush: 'Blush', paper: 'Paper' } as const

export function ProjectForm({
  project,
  onChange,
  onTitleChange,
  isNew,
}: {
  project: ProjectEntry
  onChange: (patch: Partial<ProjectEntry>) => void
  /** Titles go through the editor so a new project's link name can follow along. */
  onTitleChange: (title: string) => void
  isNew: boolean
}) {
  const photos = usePhotos()
  const preview = {
    ...project,
    photo: project.photo ? { ...project.photo, url: photos.src(project.photo.url) } : null,
    body: null,
    ctaLabel: project.ctaLabel || DEFAULT_CTA[project.status],
  }

  return (
    <div className="flex flex-col gap-8">
      {/* How the project's card will look */}
      <section className="card flex flex-wrap gap-5 p-4 hover:border-line hover:shadow-[0_3px_0_var(--color-line)]">
        <ProjectMedia project={preview} className="h-[130px] w-[160px] flex-none rounded-md" sizes="160px" />
        <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-2">
          <div className="mono flex flex-wrap items-center gap-2 text-[10px] text-muted">
            <StatusBadge status={project.status} />
            {project.year && <span>{project.year}</span>}
            {project.featured && <span className="rounded bg-mist px-1.5 py-0.5">On the home page</span>}
          </div>
          <span className="hl text-[36px]">{project.title || 'Untitled'}</span>
          {project.summary && <span className="text-[14px] leading-[1.5] text-body">{project.summary}</span>}
        </div>
      </section>

      <Group title="The basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Title" value={project.title} onChange={onTitleChange} />
          <TextInput
            label="Link name"
            value={project.slug}
            onChange={(slug) => onChange({ slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            hint={
              isNew
                ? `The page will be sobjo.com/projects/${project.slug || '…'}`
                : 'Changing this changes the project’s address, so old links stop working.'
            }
          />
        </div>
        <Choice
          label="Status"
          options={STATUSES.map((status) => ({ value: status, label: STATUS_LABEL[status] }))}
          value={project.status}
          onChange={(status) => onChange({ status })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Dates"
            value={project.year ?? ''}
            onChange={(year) => onChange({ year })}
            placeholder="Started July 2026"
          />
          <Choice<Builder>
            label="Built by"
            options={(['gunnar', 'ivanna'] as const).map((builder) => ({ value: builder, label: BUILDER_NAME[builder] }))}
            value={project.builders}
            onChange={(builder) =>
              onChange({
                builders: project.builders.includes(builder)
                  ? project.builders.filter((b) => b !== builder)
                  : (['gunnar', 'ivanna'] as const).filter((b) => b === builder || project.builders.includes(b)),
              })
            }
          />
        </div>
        <TextArea
          label="Summary"
          value={project.summary ?? ''}
          onChange={(summary) => onChange({ summary })}
          hint="One or two sentences for the project’s card."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Toggle
            label="Show on the home page"
            hint="Under “On the bench this month”. The first two shown get a spot."
            checked={project.featured}
            onChange={(featured) => onChange({ featured })}
          />
          <TextInput
            label="Card link text"
            value={project.ctaLabel}
            onChange={(ctaLabel) => onChange({ ctaLabel })}
            placeholder={DEFAULT_CTA[project.status]}
          />
        </div>
      </Group>

      <Group title="Art and photo">
        <div role="group" aria-label="Drawing" className="flex flex-col gap-1.5">
          <span className="mono text-[10px] font-bold text-muted">Drawing</span>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2">
            {ILLUSTRATIONS.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={project.illustration === name}
                onClick={() => onChange({ illustration: name })}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border-[1.5px] p-2 transition-colors ${
                  project.illustration === name ? 'border-ink bg-white' : 'border-line bg-white/60 hover:border-rule'
                }`}
                style={{ background: project.illustration === name ? TINT_HEX[project.tint] : undefined }}
              >
                <IsoArt name={name === 'idea' ? 'napkin-gear' : name} floor={false} width={84} height={67} />
                <span className="text-[13px]">{DRAWING_LABEL[name]}</span>
              </button>
            ))}
          </div>
          <span className="text-[12px] leading-[1.45] text-muted">
            The same drawing sits on the desk in the home page workshop. Napkin sketches pick their doodle from the link
            name.
          </span>
        </div>
        <Choice
          label="Background"
          options={TINTS.map((tint) => ({
            value: tint,
            label: (
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-block size-4 rounded-sm border border-rule"
                  style={{ background: TINT_HEX[tint] }}
                />
                {TINT_LABEL[tint]}
              </span>
            ),
          }))}
          value={project.tint}
          onChange={(tint) => onChange({ tint })}
        />
        <PhotoField
          label="Photo of the real build"
          hint="Fades in over the drawing when someone hovers the picture."
          photo={project.photo}
          onChange={(photo) => onChange({ photo })}
          folder="projects"
          name={project.slug}
        />
      </Group>

      <Group title="The write-up">
        <TextArea
          label="Parts and software"
          value={project.tools ?? ''}
          onChange={(tools) => onChange({ tools })}
          rows={2}
          placeholder="ESP32, two BLDC motors, Fusion 360, C++"
        />
        <MarkdownField
          label="Write-up"
          value={project.body}
          onChange={(body) => onChange({ body })}
          folder="projects"
          name={project.slug}
          placeholder="The build log, what broke, and what we learned."
        />
      </Group>
    </div>
  )
}

export function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="hl m-0 border-b-[1.5px] border-line pb-2 text-[28px]">{title}</h2>
      {children}
    </section>
  )
}
