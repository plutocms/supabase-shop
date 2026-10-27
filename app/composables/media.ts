export function useProductMedia() {
  const {
    data: mediaList,
    refresh: refreshMediaList,
    status: mediaStatus,
  } = useFetch('/api/_pluto/shop/product-media', {
    key: '/api/_pluto/shop/product-media',
  })

  return { mediaList, refreshMediaList, mediaStatus }
}
