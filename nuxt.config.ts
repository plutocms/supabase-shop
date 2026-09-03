// Point these at a local checkout (e.g. `../ui`, `../utils`, `../supabase`)
// to test unpublished changes; unset, they resolve to the published npm
// packages.
const uiLayer = process.env.PLUTO_UI_PATH || '@plutocms/ui'
const utilsLayer = process.env.PLUTO_UTILS_PATH || '@plutocms/utils'
const supabaseLayer = process.env.PLUTO_SUPABASE_PATH || '@plutocms/supabase'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    [uiLayer, { install: true }],
    utilsLayer,
    [supabaseLayer, { install: true }],
  ],

  $meta: {
    name: 'supabase-shop',
  },

  css: ['#layers/supabase-shop/app/assets/css/tailwind.css'],

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'cookie',
        'tailwind-merge',
        '@vueuse/integrations/useChangeCase',
      ],
    },
  },
})
