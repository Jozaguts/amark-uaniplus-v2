<script setup lang="ts">
import type { CatalogNavigationItem } from '~/types/catalog-navigation'

const route = useRoute()
const { findByUrl, findByPath, pending } = useCatalogNavigationTree()
const { setActiveCategoryPath } = useActiveNavigation()

const section = computed(() => route.params.section as string)
const pathSegments = computed(() => {
  const p = route.params.path
  return Array.isArray(p) ? p : [p]
})

const fullUrl = computed(() => `/${section.value}/${pathSegments.value.join('/')}`)

const categoryPath = computed(() => `${section.value}/${pathSegments.value.join('/')}`)

const category = computed<CatalogNavigationItem | null>(() => {
  return findByUrl(fullUrl.value) ?? findByPath(categoryPath.value)
})

// When nav is loaded but item isn't in the tree, build a minimal item so
// CatalogCategoryPage can still call the products API using the URL path.
const syntheticCategory = computed<CatalogNavigationItem | null>(() => {
  if (pending.value || category.value) return null
  const lastSlug = pathSegments.value.at(-1) ?? ''
  return {
    id: categoryPath.value,
    name: lastSlug.replace(/-/g, ' '),
    slug: lastSlug,
    path: categoryPath.value,
    url: fullUrl.value,
    level: pathSegments.value.length + 1,
    children: [],
  }
})

const resolvedCategory = computed(() => category.value ?? syntheticCategory.value)

// Recuerda la categoría navegada para que el nav siga activo al abrir un producto.
watch(resolvedCategory, (current) => {
  if (current)
    setActiveCategoryPath(current.path)
}, { immediate: true })

useSeoMeta({
  title: computed(() => resolvedCategory.value?.name || ''),
})
</script>

<template>
  <div v-if="pending" class="flex min-h-[300px] items-center justify-center">
    <span class="text-[14px] text-[#8a8a8a]">{{ $t('catalog.category.loading') }}</span>
  </div>

  <CatalogCategoryGroups
    v-else-if="resolvedCategory"
    :category="resolvedCategory"
  />
</template>
