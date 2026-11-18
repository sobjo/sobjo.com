import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/*
 * The shapes the pages work with. src/shared/lib/content.ts builds these from
 * the CMS (or from the placeholder content), so pages never touch raw CMS documents.
 */

export type Builder = 'gunnar' | 'ivanna'
export type ProjectStatus = 'in-progress' | 'finished' | 'napkin'
/** Which isometric drawing stands in for a project without a photo. */
export type Illustration = 'cheetah' | 'cube' | 'idea'
export type Tint = 'sand' | 'steel' | 'blush' | 'paper'
/** Long-form text written in the CMS editor. */
export type RichText = SerializedEditorState

export interface Image {
  url: string
  alt: string
  width?: number
  height?: number
}

export interface Project {
  slug: string
  title: string
  status: ProjectStatus
  year: string | null
  builders: Builder[]
  summary: string | null
  role: string | null
  tools: string | null
  /** Build steps done out of total. Only set for projects in progress. */
  progress: { done: number; total: number } | null
  photo: Image | null
  body: RichText | null
  illustration: Illustration
  tint: Tint
  featured: boolean
  /** Link text on the project's card, like "Follow the build". */
  ctaLabel: string
}

export interface Post {
  slug: string
  title: string
  summary: string | null
  /** Shown as "Entry 06". */
  entryNumber: number | null
  author: Builder
  category: string | null
  project: { slug: string; title: string } | null
  dateLabel: string | null
  readLabel: string | null
  content: RichText | null
  coverImage: Image | null
}

/** The pieces of equipment drawn on the Bench page illustration. */
export type BenchSpot = 'psu' | 'solder' | 'printer' | 'scope' | 'monitor'
export type PartGroup = 'microcontrollers' | 'sensors' | 'motors' | 'materials'
export type SoftwareGroup = 'languages' | 'cad' | 'os' | 'ai'

export interface Equipment {
  id: string
  name: string
  model: string | null
  location: string | null
  description: string | null
  /** Where this sits in the bench drawing, if it is drawn there. */
  spot: BenchSpot | null
  /** Titles of the projects that use it. */
  usedIn: string[]
}

export interface Part {
  id: string
  name: string
  group: PartGroup
  description: string | null
  usedIn: string[]
}

export interface Software {
  id: string
  name: string
  group: SoftwareGroup
  /** Short badge text, like "C++". */
  tag: string | null
  description: string | null
}

export interface BenchContent {
  equipment: Equipment[]
  parts: Part[]
  software: Software[]
}
