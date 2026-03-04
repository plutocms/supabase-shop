// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    '@plutocms/ui',
    '@plutocms/utils',
    '@plutocms/supabase',
    '@plutocms/supabase-storage',
  ],

  $meta: {
    name: 'supabase-shop',
  },

  css: ['#layers/supabase-shop/app/assets/css/tailwind.css'],
})
