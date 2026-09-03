import type { ProductMedia } from '../shared/types/product'
import type { Database } from '../shared/types/supabase'
import { describe, expectTypeOf, it } from 'vitest'

// Guards the schema drift that broke this repo's typecheck: ProductMedia
// used to be re-declared locally in UploadProductMedia.vue as the bare
// product_media Row, silently diverging from shared/types/product.ts's
// version and losing the url column product_media actually has in the
// database (unlike supabase-storage's media table, which computes url
// server-side instead of storing it).
describe('productMedia shape', () => {
  it('includes the persisted url column', () => {
    expectTypeOf<ProductMedia>().toHaveProperty('url').toEqualTypeOf<string | null>()
  })

  it('matches the raw product_media Row exactly (no hand-added fields)', () => {
    expectTypeOf<ProductMedia>().toEqualTypeOf<
      Database['public']['Tables']['product_media']['Row']
    >()
  })
})
