export async function useProductAvailability() {
  type ProductAvailabilityStatus =
    Database['public']['Tables']['product_availability']['Row']
  interface ProductAvailabilityStatusData {
    data: ProductAvailabilityStatus[]
  }

  const status = ref<ProductAvailabilityStatusData['data'] | null>(null)

  const availabilityStatusData = await $fetch<ProductAvailabilityStatusData>(
    '/api/product/availability-statuses'
  )

  status.value = availabilityStatusData.data || null

  return { status }
}
