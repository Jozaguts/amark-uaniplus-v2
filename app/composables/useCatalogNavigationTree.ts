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
    badge: item.badge ?? null,
    italic: item.italic ?? false,
    children: item.children?.map(itemToMenuLink) ?? [],
  }
}

function childrenToMenu(item: CatalogNavigationItem): CatalogNavigationMenu | null {
  if (!item.children?.length)
    return null

  const columns: CatalogNavigationColumn[] = [{
    title: item.name,
    items: item.children.map(itemToMenuLink),
  }]

  return { columns, images: [] }
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
    if (item.menu?.columns?.length)
      return item.menu

    return childrenToMenu(item)
  }

  function findByPath(path: string): CatalogNavigationItem | null {
    return findItemByPath(items.value, path)
  }

  return {
    error,
    findByPath,
    items,
    menuForItem,
    pending,
    refresh,
    version: computed(() => payload.value.version),
  }
}
