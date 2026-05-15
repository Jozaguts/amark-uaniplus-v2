<script setup lang="ts">
import type {
  CatalogProductsColorOption,
  CatalogProductsFilters,
  CatalogProductsOption,
  CatalogProductsPagination,
  CatalogProductsSort,
} from '~/types/catalog-products'

const props = defineProps<{
  filters?: CatalogProductsFilters | null
  pagination?: CatalogProductsPagination | null
  sort?: CatalogProductsSort
}>()

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const openFilter = shallowRef<'price' | 'size' | 'color' | null>(null)

const priceMin = shallowRef(0)
const priceMax = shallowRef(0)

const priceFilter = computed(() => props.filters?.price ?? null)

const selectedSizes = computed(() => queryValues('sizes'))

const selectedColors = computed(() => queryValues('colors'))

const itemCount = computed(() => {
  const total = props.pagination?.total ?? 0

  return t('catalog.category.items', { count: new Intl.NumberFormat().format(total) })
})

watch(
  priceFilter,
  (price) => {
    priceMin.value = Number(route.query.price_min ?? price?.selected_min ?? price?.min ?? 0)
    priceMax.value = Number(route.query.price_max ?? price?.selected_max ?? price?.max ?? 0)
  },
  { immediate: true },
)

function queryValues(key: string): string[] {
  const rawValue = route.query[key]

  if (Array.isArray(rawValue))
    return rawValue.filter((value): value is string => typeof value === 'string')

  return typeof rawValue === 'string' && rawValue ? [rawValue] : []
}

function toggleFilter(filter: 'price' | 'size' | 'color'): void {
  openFilter.value = openFilter.value === filter ? null : filter
}

function queryWith(nextQuery: Record<string, string | string[] | number | null | undefined>) {
  const query = { ...route.query }

  for (const [key, value] of Object.entries(nextQuery)) {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length))
      delete query[key]
    else
      query[key] = value
  }

  query.page = '1'

  return localePath({ path: route.path, query })
}

function toggleMultiValue(key: 'sizes' | 'colors', value: string) {
  const values = new Set(queryValues(key))

  if (values.has(value))
    values.delete(value)
  else
    values.add(value)

  return queryWith({ [key]: [...values] })
}

function applyPricePath() {
  return queryWith({
    price_min: priceMin.value,
    price_max: priceMax.value,
  })
}

function optionClass(option: CatalogProductsOption): string {
  return option.is_available === false
    ? 'border-[#9c9c9c] bg-[#f3f3f3] text-[#7f7f7f] line-through'
    : 'border-black bg-white text-black hover:bg-black hover:text-white'
}

