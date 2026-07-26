import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./CatalogProductCard.vue', import.meta.url), 'utf8')

describe('CatalogProductCard mobile', () => {
  it('does not render a non-functional favorite button', () => {
    expect(source).not.toMatch(/catalog\.category\.filters\.favorite/)
    expect(source).not.toMatch(/icon:heart/)
  })

  it('does not rely on hover-only quick view chrome', () => {
    expect(source).not.toMatch(/group-hover:flex/)
    expect(source).not.toMatch(/catalog\.category\.filters\.quickView/)
  })
})
