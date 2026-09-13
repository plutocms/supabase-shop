import { serverSupabaseClient } from '#supabase/server'

/** The virtual `media` field's payload shape, sent by `PlutoProductMediaField.vue`. */
export interface ProductMediaPayload {
  items: MediaWithSaved[]
  removedIds: number[]
}

/** One partitioned batch of product_media rows, grouped by the write each needs. */
export interface ProductMediaPartition {
  /** Already owned by this product. No write needed. */
  noop: MediaWithSaved[]
  /** Owned by nobody (or the row could not be found). Attach with an update. */
  attach: MediaWithSaved[]
  /** Owned by a different product. Clone into a new row for this product. */
  clone: MediaWithSaved[]
  /** No `id` yet. Insert as a brand-new row. */
  fresh: MediaWithSaved[]
}

/**
 * Splits a virtual `media` field's `items` into the four groups
 * `reconcileProductMedia` writes differently. Pure — no I/O — so it can be
 * unit-tested on its own (see `test/reconcile-product-media.test.ts`).
 *
 * `product_media` is a shared, reusable media library, not exclusive to one
 * product: an item already owned by another product is always **cloned**
 * for this product, never stolen from the product that owns it.
 *
 * `ownerMap` holds the current `product_id` for every item that has an
 * `id`, keyed by that `id`. An id missing from `ownerMap` (the row could
 * not be found) is treated the same as a null owner: safe to attach.
 */
export function partitionProductMedia(
  items: MediaWithSaved[],
  ownerMap: Map<number, number | null>,
  productId: number
): ProductMediaPartition {
  const partition: ProductMediaPartition = { noop: [], attach: [], clone: [], fresh: [] }

  for (const item of items) {
    if (!item.id) {
      partition.fresh.push(item)
      continue
    }

    const owner = ownerMap.get(item.id) ?? null

    if (owner === productId) {
      partition.noop.push(item)
    } else if (owner === null) {
      partition.attach.push(item)
    } else {
      partition.clone.push(item)
    }
  }

  return partition
}

/** Strips the columns a clone or a brand-new insert must never carry over: the old row's own id, the client-only `is_saved` flag, and its old creation time. */
function toInsertRow(item: MediaWithSaved, productId: number): Database['public']['Tables']['product_media']['Insert'] {
  const { id: _id, is_saved: _isSaved, created_at: _createdAt, ...rest } = item

  return { ...rest, product_id: productId }
}

/**
 * `afterCreate`/`afterUpdate` hook for the `product` content type.
 * Reconciles `rawBody.media` (the virtual `media` field's payload) into
 * `product_media` rows. Batched throughout — one query per group, never a
 * per-item loop. See `.claude/skills/shop-products/SKILL.md` for the full
 * write-up of the reconciliation rules.
 *
 * Runs as the calling user (`serverSupabaseClient`), so `product_media`'s
 * own RLS policies still apply. Never swallows a Postgres error: a failed
 * reconciliation fails the whole write, per the content-model skill's
 * documented hook contract.
 */
export async function reconcileProductMedia(
  ctx: PlutoContentContext,
  item: PlutoContentItem,
  rawBody: Record<string, unknown>
): Promise<void> {
  const media = rawBody.media as ProductMediaPayload | undefined

  if (!media) {
    return
  }

  const client = await serverSupabaseClient<Database>(ctx.event)
  const productId = Number(item.id)

  if (media.removedIds.length > 0) {
    const { error } = await client
      .from('product_media')
      .update({ product_id: null })
      .in('id', media.removedIds)

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
  }

  const existing = media.items.filter((entry): entry is MediaWithSaved & { id: number } => Boolean(entry.id))

  const ownerMap = new Map<number, number | null>()

  if (existing.length > 0) {
    const { data, error } = await client
      .from('product_media')
      .select('id, product_id')
      .in(
        'id',
        existing.map((entry) => entry.id)
      )

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    for (const row of data ?? []) {
      ownerMap.set(row.id, row.product_id)
    }
  }

  const { attach, clone, fresh } = partitionProductMedia(media.items, ownerMap, productId)

  if (attach.length > 0) {
    const { error } = await client
      .from('product_media')
      .update({ product_id: productId })
      .in(
        'id',
        attach.map((entry) => entry.id as number)
      )

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
  }

  const toInsert = [...clone, ...fresh].map((entry) => toInsertRow(entry, productId))

  if (toInsert.length > 0) {
    const { error } = await client.from('product_media').insert(toInsert)

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
  }
}
