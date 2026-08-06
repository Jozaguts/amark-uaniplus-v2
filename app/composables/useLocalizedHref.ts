/**
 * Locale-aware href helper that preserves query strings.
 * e.g. /design/foo?type=accessories&color=black → /es/design/foo?type=...
 */
export function useLocalizedHref() {
  const localePath = useLocalePath()

  function localizedHref(url: string): string {
    if (/^https?:\/\//i.test(url))
      return url

    try {
      const parsed = new URL(url, 'http://trendfied.local')
      const query = Object.fromEntries(parsed.searchParams.entries())

      return localePath({
        path: parsed.pathname || '/',
        query: Object.keys(query).length ? query : undefined,
      })
    }
    catch {
      return localePath(url)
    }
  }

  function productSlugFromHref(url?: string | null): string | null {
    if (!url)
      return null

    try {
      const parsed = new URL(url, 'http://trendfied.local')
      const designMatch = parsed.pathname.match(/\/design\/([^/]+)/i)
      if (designMatch?.[1])
        return decodeURIComponent(designMatch[1])

      const productMatch = parsed.pathname.match(/\/products\/([^/]+)/i)
      if (productMatch?.[1])
        return decodeURIComponent(productMatch[1])
    }
    catch {
      // fall through
    }

    return null
  }

  function designQueryPrefs(url?: string | null): {
    colorValue?: string
    sizeValue?: string
    productType?: string
  } {
    if (!url)
      return {}

    try {
      const parsed = new URL(url, 'http://trendfied.local')
      return {
        colorValue: parsed.searchParams.get('color') || undefined,
        sizeValue: parsed.searchParams.get('size') || undefined,
        productType: parsed.searchParams.get('type') || undefined,
      }
    }
    catch {
      return {}
    }
  }

  return {
    designQueryPrefs,
    localizedHref,
    productSlugFromHref,
  }
}
