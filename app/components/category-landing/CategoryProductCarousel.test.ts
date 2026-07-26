import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./CategoryProductCarousel.vue', import.meta.url), 'utf8')

describe('CategoryProductCarousel mobile', () => {
  it('uses responsive slides-per-view instead of a fixed desktop count', () => {
    expect(source).toMatch(/slides-per-view=["']1\.|slidesPerView:\s*1/)
    expect(source).toMatch(/breakpoints/)
    expect(source).not.toMatch(/slides-per-view=["']5["']/)
  })

  it('does not force desktop horizontal padding on small screens', () => {
    expect(source).not.toMatch(/class="container px-16/)
    expect(source).toMatch(/px-4|px-\[16px\]|sm:px-8|md:px-/)
  })
})
