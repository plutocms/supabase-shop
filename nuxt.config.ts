// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    ['@plutocms/ui', { install: true }],
    '@plutocms/utils',
    ['@plutocms/supabase', { install: true }],
  ],

  $meta: {
    name: 'supabase-shop',
  },

  css: ['#layers/supabase-shop/app/assets/css/tailwind.css'],
})
