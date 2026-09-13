---
name: shop-products
description: Product admin (create, edit, list, delete) built on @plutocms/pluto's content model, with a media gallery and the is-custom/availability/stock cross-field rule.
---

# Shop products

This skill covers the product feature in the `supabase-shop` layer. It lets an admin create,
edit, list, and delete products. A product has a name, a description, a price, a media gallery,
a category, and an availability status.

## The `products` table

The table is defined in this layer's `db/migrations/` directory. It has these columns:

- `id` — bigint. The primary key. The database generates it.
- `slug` — text. Unique. It forms the public product path, `/product/<slug>`.
- `name` — text. Required.
- `description` — text. Optional.
- `price` — bigint. Required. Stored as a whole number, in the smallest currency unit.
- `created_at` — timestamptz. The database sets it when a row is created. There is no
  `updated_at` column.
- `category` — bigint. A foreign key to `product_category`. Null when uncategorized.
- `is_custom` — boolean. Default false. True for a made-to-order (commission) product.
- `stock_quantity` — numeric. Default 0. Meaningful only when `availability` is "in stock".
- `availability` — bigint. A foreign key to `product_availability`.

Row Level Security gates `products` writes on two capabilities (see
`db/migrations/003_capability_policies.sql`): `products:manage` (insert, update) and
`products:delete` (delete). Reading a product needs no capability — the public storefront reads
every product.

## The `product_media` table

Each row is one media file: an image, or a `.glb` 3D model. Columns: `id`, `created_at`, `name`,
`alt`, `url`, `storage_path`, `mime_type`, `size`, and `product_id` (nullable, `ON DELETE
CASCADE`).

**`product_media` is a shared, reusable library, not exclusive to one product.** A row with a
null `product_id` is an unattached library item, pickable by any product through the media
gallery's "Gallery" tab. This is why the reconciliation hook below always **clones** a media row
already attached to a different product, and never "steals" it by reassigning `product_id` —
stealing would silently break whichever other product was using that file.

RLS gates every write on `products:manage`, the same capability as `products` itself. Reading
needs no capability.

## The admin UI: the `product` content type

`/admin/products`, `/admin/product/new`, and `/admin/product/edit/:id` run
`@plutocms/pluto`'s generic content-model admin UI, against one content type declared in
`shared/content/product.ts`:

- `app/pages/admin/products.vue` renders `<PlutoContentList type="product" />`.
- `app/pages/admin/product/new.vue` renders `<PlutoContentForm type="product" />`.
- `app/pages/admin/product/edit/[id].vue` renders `<PlutoContentForm type="product" :id="..." />`.

`shared/content/product.ts` declares every field, sets `status: false` (products have no
publish workflow) and `timestamps: { created: 'created_at', updated: false }` (no
`updated_at` column), and declares `capabilities.write`/`capabilities.delete` but no
`capabilities.read` — matching the RLS rule above, and the content-model skill's rule that a
content type with no declared capability for an operation leaves that operation open. It sets
`autoRoutes: false` and explicit `basePath`/`newPath`/`editPath` values, so the URLs above never
changed.

See `@plutocms/pluto`'s content-model skill for what every field on a content type means, and
`@plutocms/supabase`'s content-adapter skill for how a content type maps onto a real table.

### The old hand-written admin UI

`app/components/Post.vue` (a leftover name from forking the blog layer — it was always the
product form, never a post) and the three hand-written write routes it called
(`POST /api/product/create`, `POST /api/product/edit/:id`, `DELETE /api/product/delete/:id`) are
gone. `app/composables/availability.ts` (`useProductAvailability`), only ever called by
`Post.vue`, is gone too. The admin UI writes through the generic
`/api/_pluto/content/product/*` routes instead.

## The field widgets

