import { serverSupabaseClient } from '#supabase/server'

type FormBody = Database['public']['Tables']['products']['Insert'] & {
  media: ProductMedia[]
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const body = await readBody<FormBody>(event)

  if (!body) {
    throw createError({ statusMessage: 'No payload sent.' })
  }

  const { media: _, ...bodyWithoutMedia } = body

  const payload: Omit<FormBody, 'media'> = {
    ...bodyWithoutMedia,
    created_at: new Date().toISOString(),
    availability: bodyWithoutMedia.availability || null,
    category: bodyWithoutMedia.category || null,
  }

  const { data, error } = await client
    .from('products')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw createError({ statusMessage: error.message })
  }

  const mediaWithProductId = body.media.map((media) => ({
    ...media,
    product_id: data.id,
  }))

  const existingMedia = mediaWithProductId.filter((m) => m.id)
  const newMedia = mediaWithProductId.filter((m) => !m.id)

  // Update product_id on media that was already uploaded/inserted
  for (const media of existingMedia) {
    const { id, ...mediaUpdate } = media
    const { error: updateError } = await client
      .from('product_media')
      .update(mediaUpdate)
      .eq('id', id)

    if (updateError) {
      throw createError({ statusMessage: updateError.message })
    }
  }

  // Insert truly new media (no id yet)
  if (newMedia.length > 0) {
    const newMediaPayload: Database['public']['Tables']['product_media']['Insert'][] =
      newMedia.map(({ id: _id, ...media }) => media)

    const { error: mediaError } = await client
      .from('product_media')
      .insert(newMediaPayload)
      .select()

    if (mediaError) {
      throw createError({ statusMessage: mediaError.message })
    }
  }

  return {
    message: 'Product created successfully',
    statusCode: 200,
    data: {
      id: data.id,
      ...body,
    },
  }
})
