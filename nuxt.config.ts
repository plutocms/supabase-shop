// Point these at a local checkout (e.g. `../utils`, `../supabase`) to test
// unpublished changes; unset, they resolve to the published npm packages.
const utilsLayer = process.env.PLUTO_UTILS_PATH || '@plutocms/utils'
const supabaseLayer = process.env.PLUTO_SUPABASE_PATH || '@plutocms/supabase'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    utilsLayer,
    [supabaseLayer, { install: true }],
  ],

  $meta: {
    name: 'supabase-shop',
  },

  // No `css` entry: the app owns the one Tailwind build, and Nuxt UI scans
  // this layer's app/ dir. See the single-tailwind-build skill in pluto.

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
