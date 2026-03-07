export function useMedia() {
  const config = useRuntimeConfig()

  const {
    data: mediaList,
    refresh: refreshMediaList,
    status: mediaStatus,
  } = useFetch('/api/product-media/list', {
    key: '/api/product-media/list',
  })

  function getMediaUrl(fileName: string | null | undefined): string {
    if (!fileName) {
      return ''
    }

    return `${config.public.supabase.url}/storage/v1/object/public/product-media/uploads/${fileName}`
  }

  return { mediaList, refreshMediaList, mediaStatus, getMediaUrl }
}
