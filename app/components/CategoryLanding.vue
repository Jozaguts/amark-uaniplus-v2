<script setup lang="ts">
import CategoryHeroSlider from '~/components/category-landing/CategoryHeroSlider.vue'
import CategoryProductCarousel from '~/components/category-landing/CategoryProductCarousel.vue'
import CategoryTileGrid from '~/components/category-landing/CategoryTileGrid.vue'
import type { CategoryTile, HeroSlide, ProductCard } from '~/types/category-landing'

defineProps<{
  titleKey: string
  heroSlides: readonly HeroSlide[]
  categories: readonly CategoryTile[]
  productsTitleKey: string
  productsCtaLabelKey: string
  products: readonly ProductCard[]
}>()
</script>

<template>
  <main class="page mt-4">
    <h1 class="sr-only">
      {{ $t(titleKey) }}
    </h1>

    <CategoryHeroSlider :slides="heroSlides" />
    <CategoryTileGrid :categories="categories" />
    <CategoryProductCarousel
      :title-key="productsTitleKey"
      :cta-label-key="productsCtaLabelKey"
      :products="products"
    />
  </main>
</template>
