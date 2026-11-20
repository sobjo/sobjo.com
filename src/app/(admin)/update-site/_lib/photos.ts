/*
 * Shrinks a photo in the browser before it's sent: at most 1600 px on its long
 * side, saved as a JPEG. Phone photos go from several MB to a few hundred KB,
 * which keeps saves fast and the repo small.
 */

const MAX_SIDE = 1600
const QUALITY = 0.85

export interface PendingPhoto {
  /** Where it will live inside public/, like "uploads/projects/cheetah-lx3k.jpg". */
  path: string
  /** The JPEG, base64-encoded, as it will be committed. */
  data: string
  /** A data: URL of the same JPEG, so the editor can show it before the site redeploys. */
  preview: string
  width: number
  height: number
}

export async function shrinkPhoto(file: File, folder: 'projects' | 'notebook', name: string): Promise<PendingPhoto> {
  if (!file.type.startsWith('image/')) throw new Error('That file isn’t a picture.')
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const preview = canvas.toDataURL('image/jpeg', QUALITY)
  const stamp = Date.now().toString(36)
  return {
    path: `uploads/${folder}/${name || 'photo'}-${stamp}.jpg`,
    data: preview.slice(preview.indexOf(',') + 1),
    preview,
    width,
    height,
  }
}
