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
