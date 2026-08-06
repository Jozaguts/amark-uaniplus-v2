import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./ProductCardActions.vue', import.meta.url), 'utf8')

describe('ProductCardActions', () => {
  it('links design to studio and emits add-to-cart for real cart flow', () => {
    expect(source).toContain('landing.card.addYourDesign')
    expect(source).toContain('landing.card.addToCart')
    expect(source).toMatch(/:to="designTo"/)
    expect(source).toMatch(/@click="emit\('addToCart'\)"|emit\('addToCart'\)/)
    expect(source).toMatch(/bg-black[\s\S]*text-white/)
    expect(source).toMatch(/border border-black bg-white[\s\S]*text-black/)
    expect(source).not.toMatch(/cartTo|cartDisabled/)
    expect(source).not.toMatch(/:disabled=/)
  })
})
