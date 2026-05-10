import type { RouteLocationRaw } from 'vue-router'

export type CatalogSection = 'women' | 'men' | 'kids' | 'dogs' | 'cats'

const catalogSections = new Set<CatalogSection>(['women', 'men', 'kids', 'dogs', 'cats'])

export function slugFromKey(key: string): string {
  const parts = key.split('.')
  const rawSlug = parts.at(-2) || parts.at(-1) || 'item'

  return rawSlug
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export function useCatalogNavigation(section?: CatalogSection) {
  const route = useRoute()
  const localePath = useLocalePath()

  const currentSection = computed<CatalogSection>(() => {
    if (section)
      return section

    const segment = route.path.replace(/^\/(en|es)(?=\/)/, '').split('/').filter(Boolean)[0]

    return catalogSections.has(segment as CatalogSection) ? segment as CatalogSection : 'women'
  })

  function categoryPath(category: string): RouteLocationRaw {
    return localePath({
      path: `/content/${currentSection.value}`,
      query: { category },
    })
  }

  function productPath(slug: string): RouteLocationRaw {
    return localePath({
      path: `/${currentSection.value}/product`,
      query: { slug },
    })
  }

  return {
    currentSection,
    categoryPath,
    productPath,
    slugFromKey,
  }
}
