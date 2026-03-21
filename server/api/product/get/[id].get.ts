import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const params = event.context.params
  const client = await serverSupabaseClient<Database>(event)

  if (params) {
    const lookup = params.id
    const id = Number.parseInt(lookup as string, 10)
    const isId = !Number.isNaN(id)

    const { data, error } = await client
      .from('products')
      .select(
        '*, product_media(*), product_category(*), product_availability(*)'
      )
      .eq(isId ? 'id' : 'slug', isId ? id : (lookup as string))
      .limit(1)
      .single()

    if (error) {
      throw createError({ statusMessage: error.message })
    }

    const dataWithUrls = {
      ...data,
      product_media: data.product_media?.map((item) => ({
        ...item,
        url: client.storage
          .from('product-media')
          .getPublicUrl(`uploads/${item.name}`).data.publicUrl,
      })),
    }

    return { data: dataWithUrls }
  }
})
