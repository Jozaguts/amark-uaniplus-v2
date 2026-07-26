import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./DirectionAwareHoverDemo.vue', import.meta.url), 'utf8')

describe('DirectionAwareHoverDemo mobile interaction', () => {
  it('does not attach touch handlers that compete with parent NuxtLink navigation', () => {
    expect(source).not.toMatch(/@touchstart=/)
    expect(source).not.toMatch(/@touchend=/)
  })

  it('shows slot content without hover on coarse/touch pointers', () => {
    expect(source).toMatch(/\(hover:\s*hover\)/)
    expect(source).toMatch(/contentAlwaysVisible \|\| !prefersHover/)
  })

  it('keeps decorative hover layers from intercepting taps', () => {
    expect(source).toMatch(/pointer-events-none[\s\S]*overlayClass|overlayClass[\s\S]*pointer-events-none/)
  })

  it('avoids active scale transforms that shift hit targets on tap', () => {
    expect(source).not.toMatch(/active:scale/)
  })
})
