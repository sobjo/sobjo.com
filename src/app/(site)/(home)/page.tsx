import { getProjects } from '@/shared/lib/content'

import { FeaturedProjects } from './_components/FeaturedProjects'
import { HomeHero } from './_components/HomeHero'

/** Refresh the page from the CMS at most every 5 minutes. */
export const revalidate = 300

/** Shows at most this many featured projects under "On the bench this month". */
const MAX_FEATURED = 2

export default async function HomePage() {
  const projects = await getProjects()
  const featured = projects.filter((project) => project.featured).slice(0, MAX_FEATURED)

  // Finished and in-progress builds take the best spots on the desk; ideas go after them.
  const onDesk = [...projects]
    .sort((a, b) => Number(a.status === 'napkin') - Number(b.status === 'napkin'))
    .map(({ slug, title, illustration }) => ({ slug, title, illustration }))

  return (
    <>
      <HomeHero projects={onDesk} />
      <FeaturedProjects projects={featured} />
    </>
  )
}
