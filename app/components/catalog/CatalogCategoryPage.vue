<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { CatalogProduct, CatalogSidebarGroup } from '~/types/catalog'
import type { CatalogNavigationItem } from '~/types/catalog-navigation'
import type {
  CatalogProductsBreadcrumb,
  CatalogProductsItem,
  CatalogProductsResponse,
} from '~/types/catalog-products'

const props = defineProps<{
  category: CatalogNavigationItem
}>()

const route = useRoute()
const localePath = useLocalePath()
const { locale, t } = useI18n()
const { findByPath } = useCatalogNavigationTree()

function linkTarget(url: string): string {
  if (/^https?:\/\//.test(url))
    return url

  return localePath(url)
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
  () => `/storefront/catalog/categories/${props.category.path}/products`,
  {
    key: computed(() => `catalog-products:${props.category.path}:${locale.value}:${JSON.stringify(route.query)}`),
    query: requestQuery,
    default: () => ({ data: null }),
    watch: [
      computed(() => props.category.path),
      computed(() => route.query),
      locale,
    ],
  },
)

const payload = computed(() => productsResponse.value?.data ?? null)

const pathSegments = computed(() => props.category.path.split('/').filter(Boolean))

const navigationBreadcrumbItems = computed(() => {
  return pathSegments.value
    .map((_, index) => findByPath(pathSegments.value.slice(0, index + 1).join('/')))
    .filter((item): item is CatalogNavigationItem => Boolean(item))
})

const breadcrumbItems = computed<CatalogProductsBreadcrumb[]>(() => {
  const breadcrumbs = payload.value?.category.breadcrumbs

  if (breadcrumbs?.length)
    return breadcrumbs

  return navigationBreadcrumbItems.value.map(item => ({
    name: item.name,
    path: item.path,
    url: item.url,
  }))
})

const parentPath = computed(() => pathSegments.value.slice(0, -1).join('/'))

const parentCategory = computed(() => parentPath.value ? findByPath(parentPath.value) : null)

const topCategory = computed(() => navigationBreadcrumbItems.value[0] ?? props.category)

const selectedCategory = computed(() => props.category.slug)

function categoryItems(items: CatalogNavigationItem[]): CatalogSidebarGroup['items'] {
  return items.map(item => ({
    label: item.name,
    to: linkTarget(item.url),
    active: props.category.path === item.path || props.category.path.startsWith(`${item.path}/`),
  }))
}

const sidebarGroups = computed<CatalogSidebarGroup[]>(() => {
  const groups: CatalogSidebarGroup[] = []
  const siblingItems = parentCategory.value?.children?.length
    ? parentCategory.value.children
    : [props.category]

  if (parentCategory.value || siblingItems.length) {
    groups.push({
      title: parentCategory.value?.name ?? props.category.name,
      items: siblingItems.map(item => ({
        label: item.name,
        to: linkTarget(item.url),
        active: item.path === props.category.path,
      })),
    })
  }

  const topItems = topCategory.value.children ?? []

  if (topItems.length && topCategory.value.path !== parentCategory.value?.path) {
    groups.push({
      title: topCategory.value.name,
      items: categoryItems(topItems),
    })
  }

  return groups.filter(group => group.items.length)
})

const categoryTitle = computed(() => payload.value?.category.name ?? props.category.name)

const products = computed<CatalogProduct[]>(() => {
  return (payload.value?.products ?? []).map(productToCatalogProduct)
})

const paginationPages = computed(() => {
  const pagination = payload.value?.pagination

  if (!pagination || pagination.last_page <= 1)
    return []

  return Array.from({ length: pagination.last_page }, (_, index) => index + 1)
})

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

function pagePath(page: number): RouteLocationRaw {
  return localePath({
    path: route.path,
    query: {
      ...route.query,
      page: String(page),
    },
  })
}
</script>

<template>
  <main class="page mx-auto w-full max-w-[1344px] px-[20px] pb-[80px] pt-[28px] lg:px-0">
    <div class="container mx-auto grid grid-cols-12 gap-2">
      <div class="col-span-12 md: col-span-3">
        <nav
            class="mb-4 mt-4 text-[12px]  leading-8 text-[#303030]"
            aria-label="Breadcrumb"
        >
          <template
              v-for="(item, index) in breadcrumbItems"
              :key="item.path"
          >
            <NuxtLink
                v-if="index < breadcrumbItems.length - 1"
                :to="linkTarget(item.url)"
                class="underline"
            >
              {{ item.name }}
            </NuxtLink>
            <span v-else>{{ item.name }}</span>
            <span
                v-if="index < breadcrumbItems.length - 1"
                class="px-[5px]"
            >/</span>
          </template>
        </nav>
        <h1 class="mt-8 mb-4 text-[25px] font-semibold uppercase tracking-[0.16em]">
          {{ categoryTitle }}
        </h1>
        <CatalogSidebar :groups="sidebarGroups" />
      </div>
      <div class="col-span-12 md:col-span-9">
        <div class="mt-[29px] flex flex-col gap-[48px] lg:flex-row">
          <section class="min-w-0 flex-1">
            <CatalogFilterBar
                :filters="payload?.filters"
                :pagination="payload?.pagination"
                :sort="payload?.sort"
            />

            <p class="sr-only">
              {{ $t('catalog.category.active') }}: {{ selectedCategory }}
            </p>

            <p
                v-if="pending"
                class="mt-[24px] text-[14px] text-[#606060]"
            >
              {{ t('catalog.category.loading') }}
            </p>

            <p
                v-else-if="error"
                class="mt-[24px] text-[14px] text-[#606060]"
            >
              {{ t('catalog.category.error') }}
            </p>

            <div
                v-else-if="products.length"
                class="mt-[24px]"
            >
              <CatalogProductGrid :products="products" />

              <nav
                  v-if="paginationPages.length"
                  class="mt-10 flex items-center justify-center gap-2"
                  aria-label="Pagination"
              >
                <NuxtLink
                    v-for="page in paginationPages"
                    :key="page"
                    :to="pagePath(page)"
                    class="flex size-9 items-center justify-center border border-black text-[13px]"
                    :class="page === payload?.pagination.current_page ? 'bg-black text-white' : 'bg-white text-black'"
                >
                  {{ page }}
                </NuxtLink>
              </nav>
            </div>

            <p
                v-else
                class="mt-[24px] text-[14px] text-[#606060]"
            >
              {{ t('catalog.category.empty') }}
            </p>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>
