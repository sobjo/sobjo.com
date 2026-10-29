import type { Builder, PartGroup, ProjectStatus, SoftwareGroup, Tint } from './types'

export const BUILDER_NAME: Record<Builder, string> = { gunnar: 'Gunnar', ivanna: 'Ivanna' }

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  'in-progress': 'On the bench',
  finished: 'Finished',
  napkin: 'Napkin sketch',
}

export const STATUS_FILTER_LABEL: Record<ProjectStatus, string> = {
  'in-progress': 'On the bench',
  finished: 'Finished',
  napkin: 'Napkin sketches',
}

export const DEFAULT_CTA: Record<ProjectStatus, string> = {
  'in-progress': 'Follow the build',
  finished: 'Read the report',
  napkin: 'See the sketch',
}

export const TINT_HEX: Record<Tint, string> = {
  sand: '#F3E6C6',
  steel: '#DCE3EA',
  blush: '#F2DCD6',
  paper: '#F4F6F8',
}

export const PART_GROUPS: { value: PartGroup; label: string; colors: [string, string, string] }[] = [
  { value: 'microcontrollers', label: 'Microcontrollers', colors: ['#4E9A85', '#2E7D6B', '#246553'] },
  { value: 'sensors', label: 'Sensors', colors: ['#7FA2CC', '#5E86B8', '#4A6FA0'] },
  { value: 'motors', label: 'Motors & drivers', colors: ['#A3ADB9', '#8C97A4', '#76818E'] },
  { value: 'materials', label: 'Materials', colors: ['#F8D664', '#F2BE22', '#D9A40F'] },
]

export const SOFTWARE_GROUPS: { value: SoftwareGroup; label: string; color: string }[] = [
  { value: 'languages', label: 'Languages', color: '#3B6FB6' },
  { value: 'cad', label: 'CAD & design', color: '#F2BE22' },
  { value: 'os', label: 'OS & tools', color: '#2E7D6B' },
  { value: 'ai', label: 'AI & productivity', color: '#C2523C' },
]
