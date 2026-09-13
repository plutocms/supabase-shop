import { productType } from '#shared/content/product'
import { reconcileProductMedia } from '../utils/reconcile-product-media'

/**
 * Registers the `product` content type with core's generic content
 * routes, at Nitro startup. The media reconciliation hooks are attached
 * here, server-side only, so `shared/content/product.ts` itself stays
 * free of server-only imports.
 */
export default defineNitroPlugin(() => {
  registerContentType({
    ...productType,
    hooks: {
      afterCreate: reconcileProductMedia,
      afterUpdate: reconcileProductMedia,
    },
  })
})
