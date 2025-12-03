// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],

  $meta: {
    name: 'supabase-shop',
  },

  css: ['#layers/supabase-shop/app/assets/css/tailwind.css'],

  eslint: {
    config: {
      nuxt: {
        sortConfigKeys: true,
      },
      standalone: false,
    },
  },
})
