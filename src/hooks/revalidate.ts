import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

function revalidateSite(context: Record<string, unknown>) {
  if (context.disableRevalidate) return
  try {
    // Every page reads from the CMS, so refresh them all. The site is small enough for this.
    revalidatePath('/', 'layout')
  } catch {
    // Outside a Next.js request (for example the seed script) there is nothing to revalidate.
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, context }) => {
  revalidateSite(context)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  revalidateSite(context)
  return doc
}
