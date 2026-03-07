import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('products')
    .select(
      '*, product_media(*), product_categories(*), product_availability(*)'
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusMessage: error.message })
  }

  return { data }
})
