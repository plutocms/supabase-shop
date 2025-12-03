export async function useAvailabilityStatus() {
  type AvailabilityStatus = Database['public']['Tables']['availability']['Row']
  interface AvailabilityStatusData {
    data: AvailabilityStatus[]
  }

  const availabilityStatus = ref<AvailabilityStatusData['data'] | null>(null)

  const availabilityStatusData = await $fetch<AvailabilityStatusData>(
    '/api/product/availability-statuses'
  )

  availabilityStatus.value = availabilityStatusData.data || null

  return { availabilityStatus }
}
