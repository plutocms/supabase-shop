import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('products')
    .select('*, product_media(*), product_category(*), product_availability(*)')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusMessage: error.message })
  }

  const dataWithUrls = data?.map((product) => ({
    ...product,
    product_media: product.product_media?.map((item) => ({
      ...item,
      url: client.storage
        .from('product-media')
        .getPublicUrl(`uploads/${item.name}`).data.publicUrl,
    })),
  }))

  return { data: dataWithUrls }
})
