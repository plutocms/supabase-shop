import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// nuxt.config.ts calls the global `defineNuxtConfig`, which Nuxt normally
// auto-imports (and types via its own generated .d.ts). Outside a Nuxt
// build it's the identity function (see node_modules/nuxt/dist/app/config.js)
// — stub it the same way, and re-declare its type since this file sits
// outside the project references that carry Nuxt's own ambient declaration.
declare global {
  function defineNuxtConfig<T>(config: T): T
}

beforeEach(() => {
  vi.stubGlobal('defineNuxtConfig', (config: unknown) => config)
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.PLUTO_UI_PATH
  delete process.env.PLUTO_UTILS_PATH
  delete process.env.PLUTO_SUPABASE_PATH
  vi.resetModules()
})

describe('ui, utils, and supabase layer resolution', () => {
  it('defaults every layer to its published npm package when unset', async () => {
    delete process.env.PLUTO_UI_PATH
    delete process.env.PLUTO_UTILS_PATH
    delete process.env.PLUTO_SUPABASE_PATH

    const { default: config } = await import('../nuxt.config')

    expect(config.extends).toEqual([
      ['@plutocms/ui', { install: true }],
      '@plutocms/utils',
      ['@plutocms/supabase', { install: true }],
    ])
  })

  it('honors the env var overrides when set', async () => {
    process.env.PLUTO_UI_PATH = '../ui'
    process.env.PLUTO_UTILS_PATH = '../utils'
    process.env.PLUTO_SUPABASE_PATH = '../supabase'

    const { default: config } = await import('../nuxt.config')

    expect(config.extends).toEqual([
      ['../ui', { install: true }],
      '../utils',
      ['../supabase', { install: true }],
    ])
  })
})
