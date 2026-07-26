import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./Footer.vue', import.meta.url), 'utf8')

describe('Footer actionable controls', () => {
  it('handles newsletter submit instead of a no-op prevent', () => {
    expect(source).toMatch(/@submit\.prevent="submitNewsletter"|@submit\.prevent="onNewsletterSubmit"/)
    expect(source).not.toMatch(/@submit\.prevent\s*>/)
    expect(source).toMatch(/newsletterEmail|email\.value/)
  })

  it('does not emit dead hash hrefs for social, legal, promo, or info links', () => {
    expect(source).not.toMatch(/href:\s*['"]#['"]/)
    expect(source).not.toMatch(/href=["']#["']/)
  })

  it('only renders social icons when a real URL is available', () => {
    expect(source).toMatch(/isActionableHref|actionableSocialLinks|socialLinks\.filter/)
  })

  it('uses locale-aware paths for internal footer navigation', () => {
    expect(source).toMatch(/localePath|useLocalePath/)
  })
})
