<script setup lang="ts">
const { categoryPath } = useCatalogNavigation()
</script>

<template>
  <ProductDetailView :back-to="categoryPath('all-sale-items')" />
</template>
