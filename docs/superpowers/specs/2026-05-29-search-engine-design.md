# Global Search Engine — Design Spec

**Date:** 2026-05-29
**Status:** Approved

---

## Overview

Add a global search engine to the storefront. Includes a header layout refactor (Revolve-style), an autocomplete dropdown, and a dedicated search results page. Users can search by product name, category, or subcategory. Results appear in a dropdown (max 10); clicking navigates directly to the product or category. A "Ver todos los resultados" link leads to a full paginated results page.

---

## Scope

Two independent deliverables that ship together:

1. **Header layout refactor** — restructure `Header.vue` desktop layout to Revolve-style
2. **Search engine** — autocomplete composable + dropdown component + results page

---

## Header Layout Refactor

### Desktop (current → new)

**Current right column:** `cart · language · login`

**New right column:** `[search input] · cart · language · login` — all inline, `justify-end gap-5`

The search input uses Revolve-style: no border-box, only `border-bottom: 1px solid`, placeholder text "Search", `ph:magnifying-glass` icon on the right. No other structural changes to the grid (`grid-cols-[1fr_auto_1fr]`).

Left column (nav tabs: Women/Men/Kids/Dogs/Cats) — unchanged.
Center column (logo) — unchanged.

### Mobile

A full-width search input is added inside the mobile drawer, above the nav tabs (Women/Men/Kids). Uses the same `<HeaderSearch>` component with full-width styling. The dropdown renders inside the drawer.

---

## API Contract

### Endpoint 1 — Autocomplete dropdown

```
GET /search?q={query}&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "type": "product",
      "name": "Summer Dress",
      "slug": "summer-dress-001",
      "image": "https://cdn.example.com/thumb.jpg",
      "price": "$45.00"
    },
    {
      "type": "category",
      "name": "Dresses",
      "path": "women/clothing/dresses"
    }
  ]
}
```

Fields:
| Field | Type | Present on |
|---|---|---|
| `type` | `"product" \| "category"` | all |
| `name` | `string` | all |
| `slug` | `string` | products only |
| `path` | `string` | categories only — full path e.g. `"women/clothing/dresses"` |
| `image` | `string \| null` | products only |
| `price` | `string \| null` | products only — formatted e.g. `"$45.00"` |

### Endpoint 2 — Search results page

```
GET /search/products?q={query}&page=1&per_page=12&locale=en
```

Also accepts: `sort`, `price_min`, `price_max`, `sizes[]`, `colors[]` — same as the catalog category endpoint.

**Response:** Identical shape to `/storefront/catalog/categories/{path}/products` (`CatalogProductsResponse`). The `category` field is synthetic:

```json
{
  "data": {
    "category": {
      "id": "search",
      "name": "Results for 'summer dress'",
      "slug": "search",
      "path": "search",
      "url": "/search"
    },
    "products": [ ...CatalogProductsItem[] ],
    "pagination": { ...CatalogProductsPagination },
    "filters": {}
  }
}
```

---

## TypeScript Types

```typescript
// app/types/search.ts

export type SearchResultType = 'product' | 'category'

export interface SearchResult {
  type: SearchResultType
  name: string
  slug?: string
  path?: string
  image?: string | null
  price?: string | null
}

export interface SearchResponse {
  data: SearchResult[]
}
```

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `app/components/Header.vue` | Add `<HeaderSearch>` inline right column; add search input in mobile drawer |
| Create | `app/components/header/HeaderSearch.vue` | Search input + autocomplete dropdown |
| Create | `app/composables/useSearch.ts` | API call, debounce, state |
| Create | `app/types/search.ts` | `SearchResult`, `SearchResponse` types |
| Create | `app/pages/search.vue` | Search results page |
| Modify | `i18n/locales/en.json` | Add `search.*` keys |
| Modify | `i18n/locales/es.json` | Add `search.*` keys |

---

## `useSearch.ts` Composable

```typescript
// Exposes:
const query = ref<string>('')
const results = ref<SearchResult[]>([])
const pending = ref<boolean>(false)
const error = ref<string | null>(null)

// Debounced search — fires 300ms after last keystroke, min 2 chars
// Clears results immediately when query < 2 chars
function search(q: string): void { ... }
function clear(): void { ... }  // resets query + results
```

API call: `useStorefrontFetch` (existing pattern) to `GET /search?q={q}&limit=10`.

---

## `HeaderSearch.vue` Component

**Props:** none — owns its own state via `useSearch()`

**Template states:**

| State | Condition | Display |
|---|---|---|
| Idle | `query.length < 2` | Input only, no dropdown |
| Loading | `pending` | Dropdown with 3-row skeleton |
| Results | `results.length > 0` | Result list + "Ver todos" link |
| Empty | `!pending && results.length === 0 && query.length >= 2` | "No results for '{query}'" |

**Result row layout:**
- Product: thumbnail (32×32) · name · price (right-aligned)
- Category: folder icon · full path label

**Navigation on click:**
- `type === 'product'` → `navigateTo(localePath('/products/' + slug))`
- `type === 'category'` → `navigateTo(localePath('/' + path))`
- "Ver todos los resultados" → `navigateTo(localePath('/search?q=' + query))`

**Close behavior:** click outside (`onClickOutside`), `Escape` key, route change.

---

## `app/pages/search.vue`

- Reads `route.query.q` (string)
- If empty → `navigateTo(localePath('/'))`
- Calls `GET /search/products?q={q}&{filters}` via `useStorefrontFetch`
- Maps `data.category` (`CatalogProductsCategory`) to `CatalogNavigationItem` shape (add `children: []`, `level: 0`) and passes to `<CatalogCategoryPage :category="syntheticCategory">` — minimal adapter, no changes to the existing component
- Page title: `$t('search.resultsTitle', { q })`

---

## i18n Keys

```json
// en.json — under "search":
{
  "search": {
    "placeholder": "Search",
    "viewAll": "View all results",
    "empty": "No results for \"{q}\"",
    "resultsTitle": "Results for \"{q}\""
  }
}
```

Same keys in `es.json`:
```json
{
  "search": {
    "placeholder": "Buscar",
    "viewAll": "Ver todos los resultados",
    "empty": "Sin resultados para \"{q}\"",
    "resultsTitle": "Resultados para \"{q}\""
  }
}
```

---

## What is NOT included

- Search history / recent searches
- Search suggestions before typing (trending terms)
- Filters in the dropdown (only in the results page)
- Server-side rendering of search results (client-only fetch)
