# E-commerce layer for Pluto CMS with Supabase

This layer provides e-commerce functionalities upon [`@plutocms/supabase`](https://github.com/plutocms/supabase) layer.

## Installation

Install the `supabase-shop` layer and include it via `extends` option in your `nuxt.config.ts`, it should come after the `@plutocms/pluto` and `@plutocms/supabase` layers:

```bash
# npm
npm i @plutocms/supabase-shop

# yarn
yarn add @plutocms/supabase-shop

# pnpm
pnpm add @plutocms/supabase-shop

# bun
bun add @plutocms/supabase-shop
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    '@plutocms/pluto',
    '@plutocms/supabase',

    // Make sure to add this layer after the Pluto and Supabase layers
    '@plutocms/supabase-shop',
  ],
})
```

## Features

### Dashboard views

This layer provides the following dashboard views for managing products:

- `/admin/products`: view a list of products.
- `/admin/product/new`: create a new product.
- `/admin/product/edit/:id`: edit an existing product.

### Composables

This layer provides the following composables:

- `useProductAvailability`: retrieves a list of product availability statuses (in stock, commission, etc.).
- `useProduct`: retrieves a list of products or a single product by ID.
- `useProductCategory`: retrieves a list of product categories.

### API Routes

The layer includes API routes for interacting with Supabase services, such as creating, editing, deleting, and fetching products:

- DELETE `/api/product/delete/:id`
- POST `/api/product/edit/:id`
- GET `/api/product/get/:id`
- GET `/api/product/availability-statuses`
- GET `/api/product/list`
- POST `/api/product/create`

### Types

- `ProductData`: Auto-imported for product data API response.
- `ProductItem`: Auto-imported type representing a product item.

### Product prices are integer cents

`products.price` holds integer cents. `4990` means R$ 49,90. The price field in the admin takes
an amount with 2 decimals and stores cents.

Do not divide by 100 in your app. Use the auto-imported helpers instead:

- `formatProductPrice(cents, options?)`: formats cents as a currency string. The currency is BRL by default. It takes the same options as `formatCurrency`.
- `centsToAmount(cents)`: converts cents to an amount (`4990` to `49.9`).
- `amountToCents(amount)`: converts an amount to cents, with rounding (`49.9` to `4990`).

#### Migrate from a version before cents

1. Update `@plutocms/supabase-shop`.
2. Open `/admin/migrations` and apply migration `004_price_in_cents.sql`. It multiplies every
   stored price by 100. Apply it once only. The migration ledger prevents a second run.
3. In your storefront, replace `formatCurrency(product.price)` with
   `formatProductPrice(product.price)`. Replace any price sum or sort so it works on cents.
4. Clear old carts that your app stored in the browser. They hold prices in reais.
