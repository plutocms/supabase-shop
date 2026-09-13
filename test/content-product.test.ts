import { defineContentType } from '@plutocms/pluto/shared/utils/content'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// shared/content/product.ts calls the auto-imported `defineContentType`
// with no explicit import, the same way every file in this layer relies
// on Nuxt's cross-layer shared/utils auto-import. Plain `vitest run` has
// no Nuxt build step, so it never injects that global — stub it with the
// real implementation before the module loads, matching
// supabase-blog/test/content-post.test.ts.
beforeEach(() => {
  vi.stubGlobal('defineContentType', defineContentType)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('productType', () => {
  it('titleField names a real field', async () => {
    const { productType } = await import('../shared/content/product')

    expect(productType.fields.some((field) => field.name === productType.titleField)).toBe(true)
  })

  it('slug.field names a field of type "slug"', async () => {
    const { productType } = await import('../shared/content/product')

    expect(productType.slug).not.toBe(false)

    const slug = productType.slug as { field: string }
    const field = productType.fields.find((candidate) => candidate.name === slug.field)

    expect(field?.type).toBe('slug')
  })

  it('has no duplicate field names', async () => {
    const { productType } = await import('../shared/content/product')

    const names = productType.fields.map((field) => field.name)

    expect(new Set(names).size).toBe(names.length)
  })

  it('declares no status workflow', async () => {
    const { productType } = await import('../shared/content/product')

    expect(productType.status).toBe(false)
  })

  it('declares no created-timestamp override, and disables updated', async () => {
    const { productType } = await import('../shared/content/product')

    expect(productType.timestamps).toEqual({ created: 'created_at', updated: false })
  })

  it('the media field is virtual, so it never reaches a storage column', async () => {
    const { productType } = await import('../shared/content/product')

    const media = productType.fields.find((field) => field.name === 'media')

    expect(media?.virtual).toBe(true)
  })

  it('every non-virtual field name matches its own column (no column overrides)', async () => {
    const { productType } = await import('../shared/content/product')

    for (const field of productType.fields) {
      if (field.virtual) {
        continue
      }

      expect(field.column).toBeUndefined()
    }
  })

  it('declares write/delete capabilities, but leaves read ungated', async () => {
    const { productType } = await import('../shared/content/product')

    expect(productType.capabilities?.write).toBe('products:manage')
    expect(productType.capabilities?.delete).toBe('products:delete')
    expect(productType.capabilities?.read).toBeUndefined()
  })

  it('defines with no console warnings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await import('../shared/content/product')

    expect(warn).not.toHaveBeenCalled()

    warn.mockRestore()
  })
})
