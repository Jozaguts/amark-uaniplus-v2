import { describe, expect, it } from 'vitest'
import { designOverlayStyle, isLifestyle, resolvePrintZone, selectMockupForView, tintLayerStyle } from './mockupRender'
import type { EditorProductLifestyleMockup, EditorProductView } from '~~/types/editor-product'

const view: EditorProductView = {
  id: 'front',
  label: 'Front',
  mockup: { previewColorId: 'white', previewColorHex: '#fff', src: '/flat.png', width: 1000, height: 1200 },
  printArea: { id: 'fa', label: 'Front', price: '$0', priceValue: 0, x: 250, y: 300, width: 500, height: 600, rotation: 0 },
}

const lifestyle: EditorProductLifestyleMockup = { viewId: 'front', kind: 'lifestyle', src: '/model.jpg', width: 560, height: 640, maskUrl: '/mask.png', printZone: { x: 0.3, y: 0.4, w: 0.3, h: 0.3, rotation: 0 } }
const flatWhite: EditorProductLifestyleMockup = { viewId: 'front', src: '/white.png', width: 1000, height: 1200, previewColorId: 'white' }
const flatBlack: EditorProductLifestyleMockup = { viewId: 'front', src: '/black.png', width: 1000, height: 1200, previewColorId: 'black' }

describe('selectMockupForView', () => {
  it('prefers a lifestyle mockup, ignoring color', () => {
    expect(selectMockupForView([flatWhite, lifestyle, flatBlack], view, 'black')).toBe(lifestyle)
  })
  it('falls back to the flat mockup matching the selected color', () => {
    expect(selectMockupForView([flatWhite, flatBlack], view, 'black')).toBe(flatBlack)
  })
  it('falls back to the first candidate when no color matches', () => {
    expect(selectMockupForView([flatWhite, flatBlack], view, 'red')).toBe(flatWhite)
  })
  it('ignores mockups for other views and returns null when none match', () => {
    expect(selectMockupForView([{ ...flatWhite, viewId: 'back' }], view, 'white')).toBeNull()
  })
})

describe('isLifestyle', () => {
  it('is true only for kind lifestyle with a maskUrl', () => {
    expect(isLifestyle({ viewId: 'front', kind: 'lifestyle', src: '/p.jpg', width: 1, height: 1, maskUrl: '/m.png' })).toBe(true)
    expect(isLifestyle({ viewId: 'front', kind: 'lifestyle', src: '/p.jpg', width: 1, height: 1 })).toBe(false)
    expect(isLifestyle({ viewId: 'front', src: '/p.jpg', width: 1, height: 1, maskUrl: '/m.png' })).toBe(false)
    expect(isLifestyle(null)).toBe(false)
  })
})

describe('resolvePrintZone', () => {
  it('uses the lifestyle printZone (incl. rotation) and its blendMode', () => {
    const m = { ...lifestyle, printZone: { x: 0.3, y: 0.4, w: 0.3, h: 0.25, rotation: 8 }, blendMode: 'screen' as const }
    expect(resolvePrintZone(view, m)).toEqual({
      zone: { x: 0.3, y: 0.4, w: 0.3, h: 0.25, rotation: 8 },
      blendMode: 'screen',
    })
  })
  it('derives the zone from printArea ratios with rotation 0 when no mockup', () => {
    expect(resolvePrintZone(view, null)).toEqual({
      zone: { x: 0.25, y: 0.25, w: 0.5, h: 0.5, rotation: 0 },
      blendMode: 'normal',
    })
  })
  it('returns null when base dimensions are missing', () => {
    const broken: EditorProductView = { ...view, mockup: { ...view.mockup, width: 0 } }
    expect(resolvePrintZone(broken, null)).toBeNull()
  })
})

describe('tintLayerStyle', () => {
  it('builds a masked multiply color layer', () => {
    const s = tintLayerStyle('/mask.png', '#1e2a55')
    expect(s.backgroundColor).toBe('#1e2a55')
    expect(s.mixBlendMode).toBe('multiply')
    expect(s.maskImage).toBe('url("/mask.png")')
    expect(s.WebkitMaskImage).toBe('url("/mask.png")')
    expect(s.maskSize).toBe('100% 100%')
  })
})

describe('designOverlayStyle', () => {
  it('positions the overlay in the zone as percentages with blend mode', () => {
    const s = designOverlayStyle({ x: 0.3, y: 0.4, w: 0.3, h: 0.25, rotation: 0 }, 'multiply')
    expect(s.left).toBe('30%')
    expect(s.top).toBe('40%')
    expect(s.width).toBe('30%')
    expect(s.height).toBe('25%')
    expect(s.mixBlendMode).toBe('multiply')
    expect(s.transform).toBeUndefined()
  })
  it('applies a rotate transform when rotation is non-zero', () => {
    const s = designOverlayStyle({ x: 0, y: 0, w: 1, h: 1, rotation: 8 }, 'multiply')
    expect(s.transform).toBe('rotate(8deg)')
  })
})
