# Global Search Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global search engine with an autocomplete dropdown in the header (Revolve-style layout) and a dedicated `/search` results page.

**Architecture:** Six tasks in dependency order — types first, then composable, then the search component, then header wiring, then the results page. `useSearch` composable owns all API and debounce logic; `HeaderSearch.vue` owns the input + dropdown UI; `search.vue` fetches from a separate endpoint and reuses `CatalogProductGrid`.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, VueUse (`useDebounceFn`, `onClickOutside`), `useStorefrontFetch` (existing pattern), Tailwind CSS, Phosphor Icons, `@nuxtjs/i18n`.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `i18n/locales/en.json` | Add `search.*` i18n keys |
| Modify | `i18n/locales/es.json` | Add `search.*` i18n keys |
| Create | `app/types/search.ts` | `SearchResult`, `SearchResponse` types |
| Create | `app/composables/useSearch.ts` | Debounced API call, reactive state |
| Create | `app/components/header/HeaderSearch.vue` | Search input + autocomplete dropdown |
| Modify | `app/components/Header.vue` | Add `<HeaderSearch>` to desktop right column and mobile drawer |
| Create | `app/pages/search.vue` | Full paginated search results page |

---

## Task 1: Add i18n keys

**Files:**
- Modify: `i18n/locales/en.json`
- Modify: `i18n/locales/es.json`

- [ ] **Step 1: Add `search` block to `en.json`**

Open `i18n/locales/en.json`. The file is a JSON object. Add a `"search"` key at the top level (alongside `"welcome"`, `"auth"`, `"header"`, etc.):

```json
"search": {
  "placeholder": "Search",
  "viewAll": "View all results",
  "empty": "No results for \"{q}\"",
  "resultsTitle": "Results for \"{q}\""
},
```

- [ ] **Step 2: Add `search` block to `es.json`**

Open `i18n/locales/es.json`. Add the same key at the top level:

```json
"search": {
  "placeholder": "Buscar",
  "viewAll": "Ver todos los resultados",
  "empty": "Sin resultados para \"{q}\"",
  "resultsTitle": "Resultados para \"{q}\""
},
```

- [ ] **Step 3: Commit**

```bash
git add i18n/locales/en.json i18n/locales/es.json
git commit -m "feat: add search i18n keys"
```

---

## Task 2: Add TypeScript types

**Files:**
- Create: `app/types/search.ts`

- [ ] **Step 1: Create the file**

Create `app/types/search.ts` with this exact content:

```typescript
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

- [ ] **Step 2: Commit**

```bash
git add app/types/search.ts
git commit -m "feat: add SearchResult and SearchResponse types"
```

---

## Task 3: Create `useSearch` composable

**Files:**
- Create: `app/composables/useSearch.ts`

This composable owns all search state. It exposes `query` (a writable ref — bind directly to the input via `v-model`), a debounced watcher that fires the API call, and a `clear()` function.

- [ ] **Step 1: Create `app/composables/useSearch.ts`**

```typescript
import type { SearchResponse, SearchResult } from '~/types/search'

