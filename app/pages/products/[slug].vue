<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()

const productSlug = computed(() => String(route.params.slug || ''))
</script>

<template>
  <ProductDetailView
    :slug="productSlug"
    :fallback-back-to="localePath('/')"
  />
</template>
