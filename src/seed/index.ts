/**
 * Copies the placeholder content from the mockups into the CMS so you can edit
 * it at /addpost instead of starting from empty collections.
 *
 *   npm run seed
 *
 * Safe to run more than once: anything that already exists is left alone.
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import { placeholderBench, placeholderPosts, placeholderProjects } from '../content/placeholder'

const context = { disableRevalidate: true }

async function seed() {
  const payload = await getPayload({ config })
  const projectIds = new Map<string, number>()

  for (const [order, p] of placeholderProjects.entries()) {
    const existing = await payload.find({ collection: 'projects', where: { slug: { equals: p.slug } }, limit: 1 })
    if (existing.docs[0]) {
      projectIds.set(p.title, existing.docs[0].id)
      continue
    }
    const doc = await payload.create({
      collection: 'projects',
      context,
      data: {
        title: p.title,
        slug: p.slug,
        status: p.status,
        year: p.year,
        builders: p.builders,
        summary: p.summary,
        role: p.role,
        tools: p.tools,
        progress: p.progress ?? undefined,
        illustration: p.illustration,
        tint: p.tint,
        featured: p.featured,
        ctaLabel: p.ctaLabel,
        order,
      },
    })
    projectIds.set(p.title, doc.id)
    payload.logger.info(`Project: ${p.title}`)
  }

  for (const p of placeholderPosts) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: p.slug } },
      limit: 1,
      draft: true,
    })
    if (existing.docs[0]) continue
    await payload.create({
      collection: 'posts',
      context,
      data: {
        title: p.title,
        slug: p.slug,
        summary: p.summary,
        entryNumber: p.entryNumber,
        author: p.author,
        category: p.category,
        project: p.project ? projectIds.get(p.project.title) : undefined,
        publishedAt: new Date().toISOString(),
        _status: 'published',
      },
    })
    payload.logger.info(`Notebook entry: ${p.slug}`)
  }

  const { totalDocs: toolCount } = await payload.count({ collection: 'tools' })
  if (toolCount === 0) {
    let order = 0
    const relate = (titles: string[]) => titles.flatMap((t) => (projectIds.has(t) ? [projectIds.get(t)!] : []))
    for (const e of placeholderBench.equipment) {
      await payload.create({
        collection: 'tools',
        context,
        data: {
          kind: 'equipment',
          name: e.name,
          model: e.model,
          location: e.location,
          description: e.description,
          benchSpot: e.spot,
          usedIn: relate(e.usedIn),
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
          usedIn: relate(part.usedIn),
          order: order++,
        },
      })
    }
    for (const s of placeholderBench.software) {
      await payload.create({
        collection: 'tools',
        context,
        data: { kind: 'software', name: s.name, softwareGroup: s.group, tag: s.tag, description: s.description, order: order++ },
      })
    }
    payload.logger.info(`Bench items: ${order}`)
  }

  payload.logger.info('Seed finished.')
}

await seed()
process.exit(0)