export function useSearch() {
  const { $storefront } = useNuxtApp()

  const query = ref('')
  const results = ref<SearchResult[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  const performSearch = async (q: string) => {
    if (q.length < 2) {
      results.value = []
      return
    }

    pending.value = true
    error.value = null

    try {
      const response = await $storefront<SearchResponse>('/search', {
        query: { q, limit: 10 },
      })
      results.value = response.data ?? []
    }
    catch {
      error.value = 'search_failed'
      results.value = []
    }
    finally {
      pending.value = false
    }
  }

  const debouncedSearch = useDebounceFn(performSearch, 300)

  watch(query, (q) => {
    if (q.length < 2) {
      results.value = []
      return
    }
    debouncedSearch(q)
  })

  const clear = () => {
    query.value = ''
    results.value = []
    error.value = null
    pending.value = false
  }

  return { query, results, pending, error, clear }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/composables/useSearch.ts
git commit -m "feat: add useSearch composable with debounced API call"
```

---

## Task 4: Create `HeaderSearch.vue` component

**Files:**
- Create: `app/components/header/HeaderSearch.vue`

This component owns the input + dropdown UI. It calls `useSearch()` internally (no props for state). It accepts a `fullWidth` boolean prop to switch the dropdown from fixed-width (desktop) to full-width (mobile drawer).

`onClickOutside` and `useDebounceFn` are auto-imported via `@vueuse/nuxt`. `ref`, `computed`, `watch` are auto-imported by Nuxt. `useLocalePath`, `useRoute`, `navigateTo` are auto-imported by `@nuxtjs/i18n` / Nuxt.

- [ ] **Step 1: Create `app/components/header/HeaderSearch.vue`**

```vue
<script setup lang="ts">
import { useSearch } from '~/composables/useSearch'

const props = withDefaults(defineProps<{
  fullWidth?: boolean
}>(), {
  fullWidth: false,
})

const localePath = useLocalePath()
const route = useRoute()
const { query, results, pending, clear } = useSearch()

const containerRef = ref<HTMLElement | null>(null)
const showDropdown = computed(() => query.value.length >= 2)
const isEmpty = computed(() => !pending.value && results.value.length === 0 && query.value.length >= 2)

onClickOutside(containerRef, () => {
  clear()
})

watch(route, () => {
  clear()
})

function resultPath(result: { type: string, slug?: string, path?: string }): string {
  if (result.type === 'product' && result.slug) {
    return localePath('/products/' + result.slug)
  }
  if (result.type === 'category' && result.path) {
    return localePath('/' + result.path)
  }
  return localePath('/')
}

function handleResultClick() {
  clear()
}

function handleViewAll() {
  navigateTo(localePath('/search?q=' + encodeURIComponent(query.value)))
  clear()
}
</script>

<template>
  <div
    ref="containerRef"
    class="relative"
  >
    <!-- Input — Revolve underline style -->
    <div class="flex items-center gap-2 border-b border-[#d0d0d0] pb-1">
      <input
        v-model="query"
        type="search"
        :placeholder="$t('search.placeholder')"
        class="w-full min-w-[130px] bg-transparent text-[13px] font-normal text-[#222] outline-none placeholder:font-normal placeholder:text-[#aaa]"
        @keydown.escape="clear()"
      />
      <Icon
        name="ph:magnifying-glass"
        class="size-[15px] shrink-0 text-[#555]"
      />
    </div>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="showDropdown"
        class="absolute top-[calc(100%+8px)] z-[90] overflow-hidden border border-[#e8e8e8] bg-white shadow-[0_18px_40px_rgba(17,19,20,0.12)]"
        :class="fullWidth ? 'left-0 right-0' : 'right-0 w-[360px]'"
      >
        <!-- Loading skeleton -->
        <template v-if="pending">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center gap-3 border-b border-[#f0f0f0] px-4 py-3"
          >
            <div class="h-8 w-8 shrink-0 rounded bg-[#f0f0f0]" />
            <div class="flex-1 space-y-1.5">
              <div class="h-3 w-2/3 rounded bg-[#f0f0f0]" />
              <div class="h-3 w-1/3 rounded bg-[#f0f0f0]" />
            </div>
          </div>
        </template>

        <!-- Results -->
        <template v-else-if="results.length > 0">
          <NuxtLink
            v-for="result in results"
            :key="`${result.type}-${result.slug ?? result.path}`"
            :to="resultPath(result)"
            class="flex items-center gap-3 border-b border-[#f0f0f0] px-4 py-3 transition-colors hover:bg-[#f9f9f9]"
            @click="handleResultClick"
          >
            <!-- Product row -->
            <template v-if="result.type === 'product'">
              <img
                v-if="result.image"
                :src="result.image"
                :alt="result.name"
                class="h-8 w-8 shrink-0 rounded object-cover"
              />
              <div
                v-else
                class="h-8 w-8 shrink-0 rounded bg-[#f0f0f0]"
              />
              <span class="flex-1 truncate text-[13px] text-[#222]">{{ result.name }}</span>
              <span
                v-if="result.price"
                class="shrink-0 text-[13px] font-semibold text-[#222]"
              >{{ result.price }}</span>
            </template>

            <!-- Category row -->
            <template v-else>
              <div class="flex h-8 w-8 shrink-0 items-center justify-center">
                <Icon
                  name="ph:folder"
                  class="size-5 text-[#888]"
                />
              </div>
              <span class="flex-1 truncate text-[13px] text-[#555]">{{ result.name }}</span>
              <Icon
                name="ph:caret-right"
                class="size-3.5 shrink-0 text-[#bbb]"
              />
            </template>
          </NuxtLink>

          <!-- View all -->
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 px-4 py-3 text-[13px] font-semibold text-[#222] transition-colors hover:bg-[#f9f9f9]"
            @click="handleViewAll"
          >
            {{ $t('search.viewAll') }}
            <Icon
              name="ph:arrow-right"
              class="size-4"
            />
          </button>
        </template>

        <!-- Empty state -->
        <template v-else-if="isEmpty">
          <div class="px-4 py-6 text-center text-[13px] text-[#888]">
            {{ $t('search.empty', { q: query }) }}
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/header/HeaderSearch.vue
git commit -m "feat: add HeaderSearch component with autocomplete dropdown"
```

---

## Task 5: Wire HeaderSearch into Header.vue

**Files:**
- Modify: `app/components/Header.vue`

Two changes: desktop right column (add as first child) and mobile drawer (add above nav tabs).

- [ ] **Step 1: Add explicit import for HeaderSearch at the top of `<script setup>`**

`Header.vue` explicitly imports its components at the top (lines 1-3). Add `HeaderSearch` import after `MegaMenu`:

```typescript
import HeaderSearch from '~/components/header/HeaderSearch.vue'
import MegaMenu from '~/components/header/MegaMenu.vue'
```

- [ ] **Step 2: Add `<HeaderSearch />` to the desktop right column (line 317)**

The desktop right column (line 317) currently opens with:
```html
<div class="flex items-center justify-end gap-5 pt-[-1px] text-[16px] font-bold leading-none">
  <NuxtLink :to="localePath('/account/cart')" ...>
```

Add `<HeaderSearch />` as the first child, before the cart link:

```html
<div class="flex items-center justify-end gap-5 pt-[-1px] text-[16px] font-bold leading-none">
  <HeaderSearch />
  <NuxtLink :to="localePath('/account/cart')" :aria-label="$t('header.actions.cart')" class="relative pt-px">
```

- [ ] **Step 3: Add `<HeaderSearch :full-width="true" />` to the mobile drawer (after line 591)**

The mobile drawer header ends at line 591 (`</div>`) and the nav tabs start at line 593. Insert a search row between them:

```html
        </div>

        <!-- Search -->
        <div class="shrink-0 border-b border-[#e8e8e8] px-4 py-3">
          <HeaderSearch :full-width="true" />
        </div>

        <!-- Main nav tabs -->
        <div class="flex shrink-0 border-b border-[#e8e8e8]">
```

- [ ] **Step 4: Verify in the browser**

Run `pnpm dev` and open `http://uandiplus.test:3000` (or `http://127.0.0.1:3000`).

Expected:
- Desktop header: search input with underline style appears to the left of the cart icon
- Typing 2+ characters shows the dropdown
- Clicking outside closes it
- Mobile: search input appears inside the drawer above the Women/Men/Kids tabs

- [ ] **Step 5: Commit**

```bash
git add app/components/Header.vue
git commit -m "feat: add HeaderSearch to desktop header and mobile drawer"
```

---

## Task 6: Create `/search` results page

**Files:**
- Create: `app/pages/search.vue`

This page fetches from `GET /search/products?q={q}&...` and renders results using the existing `CatalogProductGrid`. It replicates the `productToCatalogProduct` mapper from `CatalogCategoryPage` (that function is not exported, so we copy it here — it's 12 lines).

- [ ] **Step 1: Create `app/pages/search.vue`**

```vue
<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'
import type { CatalogProductsItem, CatalogProductsResponse } from '~/types/catalog-products'

const route = useRoute()
const localePath = useLocalePath()
const { t, locale } = useI18n()

const q = computed(() => {
  const val = route.query.q
  return typeof val === 'string' ? val.trim() : ''
})

// Redirect to home if no query
if (!q.value) {
  await navigateTo(localePath('/'))
}

function queryValue(key: string): string | undefined {
  const value = route.query[key]
  if (Array.isArray(value))
    return typeof value[0] === 'string' ? value[0] : undefined
  return typeof value === 'string' && value ? value : undefined
}

function queryValues(key: string): string[] {
  const value = route.query[key]
  if (Array.isArray(value))
    return value.filter((item): item is string => typeof item === 'string')
  return typeof value === 'string' && value ? [value] : []
}

const requestQuery = computed(() => {
  const query: Record<string, string | string[] | number | undefined> = {
    q: q.value,
    locale: locale.value,
    page: queryValue('page') ?? '1',
    per_page: 12,
    sort: queryValue('sort'),
    price_min: queryValue('price_min'),
    price_max: queryValue('price_max'),
  }

  const sizes = queryValues('sizes')
  const colors = queryValues('colors')

  if (sizes.length)
    query['sizes[]'] = sizes
  if (colors.length)
    query['colors[]'] = colors

  return query
})

const {
  data: productsResponse,
  pending,
  error,
} = useStorefrontFetch<CatalogProductsResponse>(
  '/search/products',
  {
    key: computed(() => `search-products:${q.value}:${locale.value}:${JSON.stringify(route.query)}`),
    query: requestQuery,
    default: () => ({ data: null }),
    watch: [q, computed(() => route.query), locale],
  },
)

const payload = computed(() => productsResponse.value?.data ?? null)

function linkTarget(url: string): string {
  if (/^https?:\/\//.test(url))
    return url
  return localePath(url)
}

function productToCatalogProduct(product: CatalogProductsItem): CatalogProduct {
  const designTo = product.is_designable === true && product.design_url
    ? linkTarget(product.design_url)
    : undefined

  return {
    id: String(product.id),
    name: product.name,
    brand: product.brand ?? '',
    salePrice: product.price.formatted,
    retailPrice: product.price.compare_at_formatted ?? null,
    alt: product.image.alt,
    image: product.image.src,
    srcset: product.image.srcset ?? undefined,
    to: linkTarget(product.url),
    designTo,
    isDesignable: product.is_designable === true,
  }
}

const products = computed<CatalogProduct[]>(() => {
  return (payload.value?.products ?? []).map(productToCatalogProduct)
})

const pagination = computed(() => payload.value?.pagination ?? null)

const paginationPages = computed(() => {
  if (!pagination.value || pagination.value.last_page <= 1)
    return []
  return Array.from({ length: pagination.value.last_page }, (_, i) => i + 1)
})

function pagePath(page: number) {
  return localePath({
    path: route.path,
    query: { ...route.query, page: String(page) },
  })
}

useHead(() => ({
  title: t('search.resultsTitle', { q: q.value }),
}))
</script>

<template>
  <main class="page mx-auto w-full max-w-[1344px] px-5 pb-[80px] pt-7 lg:px-0">
    <h1 class="mb-8 text-[22px] font-bold leading-tight tracking-tight text-[#222]">
      {{ $t('search.resultsTitle', { q }) }}
    </h1>

    <!-- Loading -->
    <div
      v-if="pending"
      class="grid grid-cols-2 gap-x-7 gap-y-14 md:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="space-y-3"
      >
        <div class="aspect-[3/4] w-full rounded bg-[#f0f0f0]" />
        <div class="h-3 w-3/4 rounded bg-[#f0f0f0]" />
        <div class="h-3 w-1/3 rounded bg-[#f0f0f0]" />
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="py-20 text-center text-sm text-[#888]"
    >
      {{ $t('search.empty', { q }) }}
    </div>

    <!-- Empty -->
    <div
      v-else-if="products.length === 0"
      class="py-20 text-center text-sm text-[#888]"
    >
      {{ $t('search.empty', { q }) }}
    </div>

    <!-- Results grid -->
    <template v-else>
      <CatalogProductGrid :products="products" />

      <!-- Pagination -->
      <nav
        v-if="paginationPages.length > 1"
        class="mt-12 flex items-center justify-center gap-2"
        aria-label="Pagination"
      >
        <NuxtLink
          v-for="page in paginationPages"
          :key="page"
          :to="pagePath(page)"
          class="flex h-9 w-9 items-center justify-center rounded text-sm font-semibold transition-colors"
          :class="pagination?.current_page === page
            ? 'bg-black text-white'
            : 'text-[#555] hover:bg-[#f0f0f0]'"
        >
          {{ page }}
        </NuxtLink>
      </nav>
    </template>
  </main>
</template>
```

- [ ] **Step 2: Verify in the browser**

With `pnpm dev` running, type a search term in the header, press Enter or click "Ver todos los resultados". You should land on `/search?q={term}` with a product grid.

Expected:
- Page title updates to "Results for '{term}'"
- Products grid renders correctly
- Pagination appears when results span multiple pages
- Empty state shows when no products match

- [ ] **Step 3: Commit**

```bash
git add app/pages/search.vue
git commit -m "feat: add /search results page"
```

---

## Self-Review

**Spec coverage:**
- [x] Header layout refactor — `<HeaderSearch>` added to desktop right column (Task 5)
- [x] Search input Revolve-style (underline, no box) — Task 4 template
- [x] Mobile search in drawer above nav tabs — Task 5 step 3
- [x] Debounce 300ms, min 2 chars — Task 3 `useSearch`
- [x] Max 10 results — `limit: 10` in API query (Task 3)
- [x] Product results → `/products/{slug}` — Task 4 `resultPath()`
- [x] Category results → `/{path}` — Task 4 `resultPath()`
- [x] "Ver todos" → `/search?q=...` — Task 4 `handleViewAll()`
- [x] Loading skeleton — Task 4 template
- [x] Empty state — Task 4 template
- [x] Close on click outside / Escape / route change — Task 4
- [x] `/search` page with paginated grid — Task 6
- [x] i18n keys — Task 1
- [x] TypeScript types — Task 2
- [x] `SearchResult` type used consistently — Task 2 → Task 3 → Task 4 all reference `~/types/search`

**Type consistency:**
- `SearchResult` defined in Task 2, imported in Task 3 (`useSearch`) and Task 4 (`HeaderSearch`)
- `resultPath` in Task 4 accepts `{ type, slug?, path? }` — matches `SearchResult` shape ✓
- `CatalogProduct` in Task 6 matches `~/types/catalog` — same fields as `CatalogCategoryPage` mapper ✓
- `productToCatalogProduct` in Task 6 references `CatalogProductsItem` from `~/types/catalog-products` — imported ✓
- `useStorefrontFetch` in Task 6 follows the identical pattern from `CatalogCategoryPage.vue:71` ✓
