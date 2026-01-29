// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  $development: {
    extends: [
      ['../../plutocms/utils/'],
      ['../../plutocms/supabase/', { install: true }],
    ],
  },

  $meta: {
    name: 'supabase-shop',
  },

  $production: {
    extends: [
      ['github:plutocms/utils'],
      ['github:plutocms/supabase', { install: true }],
    ],
  },

  css: ['#layers/supabase-shop/app/assets/css/tailwind.css'],
})
