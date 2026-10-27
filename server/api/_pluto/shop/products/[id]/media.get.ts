import { serverSupabaseClient } from '#supabase/server'

/** The media of one product, in the order of the gallery, with the public URL of each file. */
export default defineEventHandler(async (event) => {
  const id = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)

  if (Number.isNaN(id)) {
    throw createPlutoError({
      statusCode: 404,
      message: 'Product not found',
      key: 'supabase-shop.errors.productNotFound',
    })
  }

  const client = await serverSupabaseClient<Database>(event)

  const { data: product, error: productError } = await client
    .from('products')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (productError) {
    throw createPlutoError({
      statusCode: 500,
      message: 'error',
      key: 'supabase-shop.errors.mediaListFailed',
    })
  }

  if (!product) {
    throw createPlutoError({
      statusCode: 404,
      message: 'Product not found',
      key: 'supabase-shop.errors.productNotFound',
    })
  }

  const { data, error } = await client
    .from('product_media')
    .select('*')
    .eq('product_id', id)
    .order('id', { ascending: true })

  if (error) {
    throw createPlutoError({
      statusCode: 500,
      message: 'error',
      key: 'supabase-shop.errors.mediaListFailed',
    })
  }

  return {
    data: data.map((item) => ({
      ...item,
      url: productMediaUrl(client, item.name),
    })),
  }
})
