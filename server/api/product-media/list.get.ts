import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client.from('product_media').select('*')

  if (error) {
    throw createError({
      message: 'error',
    })
  }

  const dataWithUrls = data?.map((item) => ({
    ...item,
    url: client.storage
      .from('product-media')
      .getPublicUrl(`uploads/${item.name}`).data.publicUrl,
  }))

  return { data: dataWithUrls }
})
