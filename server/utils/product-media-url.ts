/** The Storage bucket of the product media files. */
export const PRODUCT_MEDIA_BUCKET = 'product-media'

/** The part of a Supabase client that the media URL needs. */
interface StorageClient {
  storage: {
    from: (bucket: string) => {
      getPublicUrl: (path: string) => { data: { publicUrl: string } }
    }
  }
}

/** The public URL of a media file in the `product-media` bucket. */
export function productMediaUrl(client: StorageClient, name: string): string {
  return client.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .getPublicUrl(`uploads/${name}`)
    .data
    .publicUrl
}
