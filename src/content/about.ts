/**
 * Copy for the About page: the intro, the pinned photos, the two of you, and the
 * shared interests. Photos live in public/about. Fill in the [bracketed] bits.
 */

export const about = {
  who: "We are a robotics-loving couple based in Orlando, Florida. We fell in love over our mutual obsession with all things hardware and robotics. When we aren't tinkering in our home lab, you can usually find us strategizing over a board game, playing video games, experimenting with new recipes in the kitchen, or trying to solve a new escape room.",
  why: 'This is our digital home, somewhere we could look back at how far our projects have evolved and document our journey. But more than that, this is our way of sharing our passion for automation and robotics with the world. We built this to connect with fellow makers, to inspire others to find joy in building things, and to encourage you to recreate our projects, test them out, and share your feedback along the way.',
  /** Escape rooms solved in a row. Shown under "Who we are"; bump it after each win. */
  escapeRoomStreak: 3,
  /** Pinned in the About hero: top right, then the big full-body one on the left, then bottom right. */
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
      caption: 'Our first escape room together' as string | null,
      position: '50% 70%',
    },
    {
      src: '/about/bench.jpg' as string | null,
      alt: 'The workbench: an L-shaped desk covered in tools, wires and robot parts',
      placeholder: '[Photo 3 · at the bench]',
      caption: 'Our temporary setup' as string | null,
      position: '50% 40%',
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
    onOurBuilds: 'Mechanical design, CAD design and hardware design',
    photo: '/about/gunnar-centered.jpg',
    photoPosition: '50% 50%',
    photoAlt: 'Gunnar sitting on the floor, holding up the Cubli',
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
