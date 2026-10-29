import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export type Builder = 'gunnar' | 'ivanna'
export type ProjectStatus = 'in-progress' | 'finished' | 'napkin'
export type Illustration = 'cheetah' | 'cube' | 'idea'
export type Tint = 'sand' | 'steel' | 'blush' | 'paper'
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
  progress: { done: number; total: number } | null
  photo: Image | null
  body: RichText | null
  illustration: Illustration
  tint: Tint
  featured: boolean
  ctaLabel: string
}

export interface Post {
  slug: string
  title: string
  summary: string | null
  entryNumber: number | null
  author: Builder
  category: string | null
  project: { slug: string; title: string } | null
  dateLabel: string | null
  readLabel: string | null
  content: RichText | null
  coverImage: Image | null
}

export type BenchSpot = 'psu' | 'solder' | 'printer' | 'scope' | 'monitor'
export type PartGroup = 'microcontrollers' | 'sensors' | 'motors' | 'materials'
export type SoftwareGroup = 'languages' | 'cad' | 'os' | 'ai'

export interface Equipment {
  id: string
  name: string
  model: string | null
  location: string | null
  description: string | null
  spot: BenchSpot | null
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
  tag: string | null
  description: string | null
}

export interface BenchContent {
  equipment: Equipment[]
  parts: Part[]
  software: Software[]
}
