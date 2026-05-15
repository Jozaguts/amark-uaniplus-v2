<script setup lang="ts">
const route = useRoute()
const { findByPath } = useCatalogNavigationTree()

const section = computed(() => String(route.params.section ?? 'fashion'))
const requestedCategory = computed(() => String(route.query.category || 'trending'))
const categoryPath = computed(() => `${section.value}/${requestedCategory.value}`)
const category = computed(() => findByPath(categoryPath.value) ?? findByPath(section.value))

useSeoMeta({
  title: computed(() => category.value?.name ?? ''),
})
</script>

<template>
  <CatalogCategoryPage
    v-if="category"
    :category="category"
  />
</template>
