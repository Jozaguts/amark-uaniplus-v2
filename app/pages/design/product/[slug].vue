<script setup lang="ts">
const route = useRoute()

const productSlug = computed(() => String(route.params.slug || ''))

await navigateTo({
  path: `/design/${productSlug.value}`,
  query: route.query,
}, { replace: true })
</script>

<template>
  <div />
</template>
