export interface ProductData {
  data: ProductItem[]
}

export interface ProductItem extends PartialProduct {
  product_media: ProductMedia[]
  product_availability: ProductAvailability
  product_categories: ProductCategory
}

type ProductAvailability =
  Database['public']['Tables']['product_availability']['Row']
type ProductCategory = Database['public']['Tables']['product_categories']['Row']

export type ProductMedia = Database['public']['Tables']['product_media']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type PartialProduct = Omit<Product, 'availability' | 'category'>

type MediaWithSaved = ProductMedia & {
  is_saved?: boolean
}

export interface FormProduct extends Omit<
  Product,
  'id' | 'created_at' | 'category' | 'availability'
> {
  media: MediaWithSaved[]
  category: number | null
  availability: number | null
}
