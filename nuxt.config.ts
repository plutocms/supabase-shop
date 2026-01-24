// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  $development: {
    extends: [
      ['../../plutocms/utils/'],
      ['../../plutocms/supabase/', { install: true }],
    ],
  },

  $production: {
    extends: [
      ['github:plutocms/utils'],
      ['github:plutocms/supabase', { install: true }],
    ],
  },

  $meta: {
    name: 'supabase-shop',
  },

  css: ['#layers/supabase-shop/app/assets/css/tailwind.css'],
})
