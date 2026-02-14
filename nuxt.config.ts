// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    ['github:plutocms/utils'],
    ['github:plutocms/supabase'],
  ],

  $meta: {
    name: 'supabase-shop',
  },

  css: ['#layers/supabase-shop/app/assets/css/tailwind.css'],
})
