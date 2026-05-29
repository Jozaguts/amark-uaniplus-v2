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
