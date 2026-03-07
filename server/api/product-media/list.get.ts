import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client.from('product_media').select('*')

  if (error) {
    throw createError({
      message: 'error',
    })
  }

  return { data }
})
