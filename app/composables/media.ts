export function useProductMedia() {
  const {
    data: mediaList,
    refresh: refreshMediaList,
    status: mediaStatus,
  } = useFetch('/api/product-media/list', {
    key: '/api/product-media/list',
  })

  return { mediaList, refreshMediaList, mediaStatus }
}
