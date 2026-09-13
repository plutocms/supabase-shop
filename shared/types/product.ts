import type { Database } from '#shared/types/supabase'

export interface ProductData {
  data: ProductItem[]
}

export interface ProductItem extends PartialProduct {
  product_media: ProductMedia[] | null
  product_availability: ProductAvailability | null
  product_category: ProductCategory | null
}

type ProductAvailability =
  Database['public']['Tables']['product_availability']['Row']
type ProductCategory = Database['public']['Tables']['product_category']['Row']

export type ProductMedia = Database['public']['Tables']['product_media']['Row']

export type Product = Database['public']['Tables']['products']['Row']
export type PartialProduct = Omit<Product, 'availability' | 'category'>

/**
 * A `product_media` row, plus a client-only `is_saved` flag. The media
 * content field widget (`PlutoProductMediaField.vue`) and the media
 * reconciliation hook (`server/utils/reconcile-product-media.ts`) both use
 * this shape for the virtual `media` field's payload.
 */
export type MediaWithSaved = ProductMedia & {
  is_saved?: boolean
}
