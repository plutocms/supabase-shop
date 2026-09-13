// The `product` content type. It maps onto the `products` table columns
// from `db/migrations/001_baseline.sql`: id, slug, name, description,
// price, created_at, category, is_custom, stock_quantity, availability.
// See the content-model skill in `@plutocms/pluto` for the full
// field/status/timestamp contract.
//
// `defineContentType` and the field types come from `@plutocms/pluto`'s
// `shared/utils`/`shared/types`, auto-imported the same way every other
// shared/utils export is across this layer (see `postType` in
// `supabase-blog/shared/content/post.ts` for the same pattern). This file
// needs no explicit import for them, and no server-only imports either —
// the media reconciliation hook lives in `server/utils/reconcile-product-media.ts`
// and is attached in `server/plugins/content.ts`, not here.
//
// `media` carries no storage column of its own — `product_media` is a
// separate table, reconciled by the hook above — so it is `virtual: true`.
// It still passes through the generic form payload, which is how the hook
// reads it from `rawBody.media` (see the shop-products skill).
//
// `basePath`/`newPath`/`editPath` point the generic list and form UI at
// this layer's existing, already-deployed admin URLs
// (`/admin/products`, `/admin/product/new`, `/admin/product/edit/:id`)
// instead of the `/admin/content/product` convention `autoRoutes` would
// otherwise imply. `autoRoutes: false` keeps this content type from
// generating its own nav/pages entries — `app/plugins/pluto-extension.ts`
// already declares them by hand, at these same URLs.
export const productType = defineContentType({
  name: 'product',
  label: 'Product',
  labelPlural: 'Products',
  icon: 'lucide:box',
  source: 'products',
  titleField: 'name',
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true, inList: true, region: 'main', order: 10 },
    { name: 'media', type: 'media', label: 'Media', multiple: true, virtual: true, widget: 'product-media', region: 'main', order: 20 },
    { name: 'description', type: 'textarea', label: 'Description', region: 'main', order: 30 },
    { name: 'slug', type: 'slug', label: 'Slug', from: 'name', preview: '/product/', required: true, inList: true, region: 'side', order: 40 },
    { name: 'price', type: 'number', label: 'Price', required: true, integer: true, min: 0, inList: true, widget: 'product-price', region: 'side', order: 50 },
    { name: 'is_custom', type: 'boolean', label: 'Is custom', widget: 'product-is-custom', region: 'side', order: 60 },
    { name: 'availability', type: 'reference', label: 'Availability', optionsUrl: '/api/product/availability-statuses', labelKey: 'label', valueKey: 'id', widget: 'product-availability', region: 'side', order: 70 },
    { name: 'stock_quantity', type: 'number', label: 'Stock quantity', min: 0, widget: 'product-stock', region: 'side', order: 80 },
    { name: 'category', type: 'reference', label: 'Category', optionsUrl: '/api/category/list', labelKey: 'label', valueKey: 'id', widget: 'product-category', region: 'side', order: 90 },
  ],
  slug: { field: 'slug' },
  status: false,
  timestamps: { created: 'created_at', updated: false },
  capabilities: { write: 'products:manage', delete: 'products:delete' },
  autoRoutes: false,
  basePath: '/admin/products',
  newPath: '/admin/product/new',
  editPath: (id) => `/admin/product/edit/${id}`,
})
