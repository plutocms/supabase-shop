// Upload rules for the product-media library. Pure functions, used by the
// upload route (server/api/product-media/new.post.ts) and the picker
// (UploadProductMedia.vue), so both apply the same rules. Unit-tested in
// test/product-media-upload.test.ts.
//
// The names carry a "product media" prefix on purpose. An app can extend
// this layer and @plutocms/supabase-storage together, and that layer
// auto-imports its own generic upload helpers.

/**
 * MIME types the `product-media` bucket accepts for the picker
 * (db/migrations/001_baseline.sql). Keep this list in step with the bucket.
 */
export const PRODUCT_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'model/gltf-binary',
] as const

/** The `file_size_limit` of the `product-media` bucket: 50 MB. */
export const PRODUCT_MEDIA_MAX_BYTES = 52_428_800

/** The `accept` value for the file picker. */
export const PRODUCT_MEDIA_ACCEPT = [...PRODUCT_MEDIA_MIME_TYPES.filter((type) => type.startsWith('image/')), '.glb'].join(',')

/**
 * The MIME type to store a file under. Browsers often send a `.glb` file as
 * `application/octet-stream`, and the bucket rejects that type. Only a
 * `.glb` name gets this fix: any other unknown file keeps its type, and the
 * allow list rejects it.
 */
export function productMediaMimeType(mimeType: string | undefined, fileName: string): string {
  const type = mimeType || 'application/octet-stream'
  if (type === 'application/octet-stream' && fileName.toLowerCase().endsWith('.glb')) {
    return 'model/gltf-binary'
  }
  return type
}

/**
 * Adds `-<suffix>` before the file extension: `chair.glb` → `chair-x7k2.glb`.
 * The upload route uses it to give a new file a free name, so an upload
 * never replaces an existing file.
 */
export function productMediaSuffixedName(fileName: string, suffix: string): string {
  const match = fileName.match(/^(.+)(\.[^./]+)$/)
  if (!match) {
    return `${fileName}-${suffix}`
  }
  return `${match[1]}-${suffix}${match[2]}`
}

/** Formats a byte count for people: "512 KB", "50 MB". */
function formatSize(bytes: number): string {
  const units = ['bytes', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  const rounded = unit === 0 || value >= 10 ? Math.round(value) : Math.round(value * 10) / 10
  return `${rounded} ${units[unit]}`
}

/** The size limit in words, for example "50 MB". */
export const PRODUCT_MEDIA_MAX_SIZE = formatSize(PRODUCT_MEDIA_MAX_BYTES)

export interface ProductMediaUploadProblem {
  /** 415 for a wrong type, 413 for a file that is too big. */
  statusCode: 413 | 415
  /** The reason, in words for the user. */
  message: string
}

/**
 * Explains why a file cannot go into the product-media library, or returns
 * `null` when the file passes. The route turns a problem into a 415 or 413
 * response. The picker shows the message before it sends the file.
 */
export function productMediaUploadProblem(file: { name: string, type?: string, size: number }): ProductMediaUploadProblem | null {
  const mimeType = productMediaMimeType(file.type, file.name)
  if (!(PRODUCT_MEDIA_MIME_TYPES as readonly string[]).includes(mimeType)) {
    return {
      statusCode: 415,
      message: `"${file.name}" is not a supported file type. Upload a JPEG, PNG, WebP, GIF, or AVIF image, or a .glb 3D model.`,
    }
  }
  if (file.size > PRODUCT_MEDIA_MAX_BYTES) {
    return {
      statusCode: 413,
      message: `"${file.name}" is ${formatSize(file.size)}. The limit is ${PRODUCT_MEDIA_MAX_SIZE}.`,
    }
  }
  return null
}
