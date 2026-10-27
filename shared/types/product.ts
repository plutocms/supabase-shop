import type { Database } from '#shared/types/supabase'

/** A category or an availability status in the public answer of a product. */
export type PublicProductTaxonomy = Pick<
  Database['public']['Tables']['product_category']['Row'],
  'id' | 'label' | 'slug'
>

/** One media file in the public answer of a product. */
export interface PublicProductMedia {
  id: number
  name: string
  alt: string | null
  url: string
  mime_type: string | null
}

/**
 * One product in the answer of `/api/pluto/v1/content/product`. The
 * `toPublic` hook of the layer adds `media` and turns `category` and
 * `availability` into objects.
 */
export interface PublicProduct {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  is_custom: boolean
  stock_quantity: number
  category: PublicProductTaxonomy | null
  availability: PublicProductTaxonomy | null
  media: PublicProductMedia[]
  createdAt?: string
}

export type ProductMedia = Database['public']['Tables']['product_media']['Row']

export type Product = Database['public']['Tables']['products']['Row']

/**
 * A `product_media` row, plus a client-only `is_saved` flag. The media
 * content field widget (`PlutoProductMediaField.vue`) and the media
 * reconciliation hook (`server/utils/reconcile-product-media.ts`) both use
 * this shape for the virtual `media` field's payload.
 */
export type MediaWithSaved = ProductMedia & {
  is_saved?: boolean
}
