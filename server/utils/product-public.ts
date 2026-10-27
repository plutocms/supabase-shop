import type { H3Event } from 'h3'
import type { PublicProductMedia, PublicProductTaxonomy } from '../../shared/types/product'
import { serverSupabaseClient } from '#supabase/server'

/**
 * The public answer of the `product` type. `productToPublic` is the
 * `hooks.toPublic` of the type. It adds the media, the category and the
 * availability to each product.
 *
 * The related rows load once for the whole answer: three queries, one per
 * relation, with `.in(...)`. A list of 20 products and a list of 1 product
 * make the same number of queries. The result stays on `event.context`, so
 * the next product of the same answer reuses it.
 */

/** The key on `event.context` that holds the related rows of one answer. */
export const PRODUCT_RELATIONS_KEY = 'shopProductRelations'

interface ProductRelations {
  media: Map<number, PublicProductMedia[]>
  categories: Map<number, PublicProductTaxonomy>
  availability: Map<number, PublicProductTaxonomy>
}

/** The unique, valid ids that `pick` reads from the items. */
function uniqueIds(items: PlutoContentItem[], pick: (item: PlutoContentItem) => unknown): number[] {
  const ids = new Set<number>()
  for (const item of items) {
    const value = pick(item)
    if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
      ids.add(Number(value))
    }
  }
  return [...ids]
}

function relationError(message: string) {
  console.error('[shop] could not load the related rows of the products:', message)
  return createPlutoError({
    statusCode: 500,
    message: 'Could not load the products.',
    key: 'supabase-shop.errors.productsLoadFailed',
  })
}

async function fetchRelations(event: H3Event, batch: PlutoContentItem[]): Promise<ProductRelations> {
  const client = await serverSupabaseClient<Database>(event)
  const productIds = uniqueIds(batch, (item) => item.id)
  const categoryIds = uniqueIds(batch, (item) => item.category)
  const availabilityIds = uniqueIds(batch, (item) => item.availability)

  const [media, categories, availability] = await Promise.all([
    productIds.length > 0
      ? client
          .from('product_media')
          .select('id, name, alt, mime_type, product_id')
          .in('product_id', productIds)
          .order('id', { ascending: true })
      : { data: [], error: null },
    categoryIds.length > 0
      ? client.from('product_category').select('id, label, slug').in('id', categoryIds)
      : { data: [], error: null },
    availabilityIds.length > 0
      ? client.from('product_availability').select('id, label, slug').in('id', availabilityIds)
      : { data: [], error: null },
  ])

  const failure = media.error ?? categories.error ?? availability.error
  if (failure) {
    throw relationError(failure.message)
  }

  const result: ProductRelations = {
    media: new Map(),
    categories: new Map(),
    availability: new Map(),
  }

  for (const row of media.data ?? []) {
    if (row.product_id === null || !row.name) {
      continue
    }
    const list = result.media.get(row.product_id) ?? []
    list.push({
      id: row.id,
      name: row.name,
      alt: row.alt,
      url: productMediaUrl(client, row.name),
      mime_type: row.mime_type,
    })
    result.media.set(row.product_id, list)
  }
  for (const row of categories.data ?? []) {
    result.categories.set(row.id, { id: row.id, label: row.label, slug: row.slug })
  }
  for (const row of availability.data ?? []) {
    result.availability.set(row.id, { id: row.id, label: row.label, slug: row.slug })
  }

  return result
}

/** The related rows of one answer. The first call loads them, the next calls reuse them. */
export function loadProductRelations(event: H3Event, batch: PlutoContentItem[]): Promise<ProductRelations> {
  const cached = event.context[PRODUCT_RELATIONS_KEY] as Promise<ProductRelations> | undefined
  if (cached) {
    return cached
  }
  const pending = fetchRelations(event, batch)
  event.context[PRODUCT_RELATIONS_KEY] = pending
  return pending
}

/**
 * `hooks.toPublic` of the `product` type. `category` and `availability`
 * change from an id to an object (`null` when the product has none).
 * `media` is a new key, with the files in their order.
 */
export const productToPublic: PlutoContentToPublic = async (ctx, data, info) => {
  const relations = await loadProductRelations(ctx.event, info.batch)

  return {
    ...data,
    category: relations.categories.get(Number(data.category)) ?? null,
    availability: relations.availability.get(Number(data.availability)) ?? null,
    media: relations.media.get(Number(data.id)) ?? [],
  }
}