function colorSwatchStyle(option: CatalogProductsColorOption): Record<string, string> {
  if (option.image) {
    return {
      backgroundImage: `url(${option.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  return { backgroundColor: option.hex || 'transparent' }
}
</script>

<template>
  <div class="relative w-full">
    <div class="flex min-h-[44px] flex-col gap-4 border-b border-[#eaeaea] pb-[11px] md:flex-row md:items-center md:justify-between">
      <div class="flex flex-wrap items-center gap-x-[24px] gap-y-3">
        <button
          type="button"
          class="flex items-center gap-[8px] text-[16px] leading-none text-black"
          @click="toggleFilter('price')"
        >
          <span>{{ t('catalog.category.filters.price') }}</span>
          <span class="text-[#555]">—</span>
          <Icon
            name="lucide:chevron-down"
            class="size-[14px]"
          />
        </button>

        <button
          type="button"
          class="flex items-center gap-[8px] text-[16px] leading-none text-black"
          @click="toggleFilter('size')"
        >
          <span>{{ t('catalog.category.filters.size') }}</span>
          <span class="text-[#555]">—</span>
          <Icon
            name="lucide:chevron-down"
            class="size-[14px]"
          />
        </button>

        <button
          type="button"
          class="flex items-center gap-[8px] text-[16px] leading-none text-black"
          @click="toggleFilter('color')"
        >
          <span>{{ t('catalog.category.filters.color') }}</span>
          <span class="text-[#555]">—</span>
          <Icon
            name="lucide:chevron-down"
            class="size-[14px]"
          />
        </button>
      </div>
    </div>

    <div
      v-if="openFilter"
      class="absolute left-0 right-0 top-[43px] z-20 border border-[#d9d9d9] bg-white px-6 py-6 shadow-sm"
    >
      <div v-if="openFilter === 'price' && priceFilter">
        <h2 class="mb-3 text-[14px] font-semibold uppercase tracking-[0.04em]">
          {{ t('catalog.category.filters.price') }}
        </h2>
        <div class="grid max-w-[560px] gap-5 md:grid-cols-2">
          <label class="text-[13px] font-semibold uppercase tracking-[0.04em]">
            {{ t('catalog.category.filters.min') }}
            <input
              v-model.number="priceMin"
              type="range"
              :min="priceFilter.min"
              :max="priceFilter.max"
              class="mt-3 w-full accent-black"
            >
            <span class="mt-2 block text-[14px] font-normal normal-case tracking-normal">
              {{ priceMin }} {{ priceFilter.currency }}
            </span>
          </label>
          <label class="text-[13px] font-semibold uppercase tracking-[0.04em]">
            {{ t('catalog.category.filters.max') }}
            <input
              v-model.number="priceMax"
              type="range"
              :min="priceFilter.min"
              :max="priceFilter.max"
              class="mt-3 w-full accent-black"
            >
            <span class="mt-2 block text-[14px] font-normal normal-case tracking-normal">
              {{ priceMax }} {{ priceFilter.currency }}
            </span>
          </label>
        </div>
        <NuxtLink
          :to="applyPricePath()"
          class="mt-10 flex h-[45px] w-[308px] items-center justify-center bg-black text-[13px] font-semibold uppercase tracking-[0.18em] text-white"
          @click="openFilter = null"
        >
          {{ t('catalog.category.filters.done') }}
        </NuxtLink>
      </div>

      <div v-else-if="openFilter === 'size'">
        <h2 class="mb-3 text-[14px] font-semibold uppercase tracking-[0.04em]">
          {{ t('catalog.category.filters.size') }}
        </h2>
        <div class="grid gap-2 md:grid-cols-3">
          <template
            v-for="size in filters?.sizes ?? []"
            :key="size.value"
          >
            <span
              v-if="size.is_available === false"
              class="flex h-[44px] items-center justify-center rounded-[4px] border text-[14px]"
              :class="optionClass(size)"
            >
              {{ size.label }}
            </span>
            <NuxtLink
              v-else
              :to="toggleMultiValue('sizes', size.value)"
              class="flex h-[44px] items-center justify-center rounded-[4px] border text-[14px]"
              :class="[optionClass(size), selectedSizes.includes(size.value) && 'ring-2 ring-black']"
              @click="openFilter = null"
            >
              {{ size.label }}
            </NuxtLink>
          </template>
        </div>
      </div>

      <div v-else-if="openFilter === 'color'">
        <h2 class="mb-3 text-[14px] font-semibold uppercase tracking-[0.04em]">
          {{ t('catalog.category.filters.color') }}
        </h2>
        <div class="grid gap-x-12 gap-y-5 md:grid-cols-5">
          <template
            v-for="color in filters?.colors ?? []"
            :key="color.value"
          >
            <span
              v-if="color.is_available === false"
              class="flex items-center gap-3 text-[15px] text-[#8a8a8a] line-through"
            >
              <span
                class="block size-[31px] rounded-full border border-[#e1e1e1]"
                :style="colorSwatchStyle(color)"
              />
              <span>{{ color.label }}</span>
            </span>
            <NuxtLink
              v-else
              :to="toggleMultiValue('colors', color.value)"
              class="flex items-center gap-3 text-[15px]"
              :class="selectedColors.includes(color.value) && 'font-semibold'"
              @click="openFilter = null"
            >
              <span
                class="block size-[31px] rounded-full border border-[#e1e1e1]"
                :style="colorSwatchStyle(color)"
              />
              <span>{{ color.label }}</span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>

    <div class="mt-[21px] flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p class="text-[13px] font-semibold uppercase tracking-[0.035em]">
        {{ itemCount }}
      </p>

      <div class="flex flex-wrap items-center gap-x-[22px] gap-y-3 text-[16px] leading-none">
        <select
          class="bg-transparent"
          :value="sort?.selected"
          @change="navigateTo(queryWith({ sort: ($event.target as HTMLSelectElement).value }))"
        >
          <option
            v-for="option in sort?.options ?? []"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <span>{{ t('catalog.category.filters.viewCount', { count: 12 }) }}</span>
      </div>
    </div>
  </div>
</template>
