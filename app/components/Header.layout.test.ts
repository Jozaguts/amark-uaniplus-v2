import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const headerSource = readFileSync(new URL('./Header.vue', import.meta.url), 'utf8')
const megaMenuSource = readFileSync(new URL('./header/MegaMenu.vue', import.meta.url), 'utf8')

describe('desktop header layout', () => {
  it('keeps the upper-left grid cell empty and renders catalog sections below the logo', () => {
    expect(headerSource).toMatch(/lg:grid">\s*<div aria-hidden="true"\s*\/>\s*<NuxtLink[\s\S]*?aria-label="trendfied"/)
    expect(headerSource).toMatch(/<nav[\s\S]*?class="hidden h-\[41px\][^"]*lg:flex"[\s\S]*?v-for="item in navItems"/)
  })

  it('places the mega menu below both desktop header rows', () => {
    expect(headerSource).toMatch(/lg:h-\[136px\]/)
    expect(headerSource).toMatch(/h-\[50px\]/)
    expect(megaMenuSource).toContain('top-34')
  })

  it('does not force a default active nav item on non-section routes like index', () => {
    // On `/` no catalog section matches; activeMainItem must stay null
    // instead of falling back to navItems[0] (Women).
    expect(headerSource).toMatch(
      /const activeMainItem = computed\(\(\) => \{\s*return navItems\.value\.find\(isActiveNavigationItem\) \?\? null\s*\}\)/,
    )
    expect(headerSource).not.toMatch(
      /find\(isActiveNavigationItem\) \?\? navItems\.value\[0\]/,
    )
  })

  it('never marks a nav item active on the site root path', () => {
    expect(headerSource).toMatch(
      /if \(currentPath === '\/'\)\s*return false/,
    )
  })
})

describe('mobile top bar', () => {
  it('uses a black Revolve-style bar with brand text and no language switcher', () => {
    expect(headerSource).toMatch(/lg:hidden[\s\S]*?bg-black[\s\S]*?auth\.brand/)
    expect(headerSource).toMatch(/icon:search/)
    expect(headerSource).toMatch(/icon:heart/)
    expect(headerSource).toMatch(/icon:shopping-cart/)
    // Language control stays desktop-only for this layout.
    expect(headerSource).not.toMatch(
      /lg:hidden[\s\S]*?nextLocalePath[\s\S]*?icon:globe-light/,
    )
  })
})

describe('mobile navigation drawer', () => {
  it('uses section tabs only to switch the active section, not to navigate away', () => {
    // Tabs with dropdown must be a full-width button that only switches section content.
    expect(headerSource).toMatch(
      /v-if="itemHasDropdown\(item\)"\s*type="button"[\s\S]*?@click="setMobileSection\(item\)"\s*>\s*\{\{\s*item\.name\s*\}\}/,
    )
  })

  it('offers a full-row shop-all link for the active navigable section', () => {
    expect(headerSource).toContain('header.mobile.shopAll')
    expect(headerSource).toMatch(
      /mobileActiveMainItem && itemCanNavigate\(mobileActiveMainItem\)/,
    )
  })

  it('opens nested panels from the full row, not only a tiny caret button', () => {
    expect(headerSource).toMatch(
      /@click="mobileOpenColumn\(column\)"[\s\S]*?\{\{\s*column\.title\s*\}\}/,
    )
    expect(headerSource).toMatch(
      /@click="mobileOpenLink\(link\)"[\s\S]*?\{\{\s*link\.label\s*\}\}/,
    )
  })

  it('keeps drawer shell from clipping the in-menu search dropdown', () => {
    // Search lives in the drawer; overflow-hidden on the shell clips absolute results.
    expect(headerSource).toMatch(
      /isMobileMenuOpen"\s*class="fixed inset-y-0 left-0 z-\[70\][^"]*(?!overflow-hidden)[^"]*flex-col/,
    )
    expect(headerSource).toContain('data-mobile-search')
  })
})
