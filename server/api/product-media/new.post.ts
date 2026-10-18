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

  const fileName = fileNameToKebabCase(filePart.filename)

  const { data: mediaUploadData, error: mediaUploadError } =
    await client.storage
      .from('product-media')
      .upload(`uploads/${fileName}`, filePart.data, {
        contentType: productMediaMimeType(filePart.type, filePart.filename),
        upsert: true,
      })

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
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { mediaUploadData, data }
})
