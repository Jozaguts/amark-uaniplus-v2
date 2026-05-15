<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <ProductDetailView :back-to="localePath('/')" />
</template>
