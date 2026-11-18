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

  return (
    <>
      <HomeHero />
      <FeaturedProjects projects={featured} />
    </>
  )
}
