/**
 * Copy that lives in code rather than the CMS: the About page, the home page
 * "right now" blurb and the social links. Fill in the [bracketed] bits.
 */

export const site = {
  name: 'SOBJO',
  byline: 'SOBJO · Gunnar & Ivanna',
  tagline: 'Built on weekends, one part at a time',
  description: 'Two engineers who build little robots together on nights and weekends.',
  links: {
    github: '#github',
    linkedin: '#linkedin',
  },
  rightNow: "[A sentence or two on what you're working on right now, what's working and what isn't.]",
}

export const about = {
  why: '[Why you built the site: a place to keep the whole process behind every build, not just the finished thing, and to share what you learn along the way.]',
  who: '[2 to 3 sentences on your story: how you met, how you started building together, and what you love about working as a team.]',
  photos: [
    { src: null as string | null, alt: '', placeholder: '[Couple photo 1]', caption: '[Caption]' },
    { src: null as string | null, alt: '', placeholder: '[Photo 2]', caption: null },
    { src: null as string | null, alt: '', placeholder: '[Photo 3 · at the bench]', caption: null },
  ],
}

export interface Person {
  id: 'gunnar' | 'ivanna'
  firstName: string
  lastName: string
  education: string
  work: string
  onOurBuilds: string
  photo: string | null
  cartoon: string | null
  /** Used in "Photo of Gunnar; hover to see his cartoon". */
  possessive: string
  linkedin: string
  github: string
}

export const people: Person[] = [
  {
    id: 'gunnar',
    firstName: 'Gunnar',
    lastName: '[Last name]',
    education: '[Degree level], [Major] · [University]',
    work: '[Job title] · [Company]',
    onOurBuilds: '[1 to 2 lines, e.g. mechanical design and hardware]',
    photo: null,
    cartoon: null,
    possessive: 'his',
    linkedin: '#linkedin',
    github: '#github',
  },
  {
    id: 'ivanna',
    firstName: 'Ivanna',
    lastName: '[Last name]',
    education: '[Degree level], Computer Engineering · [University]',
    work: 'Software Engineer · [Company]',
    onOurBuilds: '[1 to 2 lines, e.g. firmware and control code]',
    photo: null,
    cartoon: null,
    possessive: 'her',
    linkedin: '#linkedin',
    github: '#github',
  },
]

export const interests = [
  'Control systems',
  'Robotics',
  'Embedded systems',
  'Mechatronics',
  '3D printing',
  'CAD & design',
] as const
