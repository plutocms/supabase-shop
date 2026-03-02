// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    ['github:plutocms/ui', { install: true }],
    '@plutocms/utils',
    ['github:plutocms/supabase', { install: true }],
    'github:plutocms/supabase-storage',
  ],

  $meta: {
    name: 'supabase-shop',
  },

  css: ['#layers/supabase-shop/app/assets/css/tailwind.css'],
})
