import { describe, expect, it } from 'vitest'
import { buildColorBackdropConfig } from './productColorBackdrop'

const layout = { x: 10, y: 20, width: 240, height: 300 }

describe('buildColorBackdropConfig', () => {
  it('returns a konva rect config when a color applies', () => {
    expect(buildColorBackdropConfig(layout, '#ff0000', true)).toEqual({
      x: 10,
      y: 20,
      width: 240,
      height: 300,
      fill: '#ff0000',
      listening: false,
      name: 'product-color-backdrop',
    })
  })

  it('returns null when the product has no colors', () => {
    expect(buildColorBackdropConfig(layout, '#ff0000', false)).toBeNull()
  })

  it('returns null when no color hex is provided', () => {
    expect(buildColorBackdropConfig(layout, '', true)).toBeNull()
    expect(buildColorBackdropConfig(layout, null, true)).toBeNull()
  })

  it('returns null when layout is missing', () => {
    expect(buildColorBackdropConfig(null, '#ff0000', true)).toBeNull()
  })
})
