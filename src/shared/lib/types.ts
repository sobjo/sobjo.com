/*
 * The shapes the pages work with. src/shared/lib/content.ts builds these from the
 * content files (projects, notebook) and the CMS (bench), so pages never touch raw data.
 */

export type Builder = 'gunnar' | 'ivanna'
export type ProjectStatus = 'in-progress' | 'finished' | 'napkin'
/** Which isometric drawing a project's cards show (its photo fades in over it on hover). */
export type Illustration = 'cheetah' | 'cube' | 'miniq' | 'kvm' | 'idea'
export type Tint = 'sand' | 'steel' | 'blush' | 'paper'
/** Long-form text, written in Markdown in the /update-site editor. */
export type Markdown = string

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
  tools: string | null
  /** A photo of the real build, shown when someone hovers the drawing. */
  photo: Image | null
  body: Markdown | null
  illustration: Illustration
  tint: Tint
  featured: boolean
  /** Link text on the project's card, like "Follow the build". */
  ctaLabel: string
  /** When the project was last changed in the editor, like "2026-11-20". */
  updatedAt: string | null
  /** The same day for people, like "Nov 20, 2026". */
  updatedLabel: string | null
}

export interface Post {
  slug: string
  title: string
  summary: string | null
  /** Shown as "Entry 06". */
  entryNumber: number | null
  author: Builder
  category: string | null
  dateLabel: string | null
  readLabel: string | null
  /** When it was published, like "2026-11-20" (for sorting). */
  publishedAt: string | null
  content: Markdown | null
  coverImage: Image | null
}

/** The pieces of equipment drawn on the Bench page illustration. */
export type BenchSpot = 'psu' | 'solder' | 'printer' | 'scope' | 'monitor'
export type PartGroup = 'microcontrollers' | 'sensors' | 'motors' | 'comms' | 'materials'
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
