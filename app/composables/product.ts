export async function useProduct(productId?: number | null | undefined) {
  const list = ref<ProductData | null>(null)
  const pending = ref(false)

  if (!productId) {
    pending.value = true

    const productsData = await $fetch<ProductData>(`/api/product/list`)

    pending.value = false

    list.value = productsData || null
  }

  const product = ref<ProductItem | null>(null)

  if (productId) {
    const productData = await $fetch<{ data: ProductItem | null }>(
      `/api/product/get/${productId}`
    )

    product.value = productData.data || null
  }

  function refresh() {
    return useProduct(productId)
  }

  return { list, product, refresh, pending }
}
