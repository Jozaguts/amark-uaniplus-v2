<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'

defineProps<{
  products: CatalogProduct[]
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-x-[28px] gap-y-[58px] md:grid-cols-3 xl:grid-cols-4">
    <CatalogProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
    />
  </div>
</template>
