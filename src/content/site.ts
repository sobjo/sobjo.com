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
  /** Pinned in the About hero: the big one on the left, then top right, then bottom right. */
  photos: [
    {
      src: '/about/garden.jpg' as string | null,
      alt: 'Gunnar and Ivanna smiling in a selfie by the pond at the Morikami Museum',
      placeholder: '[Couple photo 1]',
      caption: 'Morikami Museum' as string | null,
      position: '50% 40%',
    },
    {
      src: '/about/escape-room.jpg' as string | null,
      alt: 'Gunnar and Ivanna after an escape room, holding signs that read MVP and Still confused?',
      placeholder: '[Photo 2]',
      caption: null as string | null,
      position: '50% 38%',
    },
    {
      src: '/about/bench.jpg' as string | null,
      alt: 'The workbench: an L-shaped desk covered in tools, wires and robot parts',
      placeholder: '[Photo 3 · at the bench]',
      caption: null as string | null,
      position: '50% 42%',
    },
  ],
}

export interface Person {
  id: 'gunnar' | 'ivanna'
  firstName: string
  lastName: string
  /** Leave null to hide the Education row. */
  education: string | null
  work: string
  onOurBuilds: string
  photo: string | null
  /** Which part of the photo stays in frame when it is cropped to the card. */
  photoPosition: string
  photoAlt: string
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
    lastName: 'Bjorkman',
    education: null,
    work: 'CAD Designer · Regal Boats',
    onOurBuilds: 'Mechanical design and CAD design',
    photo: '/about/gunnar-cubli.jpg',
    photoPosition: '50% 40%',
    photoAlt: 'Gunnar sitting on the floor, holding up the Cubli',
    cartoon: null,
    possessive: 'his',
    linkedin: '#linkedin',
    github: '#github',
  },
  {
    id: 'ivanna',
    firstName: 'Ivanna',
    lastName: 'Socarras',
    education: 'B.Sc., Computer Engineering · University of Central Florida',
    work: 'Software Engineer · Hybrid Enterprises LLC',
    onOurBuilds: 'Hardware design and hardware/software integration',
    photo: '/about/ivanna.jpg',
    photoPosition: '56% 35%',
    photoAlt: 'Ivanna in a green knit bucket hat and green cardigan, smiling',
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
