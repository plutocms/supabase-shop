import { describe, expect, it } from 'vitest'
import {
  PRODUCT_MEDIA_ACCEPT,
  PRODUCT_MEDIA_MAX_BYTES,
  PRODUCT_MEDIA_MAX_SIZE,
  productMediaMimeType,
  productMediaSuffixedName,
  productMediaUploadProblem
} from '../shared/utils/product-media-upload'
import { createI18nStub } from './fixtures/i18n-stub'

describe('productMediaMimeType', () => {
  it('stores a .glb sent as application/octet-stream as model/gltf-binary', () => {
    expect(productMediaMimeType('application/octet-stream', 'Chair.GLB')).toBe('model/gltf-binary')
  })

  it('treats a missing type as application/octet-stream', () => {
    expect(productMediaMimeType(undefined, 'chair.glb')).toBe('model/gltf-binary')
    expect(productMediaMimeType('', 'notes.bin')).toBe('application/octet-stream')
  })

  it('keeps every other type', () => {
    expect(productMediaMimeType('image/png', 'a.png')).toBe('image/png')
    expect(productMediaMimeType('application/octet-stream', 'a.exe')).toBe('application/octet-stream')
  })
})

describe('productMediaUploadProblem', () => {
  it('passes a supported image under the limit', () => {
    expect(productMediaUploadProblem({ name: 'a.webp', type: 'image/webp', size: 1024 })).toBeNull()
  })

  it('passes a .glb model, even when the browser sends application/octet-stream', () => {
    expect(productMediaUploadProblem({ name: 'chair.glb', type: 'application/octet-stream', size: 1024 })).toBeNull()
  })

  it('passes a file at exactly the limit', () => {
    expect(productMediaUploadProblem({ name: 'a.png', type: 'image/png', size: PRODUCT_MEDIA_MAX_BYTES })).toBeNull()
  })

  it('rejects a type the bucket does not accept with 415', () => {
    expect(productMediaUploadProblem({ name: 'logo.svg', type: 'image/svg+xml', size: 10 })).toEqual({
      statusCode: 415,
      message: '"logo.svg" is not a supported file type. Upload a JPEG, PNG, WebP, GIF, or AVIF image, or a .glb 3D model.',
      key: 'supabase-shop.upload.unsupportedType',
      params: { name: 'logo.svg' },
    })
  })

  it('rejects an unknown binary that is not a .glb with 415', () => {
    expect(productMediaUploadProblem({ name: 'tool.exe', type: 'application/octet-stream', size: 10 })?.statusCode).toBe(415)
  })

  it('rejects a file over the limit with 413, with its size and the limit', () => {
    expect(productMediaUploadProblem({ name: 'big.jpg', type: 'image/jpeg', size: 60 * 1024 * 1024 })).toEqual({
      statusCode: 413,
      message: '"big.jpg" is 60 MB. The limit is 50 MB.',
      key: 'supabase-shop.upload.tooBig',
      params: { name: 'big.jpg', size: '60 MB', limit: '50 MB' },
    })
  })

  it('has an English key text that is the same as the English message', () => {
    const { t } = createI18nStub()
    const problems = [
      productMediaUploadProblem({ name: 'logo.svg', type: 'image/svg+xml', size: 10 }),
      productMediaUploadProblem({ name: 'big.jpg', type: 'image/jpeg', size: 60 * 1024 * 1024 }),
      productMediaUploadProblem({ name: 'huge photo.png', type: 'image/png', size: 1.5 * 1024 * 1024 * 1024 }),
    ]

    for (const problem of problems) {
      expect(problem).not.toBeNull()
      expect(t(problem!.key, problem!.params)).toBe(problem!.message)
    }
  })
})

describe('limits', () => {
  it('matches the product-media bucket: 50 MB', () => {
    expect(PRODUCT_MEDIA_MAX_BYTES).toBe(52_428_800)
    expect(PRODUCT_MEDIA_MAX_SIZE).toBe('50 MB')
  })

  it('accepts the bucket image types and .glb in the picker', () => {
    expect(PRODUCT_MEDIA_ACCEPT).toBe('image/jpeg,image/png,image/webp,image/gif,image/avif,.glb')
  })
})

describe('productMediaSuffixedName', () => {
  it('adds the suffix before the extension', () => {
    expect(productMediaSuffixedName('chair.glb', 'x7k2')).toBe('chair-x7k2.glb')
    expect(productMediaSuffixedName('my.photo.jpg', 'ab12')).toBe('my.photo-ab12.jpg')
  })

  it('appends the suffix to a name without an extension', () => {
    expect(productMediaSuffixedName('readme', 'ab12')).toBe('readme-ab12')
    expect(productMediaSuffixedName('.hidden', 'ab12')).toBe('.hidden-ab12')
  })
})
