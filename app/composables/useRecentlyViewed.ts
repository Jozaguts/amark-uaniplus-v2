export interface RecentlyViewedProduct {
  slug: string
  name: string
  brand?: string | null
  price?: string | null
  image: string
  url: string
  viewedAt: number
}

export const RECENTLY_VIEWED_STORAGE_KEY = 'trendfied-recently-viewed'
export const RECENTLY_VIEWED_MAX = 4

export function normalizeRecentlyViewedList(
  items: RecentlyViewedProduct[],
  max = RECENTLY_VIEWED_MAX,
): RecentlyViewedProduct[] {
  const seen = new Set<string>()
  const next: RecentlyViewedProduct[] = []

  for (const item of items) {
    if (!item?.slug || seen.has(item.slug))
      continue
    seen.add(item.slug)
    next.push(item)
    if (next.length >= max)
      break
  }

  return next
}

export function prependRecentlyViewed(
  items: RecentlyViewedProduct[],
  product: RecentlyViewedProduct,
  max = RECENTLY_VIEWED_MAX,
): RecentlyViewedProduct[] {
  const without = items.filter(item => item.slug !== product.slug)
  return normalizeRecentlyViewedList([product, ...without], max)
}

function readStorage(): RecentlyViewedProduct[] {
  if (!import.meta.client)
    return []

  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY)
    if (!raw)
      return []

    const parsed = JSON.parse(raw) as RecentlyViewedProduct[]
    if (!Array.isArray(parsed))
      return []

    return normalizeRecentlyViewedList(parsed)
  }
  catch {
    return []
  }
}

function writeStorage(items: RecentlyViewedProduct[]) {
  if (!import.meta.client)
    return

  try {
    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(normalizeRecentlyViewedList(items)),
    )
  }
  catch {
    // quota / private mode — ignore
  }
}

/**
 * Recently viewed products — client-only, localStorage, max 4.
 * No backend involvement.
 */
export function useRecentlyViewed() {
  const items = useState<RecentlyViewedProduct[]>('recently-viewed:items', () => [])
  const hydrated = useState<boolean>('recently-viewed:hydrated', () => false)

  function hydrate() {
    if (!import.meta.client || hydrated.value)
      return

    items.value = readStorage()
    hydrated.value = true
  }

  function track(product: Omit<RecentlyViewedProduct, 'viewedAt'> & { viewedAt?: number }) {
    if (!import.meta.client || !product.slug)
      return

    hydrate()

    const entry: RecentlyViewedProduct = {
      slug: product.slug,
      name: product.name,
      brand: product.brand ?? null,
      price: product.price ?? null,
      image: product.image,
      url: product.url || `/products/${product.slug}`,
      viewedAt: product.viewedAt ?? Date.now(),
    }

    items.value = prependRecentlyViewed(items.value, entry)
    writeStorage(items.value)
  }

  function clear() {
    items.value = []
    if (import.meta.client)
      window.localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY)
  }

  if (import.meta.client && !hydrated.value) {
    onMounted(() => hydrate())
  }

  return {
    clear,
    hydrate,
    items: computed(() => items.value),
    track,
  }
}
