import { reconcileProductMedia } from '../utils/reconcile-product-media'

/**
 * Registers the `product` content type with core's generic content
 * routes, at Nitro startup. The media reconciliation hooks are attached
 * here, server-side only, so `shared/utils/content-product.ts` itself
 * stays free of server-only imports.
 *
 * `productType` is not explicitly imported — see the doc comment atop
 * `shared/utils/content-product.ts` for why an explicit
 * `#shared/content/product` import broke for any real consumer of this
 * layer, and why living under `shared/utils/` with no explicit import
 * fixes it.
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
