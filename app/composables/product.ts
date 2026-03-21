export function useProduct(
  productSlugOrId?: number | string | string[] | null
) {
  if (Array.isArray(productSlugOrId)) {
    productSlugOrId = productSlugOrId[0]
  }

  const listFetch = useFetch('/api/product/list', {
    key: 'products',
    transform: (res) => res.data,
    immediate: !productSlugOrId,
    server: !productSlugOrId,
  })

  const productFetch = useFetch(`/api/product/get/${productSlugOrId}`, {
    key: `product-${productSlugOrId}`,
    transform: (res) => res?.data,
    immediate: !!productSlugOrId,
    server: !!productSlugOrId,
  })

  const pending = computed<boolean>(() => {
    if (productSlugOrId) {
      return productFetch.pending.value
    }

    return listFetch.pending.value
  })

  function refresh() {
    if (productSlugOrId) {
      productFetch.refresh()
    }

    listFetch.refresh()
  }

  const activeFetch = productSlugOrId ? productFetch : listFetch

  interface UseProductResultBase {
    products: typeof listFetch.data
    product: typeof productFetch.data
    refresh: () => void
    pending: typeof pending
  }

  type UseProductResult = UseProductResultBase & {
    then: (
      onFulfilled?: ((value: UseProductResultBase) => unknown) | null,
      onRejected?: ((reason: unknown) => unknown) | null
    ) => Promise<unknown>
  }

  const result: UseProductResult = {
    products: listFetch.data,
    product: productFetch.data,
    refresh,
    pending,
    then(onFulfilled, onRejected) {
      return activeFetch.then(() => {
        const { then: _then, ...base } = result
        return onFulfilled?.(base)
      }, onRejected)
    },
  }

  return result
}
