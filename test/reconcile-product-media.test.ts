import type { MediaWithSaved } from '../shared/types/product'
import { describe, expect, it, vi } from 'vitest'

// reconcile-product-media.ts imports `serverSupabaseClient` from
// '#supabase/server', a virtual module Nitro only resolves inside a real
// Nuxt build. Stubbed here so the module can load under plain
// `vitest run`, matching the pattern @plutocms/supabase's own
// test/content-adapter-helpers.test.ts uses for the same import. This
// test never calls the stub — it only exercises the pure partition
// helper, which does no I/O of its own.
vi.mock('#supabase/server', () => ({ serverSupabaseClient: vi.fn() }))

const { partitionProductMedia } = await import('../server/utils/reconcile-product-media')

/**
 * Builds a minimal MediaWithSaved fixture, overridden per test. Returns
 * `Partial<MediaWithSaved>` cast at each call site's usage, not
 * `MediaWithSaved` itself — a "brand-new, not yet saved" fixture has no
 * `id` at all, which the real (database-backed) type does not allow.
 */
function makeMedia(overrides: Partial<MediaWithSaved> = {}): MediaWithSaved {
  return {
    id: 1,
    created_at: '2026-01-01T00:00:00.000Z',
    name: 'photo.jpg',
    alt: null,
    url: 'https://example.com/photo.jpg',
    storage_path: 'uploads/photo.jpg',
    mime_type: 'image/jpeg',
    size: 1024,
    product_id: null,
    ...overrides,
  } as MediaWithSaved
}

/** A fixture with no `id` at all — a media item not yet saved to storage. */
function makeFreshMedia(overrides: Partial<MediaWithSaved> = {}): MediaWithSaved {
  const { id: _id, ...rest } = makeMedia(overrides)
  return rest as MediaWithSaved
}

describe('partitionProductMedia', () => {
  it('groups an item with no id as fresh', () => {
    const item = makeFreshMedia()
    const result = partitionProductMedia([item], new Map(), 10)

    expect(result.fresh).toEqual([item])
    expect(result.noop).toEqual([])
    expect(result.attach).toEqual([])
    expect(result.clone).toEqual([])
  })

  it('groups an item already owned by this product as a no-op', () => {
    const item = makeMedia({ id: 1 })
    const result = partitionProductMedia([item], new Map([[1, 10]]), 10)

    expect(result.noop).toEqual([item])
    expect(result.attach).toEqual([])
    expect(result.clone).toEqual([])
    expect(result.fresh).toEqual([])
  })

  it('groups an item owned by nobody as attach', () => {
    const item = makeMedia({ id: 1 })
    const result = partitionProductMedia([item], new Map([[1, null]]), 10)

    expect(result.attach).toEqual([item])
  })

  it('groups an item missing from the owner map as attach, same as a null owner', () => {
    const item = makeMedia({ id: 1 })
    const result = partitionProductMedia([item], new Map(), 10)

    expect(result.attach).toEqual([item])
  })

  it('groups an item owned by a different product as clone, never stealing it', () => {
    const item = makeMedia({ id: 1 })
    const result = partitionProductMedia([item], new Map([[1, 99]]), 10)

    expect(result.clone).toEqual([item])
    expect(result.attach).toEqual([])
    expect(result.noop).toEqual([])
  })

  it('partitions a mixed batch in one pass', () => {
    const noopItem = makeMedia({ id: 1 })
    const attachItem = makeMedia({ id: 2 })
    const cloneItem = makeMedia({ id: 3 })
    const freshItem = makeFreshMedia()

    const ownerMap = new Map([
      [1, 10],
      [2, null],
      [3, 77],
    ])

    const result = partitionProductMedia([noopItem, attachItem, cloneItem, freshItem], ownerMap, 10)

    expect(result.noop).toEqual([noopItem])
    expect(result.attach).toEqual([attachItem])
    expect(result.clone).toEqual([cloneItem])
    expect(result.fresh).toEqual([freshItem])
  })
})
