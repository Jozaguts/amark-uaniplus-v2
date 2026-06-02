import { describe, expect, it } from 'vitest'
import { isLifestyle } from './mockupRender'

describe('isLifestyle', () => {
  it('is true only for kind lifestyle with a maskUrl', () => {
    expect(isLifestyle({ viewId: 'front', kind: 'lifestyle', src: '/p.jpg', width: 1, height: 1, maskUrl: '/m.png' })).toBe(true)
    expect(isLifestyle({ viewId: 'front', kind: 'lifestyle', src: '/p.jpg', width: 1, height: 1 })).toBe(false)
    expect(isLifestyle({ viewId: 'front', src: '/p.jpg', width: 1, height: 1, maskUrl: '/m.png' })).toBe(false)
    expect(isLifestyle(null)).toBe(false)
  })
})
