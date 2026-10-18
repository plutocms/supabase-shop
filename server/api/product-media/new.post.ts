import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireCapability(event, 'products:manage')

  const client = await serverSupabaseClient<Database>(event)

  const formData = await readMultipartFormData(event)

  // Find the parts by role, not by position.
  const filePart = formData?.find((part) => part.filename)
  const altPart = formData?.find((part) => part.name === 'alt')

  if (!filePart?.filename) {
    throw createError({ statusCode: 400, statusMessage: 'No file sent.' })
  }

  // Check the type and size before the file touches storage. The bucket
  // has the same limits, but its errors do not tell the user what to do.
  const problem = productMediaUploadProblem({
    name: filePart.filename,
    type: filePart.type,
    size: filePart.data.length,
  })

  if (problem) {
    throw createError({
      statusCode: problem.statusCode,
      statusMessage: problem.message,
    })
  }

  const contentType = productMediaMimeType(filePart.type, filePart.filename)
  const upload = (name: string) =>
    client.storage
      .from('product-media')
      .upload(`uploads/${name}`, filePart.data, { contentType, upsert: false })

  // Never replace an existing file: other product_media rows can point to
  // it by name. On a name clash, retry once with a short random suffix.
  let fileName = fileNameToKebabCase(filePart.filename)
  let { data: mediaUploadData, error: mediaUploadError } = await upload(fileName)

  if (mediaUploadError && isStorageCollision(mediaUploadError)) {
    fileName = productMediaSuffixedName(fileName, Math.random().toString(36).slice(2, 6))
    ;({ data: mediaUploadData, error: mediaUploadError } = await upload(fileName))
  }

  if (mediaUploadError) {
    throw createError({
      statusCode: 500,
      statusMessage: mediaUploadError.message,
    })
  }

  const { data, error } = await client
    .from('product_media')
    .insert({
      name: fileName,
      alt: altPart?.data.toString('utf-8'),
    })
    .select()
    .single()

  if (error) {
    // The file uploaded, but the row failed. Remove the file, so a retry
    // does not leave an orphan. A cleanup failure must not hide the real
    // error.
    const { error: cleanupError } = await client.storage
      .from('product-media')
      .remove([`uploads/${fileName}`])
    if (cleanupError) {
      console.warn('[product-media] could not remove the orphaned file', fileName, cleanupError.message)
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { mediaUploadData, data }
})

/** True when a Storage upload error means "an object already exists at this path". */
function isStorageCollision(error: { statusCode?: string | number, message?: string }): boolean {
  return String(error.statusCode) === '409' || Boolean(error.message?.toLowerCase().includes('already exists'))
}