Six fields use a layer-specific widget, each registered in `app/plugins/pluto-extension.ts` by
`widget:` name (never bare `fieldType:` — a `fieldType`-keyed entry would become the app-wide
default for every layer's fields of that type):

- **`product-media`** (`PlutoProductMediaField.vue`) — the media gallery. See "The media field
  and its reconciliation hook" below.
- **`product-price`** (`PlutoProductPriceField.vue`) — a `UInputNumber` with a hardcoded
  `currency: 'BRL'` format. This is a known, separate issue, not fixed in this pass — the list
  view shows the raw number for the same reason (see "Known gaps" below).
- **`product-is-custom`**, **`product-availability`**, **`product-stock`** — the cross-field
  rule. See "The is-custom/availability/stock rule" below.
- **`product-category`** (`PlutoProductCategoryField.vue`) — a searchable menu over
  `/api/category/list`, with inline "create new category" support (posts to
  `/api/category/new`, gated on the separate `shop:manage_taxonomy` capability).

`product-price`, `product-availability`, and `product-category` load their own options with a
plain `onMounted` fetch, instead of an `async` composable (`useProductCategory`,
`useProductAvailability`). A content field widget is resolved and mounted dynamically — an
`async` composable's top-level `await` can re-suspend an already-mounted page in that position,
so each widget fetches for itself instead.

### The is-custom/availability/stock rule

A custom (commissioned) product is always "commission" availability, with no stock quantity. A
non-custom product can be any availability, and only shows a stock quantity while its
availability is "in stock". This rule used to live in one `watch` inside `Post.vue`, keyed on
two literal ids (`2` for commission, `1` for in-stock). It now lives across three widgets,
sharing one piece of state:

- `app/composables/product-form-bridge.ts` exports `useProductFormBridge()`, a `useState` holding
  `{ isCustom, availabilitySlug }`. Each field widget is resolved and mounted separately, with
  no direct access to another field's props — this bridge is their one shared place to read and
  write the rule from.
- `PlutoProductIsCustomField.vue` mirrors its own value into `bridge.isCustom`.
- `PlutoProductAvailabilityField.vue` disables every option except "commission" while
  `bridge.isCustom` is true, and forces the field to "commission" the moment `isCustom` actually
  flips true. It resolves availability rows by `slug` (`'commission'`, `'in-stock'`), not by a
  literal id — the ids are environment-specific, seeded per database, but the slugs are stable.
  It also mirrors the selected row's own slug into `bridge.availabilitySlug`.
- `PlutoProductStockField.vue` renders only while `bridge.availabilitySlug === 'in-stock'`, and
  keeps the field at `null` while `is_custom` is true, `0` otherwise. It only ever writes a
  value when the field has none yet (a brand-new product, or the first time it becomes visible)
  or when `isCustom` actually changes — never on every mount — so opening an existing "in stock"
  product for edit never clobbers its real stock quantity with a default.

### The media field and its reconciliation hook

`media` is a **virtual** field (`virtual: true` — see the content-model skill): it has no
`products` column of its own. Its value is `{ items: MediaWithSaved[], removedIds: number[] }`
(`MediaWithSaved`, exported from `shared/types/product.ts`, is a `product_media` row plus a
client-only `is_saved` flag). `PlutoProductMediaField.vue` ports the thumbnail strip, main
image, remove button, and `.glb` 3D-model handling from the old `Post.vue`, reusing
`UploadProductMedia.vue` unchanged as the picker.

Because the field is virtual, a freshly loaded form never has a starting value for it — the
widget loads its own starting gallery in `onMounted`, from the hand-written
`GET /api/product/get/:id` route (kept for exactly this, and for the public storefront — see
"Public routes kept" below). A brand-new product (no route id yet) skips that fetch and starts
with an empty gallery.

`server/utils/reconcile-product-media.ts` (`reconcileProductMedia`) reads `rawBody.media` in
`type.hooks.afterCreate`/`afterUpdate` (wired in `server/plugins/content.ts`) and reconciles it
into `product_media`, batched — one query per group, never a per-item loop:

1. `removedIds` — one `update({ product_id: null })...in('id', removedIds)`. The row is never
   deleted, only detached, so it stays in the shared library.
2. `items` split into those with an `id` (existing rows) and those without (brand new).
3. For existing ones: one batched `select('id, product_id')...in('id', ...)` fetches real
   ownership (the client's own claimed `product_id` is never trusted). Each is then grouped by
   `partitionProductMedia` (a pure, unit-tested function) into:
   - **no-op** — already owned by this product.
   - **attach** — owned by nobody, or the row could not be found. One batched
     `update({ product_id })...in('id', ...)`.
   - **clone** — owned by a *different* product. **Always cloned, never stolen** — see "The
     `product_media` table" above for why. Cloned with one batched `insert`, stripped of `id`,
     `is_saved`, and `created_at`.
4. Brand-new items (no `id`) insert in that same batched `insert` call.
5. Any Postgres error throws a 500 immediately — a hook failure fails the whole write, per the
   content-model skill's documented hook contract. Nothing here is swallowed.

The hook reads a Supabase client through `serverSupabaseClient`, as the calling user, so
`product_media`'s own RLS still applies underneath it.

## Public routes kept

These hand-written routes are unchanged, and still load-bearing — the public storefront
(`pluto-supabase-shop-template`) and the kept product-media admin page both call them:

- `GET /api/product/list`, `GET /api/product/get/:id` — read a product (or every product), with
  `product_media`/`product_category`/`product_availability` joined in and public media URLs
  resolved.
- `GET /api/product/availability-statuses` — every availability status, also reused as this
  content type's `availability` field's `optionsUrl`.
- `GET /api/category/list`, `POST /api/category/new` — categories, also reused as the `category`
  field's `optionsUrl` and the category widget's inline-create endpoint.
- `GET /api/product-media/list`, `POST /api/product-media/new` — the shared media library,
  listed and uploaded to from `UploadProductMedia.vue` and the standalone
  `/admin/product-media` page.
- `app/composables/product.ts` (`useProduct`), `app/composables/category.ts`
  (`useProductCategory`), `app/composables/media.ts` (`useProductMedia`),
  `app/components/UploadProductMedia.vue`, `app/pages/admin/product-media.vue` — all still in
  use, unchanged.

## Known gaps

- The product list view shows a raw, unformatted price, and drops the category and created-at
  columns the old hand-written table had. `@plutocms/pluto`'s generic list only renders columns
  a field marks `inList`, with no per-column custom cell rendering yet — a later wave's gap, not
  worked around here.
- The edit page has no "Preview" link to the live product page anymore. The old `Post.vue` had
  one; the generic form has no equivalent slot for it yet.
- The price widget's hardcoded `currency: 'BRL'` is preserved as-is, not fixed, in this pass —
  the same known, separate issue `Post.vue` already had.
