import { serverSupabaseClient } from '#supabase/server'

interface Payload {
  slug: string
  label: string
  description?: string | null
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const client = await serverSupabaseClient<Database>(event)

  const body = await readBody<Partial<Payload>>(event)

  if (typeof body?.slug !== 'string' || body.slug.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A non-empty slug is required.',
    })
  }

  if (typeof body?.label !== 'string' || body.label.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A non-empty label is required.',
    })
  }

  const payload: Payload = {
    slug: body.slug,
    label: body.label,
    description: body.description ?? null,
  }

  const { data, error } = await client
    .from('product_category')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw createError({
      message: error.message,
    })
  }

  if (error) {
    throw createError({ message: 'error' })
  }

  return { data }
})
