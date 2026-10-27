import { serverSupabaseClient } from '#supabase/server'

/** The shared media library, with the public URL of each file. */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client.from('product_media').select('*')

  if (error) {
    throw createPlutoError({
      statusCode: 500,
      message: 'error',
      key: 'supabase-shop.errors.mediaListFailed',
    })
  }

  const dataWithUrls = data?.map((item) => ({
    ...item,
    url: productMediaUrl(client, item.name),
  }))

  return { data: dataWithUrls }
})
