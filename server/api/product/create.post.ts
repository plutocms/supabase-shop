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

  const mediaPayload: Database['public']['Tables']['product_media']['Insert'][] =
    body.media.map(({ id: _id, ...media }) => ({
      ...media,
      product_id: data.id,
    }))

  const { error: mediaError } = await client
    .from('product_media')
    .upsert(mediaPayload, { onConflict: 'id' })
    .select()

  if (mediaError) {
    throw createError({ statusMessage: mediaError.message })
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
