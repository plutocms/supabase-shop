export interface ProductData {
  data: ProductItem[]
}

export interface ProductItem extends PartialProduct {
  media: Media[]
  availability: Availability
  category: Category
}

type Availability = Database['public']['Tables']['availability']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export type Media = Database['public']['Tables']['media']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type PartialProduct = Omit<Product, 'availability' | 'category'>

type MediaWithSaved = Media & {
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
