export function useProduct(
  productSlugOrId?: number | string | string[] | null
) {
  if (Array.isArray(productSlugOrId)) {
    productSlugOrId = productSlugOrId[0]
  }

  const {
    data: products,
    pending: _pendingProductList,
    refresh: _refreshProductList,
    execute: _getProductList,
  } = useFetch('/api/product/list', {
    key: 'products',
    transform: (res) => res.data,
    immediate: false,
  })

  const {
    data: product,
    pending: _pendingProduct,
    refresh: _refreshProduct,
    execute: _getProduct,
  } = useFetch(`/api/product/get/${productSlugOrId}`, {
    key: `product-${productSlugOrId}`,
    transform: (res) => res?.data,
    immediate: false,
  })

  if (!productSlugOrId) {
    _getProductList()
  }

  if (productSlugOrId) {
    _getProduct()
  }

  const pending = computed<boolean>(() => {
    if (productSlugOrId) {
      return _pendingProduct.value
    }

    return _pendingProductList.value
  })

  function refresh() {
    if (productSlugOrId) {
      _refreshProduct()
    }

    _refreshProductList()
  }

  return {
    products,
    product,
    refresh,
    pending,
  }
}
