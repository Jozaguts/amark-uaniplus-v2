import type {
  CatalogNavigationColumn,
  CatalogNavigationItem,
  CatalogNavigationMenu,
  CatalogNavigationMenuLink,
  CatalogNavigationPayload,
  CatalogNavigationResponse,
} from '~/types/catalog-navigation'

function activeItems(items: CatalogNavigationItem[] = []): CatalogNavigationItem[] {
  return items
    .filter(item => item.is_active !== false)
    .map(item => ({
      ...item,
      children: activeItems(item.children),
    }))
    .sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0))
}

function itemToMenuLink(item: CatalogNavigationItem): CatalogNavigationMenuLink {
  return {
    id: item.id,
    label: item.name,
    url: item.url,
    path: item.path,
    children: item.children?.map(itemToMenuLink) ?? [],
  }
}

function itemToColumn(item: CatalogNavigationItem): CatalogNavigationColumn {
  return {
    id: item.id,
    title: item.name,
    url: item.url,
    items: item.children?.map(itemToMenuLink) ?? [],
  }
}

// El mega-menú de un nodo se arma con sus hijos directos como columnas; los
// nietos quedan como enlaces dentro de cada columna (árbol uniforme `children`).
function childrenToMenu(item: CatalogNavigationItem): CatalogNavigationMenu | null {
  if (!item.children?.length)
    return null

  return { columns: item.children.map(itemToColumn) }
}

function normalizePayload(response: CatalogNavigationResponse | CatalogNavigationPayload | CatalogNavigationItem[] | null | undefined): CatalogNavigationPayload {
  if (Array.isArray(response))
    return { items: response }

  const data = response && 'data' in response ? response.data : response

  if (Array.isArray(data))
    return { items: data }

  return data ?? { items: [] }
}

function normalizeCategoryPath(path: string): string {
  return path
    .replace(/^\/+/, '')
    .replace(/^categories\//, '')
    .replace(/\/+$/, '')
}

function normalizeUrl(url: string): string {
  return url.replace(/^\/+/, '').replace(/\/+$/, '')
}

function findItemByPath(items: CatalogNavigationItem[], path: string): CatalogNavigationItem | null {
  const normalizedPath = normalizeCategoryPath(path)

  for (const item of items) {
    if (normalizeCategoryPath(item.path) === normalizedPath)
      return item

    const child = findItemByPath(item.children ?? [], normalizedPath)

    if (child)
      return child
  }

  return null
}

function findItemByUrl(items: CatalogNavigationItem[], url: string): CatalogNavigationItem | null {
  const normalizedUrl = normalizeUrl(url)

  for (const item of items) {
    if (normalizeUrl(item.url) === normalizedUrl)
      return item

    const child = findItemByUrl(item.children ?? [], url)

    if (child)
      return child
  }

  return null
}

export function useCatalogNavigationTree() {
  const { locale } = useI18n()

  const { data, pending, error, refresh } = useStorefrontFetch<CatalogNavigationResponse>('/catalog/navigation', {
    key: computed(() => `catalog-navigation:${locale.value}`),
    query: computed(() => ({ locale: locale.value })),
    default: () => ({ data: { items: [] } }),
  })

  const payload = computed(() => normalizePayload(data.value))
  const items = computed(() => activeItems(payload.value.items))

  function menuForItem(item: CatalogNavigationItem): CatalogNavigationMenu | null {
    return childrenToMenu(item)
  }

  function findByPath(path: string): CatalogNavigationItem | null {
    return findItemByPath(items.value, path)
  }

  function findByUrl(url: string): CatalogNavigationItem | null {
    return findItemByUrl(items.value, url)
  }

  return {
    error,
    findByPath,
    findByUrl,
    items,
    menuForItem,
    pending,
    refresh,
    version: computed(() => payload.value.version),
  }
}
