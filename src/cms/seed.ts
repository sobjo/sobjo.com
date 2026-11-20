/**
 * Copies the placeholder content from the mockups into the CMS so you can edit
 * it at /addpost instead of starting from empty collections.
 *
 *   npm run seed
 *
 * Safe to run more than once: anything that already exists is left alone.
 */
import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import { placeholderBench, placeholderPosts, placeholderProjects } from '../content/placeholder'

/** Tells the revalidate hooks to skip refreshing pages; there is no running site during a seed. */
const context = { disableRevalidate: true }

/** Maps a project's title to its CMS id, so bench items can link to it. */
type ProjectIds = Map<string, number>

async function seedProjects(payload: Payload): Promise<ProjectIds> {
  const projectIds: ProjectIds = new Map()

  for (const [order, project] of placeholderProjects.entries()) {
    const existing = await payload.find({
      collection: 'projects',
      where: { slug: { equals: project.slug } },
      limit: 1,
    })
    if (existing.docs[0]) {
      projectIds.set(project.title, existing.docs[0].id)
      continue
    }

    const doc = await payload.create({
      collection: 'projects',
      context,
      data: {
        title: project.title,
        slug: project.slug,
        status: project.status,
        year: project.year,
        builders: project.builders,
        summary: project.summary,
        tools: project.tools,
        illustration: project.illustration,
        tint: project.tint,
        featured: project.featured,
        ctaLabel: project.ctaLabel,
        order,
      },
    })
    projectIds.set(project.title, doc.id)
    payload.logger.info(`Project: ${project.title}`)
  }

  return projectIds
}

async function seedPosts(payload: Payload) {
  for (const post of placeholderPosts) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
      draft: true,
    })
    if (existing.docs[0]) continue

    await payload.create({
      collection: 'posts',
      context,
      data: {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        entryNumber: post.entryNumber,
        author: post.author,
        category: post.category,
        publishedAt: new Date().toISOString(),
        _status: 'published',
      },
    })
    payload.logger.info(`Notebook entry: ${post.slug}`)
  }
}

/** Bench items have no unique slug, so they are only added when the collection is empty. */
async function seedBench(payload: Payload, projectIds: ProjectIds) {
  const { totalDocs } = await payload.count({ collection: 'tools' })
  if (totalDocs > 0) return

  let order = 0
  const linkProjects = (titles: string[]) =>
    titles.flatMap((title) => (projectIds.has(title) ? [projectIds.get(title)!] : []))

  for (const equipment of placeholderBench.equipment) {
    await payload.create({
      collection: 'tools',
      context,
      data: {
        kind: 'equipment',
        name: equipment.name,
        model: equipment.model,
        location: equipment.location,
        description: equipment.description,
        benchSpot: equipment.spot,
        usedIn: linkProjects(equipment.usedIn),
        order: order++,
      },
    })
  }
  for (const part of placeholderBench.parts) {
    await payload.create({
      collection: 'tools',
      context,
      data: {
        kind: 'hardware',
        name: part.name,
        partGroup: part.group,
        description: part.description,
        usedIn: linkProjects(part.usedIn),
        order: order++,
      },
    })
  }
  for (const software of placeholderBench.software) {
    await payload.create({
      collection: 'tools',
      context,
      data: {
        kind: 'software',
        name: software.name,
        softwareGroup: software.group,
        tag: software.tag,
        description: software.description,
        order: order++,
      },
    })
  }
  payload.logger.info(`Bench items: ${order}`)
}

async function seed() {
  const payload = await getPayload({ config })
  const projectIds = await seedProjects(payload)
  await seedPosts(payload)
  await seedBench(payload, projectIds)
  payload.logger.info('Seed finished.')
}

await seed()
process.exit(0)
