import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./ProductCardActions.vue', import.meta.url), 'utf8')

describe('ProductCardActions', () => {
  it('renders thin dual CTAs: design (black) and cart (white outline)', () => {
    expect(source).toContain('landing.card.addYourDesign')
    expect(source).toContain('landing.card.addToCart')
    expect(source).toMatch(/bg-black[\s\S]*text-white/)
    expect(source).toMatch(/border border-black bg-white[\s\S]*text-black/)
    expect(source).toMatch(/h-9|h-10/)
    expect(source).not.toMatch(/orange|#ff6|#f97316/)
  })
})
