import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const headerSource = readFileSync(new URL('./Header.vue', import.meta.url), 'utf8')
const megaMenuSource = readFileSync(new URL('./header/MegaMenu.vue', import.meta.url), 'utf8')

describe('desktop header layout', () => {
  it('keeps the upper-left grid cell empty and renders catalog sections below the logo', () => {
    expect(headerSource).toMatch(/lg:grid">\s*<div aria-hidden="true"\s*\/>\s*<NuxtLink[\s\S]*?aria-label="uandiplus"/)
    expect(headerSource).toMatch(/<nav[\s\S]*?class="hidden h-\[41px\][^"]*lg:flex"[\s\S]*?v-for="item in navItems"/)
  })

  it('places the mega menu below both desktop header rows', () => {
    expect(headerSource).toContain('class="h-[58px] lg:h-[136px]"')
    expect(megaMenuSource).toContain('top-34')
  })
})
