import { serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'

interface Payload {
  slug: string
  label: string
  description?: string | null
}

/** Matches `product_category`'s real columns (see db/migrations/001_baseline.sql): `slug` and `label` are required, `description` is optional. */
export const newCategoryPayloadSchema = z.object({
  slug: z.string().trim().min(1, 'A non-empty slug is required.'),
  label: z.string().trim().min(1, 'A non-empty label is required.'),
  description: z.string().nullish(),
})

export default defineEventHandler(async (event) => {
  await requireCapability(event, 'shop:manage_taxonomy')

  const client = await serverSupabaseClient<Database>(event)

  const body = await parseBody(event, newCategoryPayloadSchema)

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
