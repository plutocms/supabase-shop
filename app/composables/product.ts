export function useProduct(productId?: number | null | undefined) {
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
    refresh: refreshProduct,
    execute: _getProduct,
  } = useFetch(`/api/product/get/${productId}`, {
    key: `product-${productId}`,
    transform: (res) => res?.data,
    immediate: false,
  })

  if (!productId) {
    _getProductList()
  }

  if (productId) {
    _getProduct()
  }

  const pending = computed<boolean>(() => {
    if (productId) {
      return _pendingProduct.value
    }

    return _pendingProductList.value
  })

  function refresh() {
    if (productId) {
      refreshProduct()
    } else {
      _refreshProductList()
    }
  }

  return {
    products,
    product,
    refresh,
    pending,
  }
}
