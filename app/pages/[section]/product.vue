<script setup lang="ts">
const route = useRoute()
const { categoryPath } = useCatalogNavigation()

const productSlug = computed(() => {
  const slug = route.query.slug

  return Array.isArray(slug) ? String(slug[0] || '') : String(slug || '')
})
</script>

<template>
  <ProductDetailView
    :slug="productSlug"
    :fallback-back-to="categoryPath('all-sale-items')"
  />
</template>
