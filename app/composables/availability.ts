export async function useProductAvailability() {
  type AvailabilityStatus = Database['public']['Tables']['availability']['Row']
  interface AvailabilityStatusData {
    data: AvailabilityStatus[]
  }

  const status = ref<AvailabilityStatusData['data'] | null>(null)

  const availabilityStatusData = await $fetch<AvailabilityStatusData>(
    '/api/product/availability-statuses'
  )

  status.value = availabilityStatusData.data || null

  return { status }
}
