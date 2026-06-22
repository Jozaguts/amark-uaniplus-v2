import type {
  CatalogNavigationColumn,
  CatalogNavigationItem,
  CatalogNavigationMenu,
  CatalogNavigationMenuGroup,
  CatalogNavigationMenuLink,
  CatalogNavigationPayload,
  CatalogNavigationResponse,
} from '~/types/catalog-navigation'

function bySortOrder<T extends { sort_order?: number }>(first: T, second: T): number {
  return (first.sort_order ?? 0) - (second.sort_order ?? 0)
}

function activeGroups(groups: CatalogNavigationMenuGroup[] = []): CatalogNavigationMenuGroup[] {
  return groups
    .map(group => ({
      ...group,
      items: (group.items ?? [])
        .filter(item => item.is_active !== false)
        .sort(bySortOrder),
    }))
    .sort(bySortOrder)
}

function activeItems(items: CatalogNavigationItem[] = []): CatalogNavigationItem[] {
  return items
    .filter(item => item.is_active !== false)
    .map(item => ({
      ...item,
      children: activeItems(item.children),
      menu_groups: item.menu_groups ? activeGroups(item.menu_groups) : undefined,
    }))
    .sort(bySortOrder)
}

function itemToMenuLink(item: CatalogNavigationItem): CatalogNavigationMenuLink {
  return {
    id: item.id,
    label: item.name,
    url: item.url,
    path: item.path,
    isClickable: catalogNavigationState(item).canNavigate,
    children: item.children?.map(itemToMenuLink) ?? [],
  }
}

// Cada hijo directo es una categoría real → columna con su propia URL navegable.
function itemToColumn(item: CatalogNavigationItem): CatalogNavigationColumn {
  return {
    id: item.id,
    title: item.name,
    url: item.url,
    isClickable: catalogNavigationState(item).canNavigate,
    items: item.children?.map(itemToMenuLink) ?? [],
  }
}

// Un grupo visual NO es categoría navegable: sólo encabezado (sin `url`); sus
// `items[]` sí son categorías reales.
function groupToColumn(group: CatalogNavigationMenuGroup): CatalogNavigationColumn {
  return {
    id: group.id,
    title: group.title,
    isClickable: false,
    items: group.items.map(itemToMenuLink),
  }
}

// Columnas del mega-menú: si el nodo trae `menu_groups[]`, esos son las
// columnas visuales; si no, se usan los hijos reales como columnas/lista.
function menuFromGroupsOrChildren(item: CatalogNavigationItem): CatalogNavigationMenu | null {
  if (item.menu_groups?.length)
    return { columns: item.menu_groups.map(groupToColumn) }

  if (item.children?.length)
    return { columns: item.children.map(itemToColumn) }

  return null
}

// Columnas siempre desde categorías reales (`children`), ignorando los grupos
// visuales. Se usa para la barra de sub-navegación, cuyas pestañas necesitan
// una URL navegable por pestaña.
function childColumns(item: CatalogNavigationItem): CatalogNavigationColumn[] {
  return item.children?.map(itemToColumn) ?? []
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
    return menuFromGroupsOrChildren(item)
  }

  function subColumnsFor(item: CatalogNavigationItem | null | undefined): CatalogNavigationColumn[] {
    return item ? childColumns(item) : []
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
    subColumnsFor,
    version: computed(() => payload.value.version),
  }
}
