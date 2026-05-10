<script setup lang="ts">
import CategoryHeroSlider from '~/components/category-landing/CategoryHeroSlider.vue'
import CategoryProductCarousel from '~/components/category-landing/CategoryProductCarousel.vue'
import CategoryTileGrid from '~/components/category-landing/CategoryTileGrid.vue'

const heroSlides = [
  {
    ctaLabelKey: 'dogs.home.hero.slides.walk.ctaLabel',
    altKey: 'dogs.home.hero.slides.walk.alt',
    src: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1505&q=80',
  },
  {
    ctaLabelKey: 'dogs.home.hero.slides.cozy.ctaLabel',
    altKey: 'dogs.home.hero.slides.cozy.alt',
    src: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=1505&q=80',
  },
  {
    ctaLabelKey: 'dogs.home.hero.slides.play.ctaLabel',
    altKey: 'dogs.home.hero.slides.play.alt',
    src: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1505&q=80',
  },
] as const

const categories = [
  {
    titleKey: 'dogs.home.categories.new.title',
    ctaLabelKey: 'dogs.home.categories.new.ctaLabel',
    altKey: 'dogs.home.categories.new.alt',
    src: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'dogs.home.categories.apparel.title',
    ctaLabelKey: 'dogs.home.categories.apparel.ctaLabel',
    altKey: 'dogs.home.categories.apparel.alt',
    src: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'dogs.home.categories.walk.title',
    ctaLabelKey: 'dogs.home.categories.walk.ctaLabel',
    altKey: 'dogs.home.categories.walk.alt',
    src: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'dogs.home.categories.beds.title',
    ctaLabelKey: 'dogs.home.categories.beds.ctaLabel',
    altKey: 'dogs.home.categories.beds.alt',
    src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'dogs.home.categories.toys.title',
    ctaLabelKey: 'dogs.home.categories.toys.ctaLabel',
    altKey: 'dogs.home.categories.toys.alt',
    src: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'dogs.home.categories.grooming.title',
    ctaLabelKey: 'dogs.home.categories.grooming.ctaLabel',
    altKey: 'dogs.home.categories.grooming.alt',
    src: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=420&q=80',
  },
] as const

const products = [
  {
    nameKey: 'dogs.home.products.items.harness.name',
    categoryKey: 'dogs.home.products.items.harness.brand',
    priceKey: 'dogs.home.products.items.harness.price',
    ctaLabelKey: 'dogs.home.products.items.harness.ctaLabel',
    altKey: 'dogs.home.products.items.harness.alt',
    src: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=420&q=80',
  },
  {
    nameKey: 'dogs.home.products.items.sweater.name',
    categoryKey: 'dogs.home.products.items.sweater.brand',
    priceKey: 'dogs.home.products.items.sweater.price',
    ctaLabelKey: 'dogs.home.products.items.sweater.ctaLabel',
    altKey: 'dogs.home.products.items.sweater.alt',
    src: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=420&q=80',
  },
  {
    nameKey: 'dogs.home.products.items.leash.name',
    categoryKey: 'dogs.home.products.items.leash.brand',
    priceKey: 'dogs.home.products.items.leash.price',
    ctaLabelKey: 'dogs.home.products.items.leash.ctaLabel',
    altKey: 'dogs.home.products.items.leash.alt',
    src: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=420&q=80',
  },
  {
    nameKey: 'dogs.home.products.items.bed.name',
    categoryKey: 'dogs.home.products.items.bed.brand',
    priceKey: 'dogs.home.products.items.bed.price',
    ctaLabelKey: 'dogs.home.products.items.bed.ctaLabel',
    altKey: 'dogs.home.products.items.bed.alt',
    src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=420&q=80',
  },
] as const
</script>

<template>
  <main class="page mt-4">
    <h1 class="sr-only">
      {{ $t('dogs.home.title') }}
    </h1>

    <CategoryHeroSlider :slides="heroSlides" />
    <CategoryTileGrid :categories="categories" />
    <CategoryProductCarousel
      title-key="dogs.home.products.title"
      cta-label-key="dogs.home.products.ctaLabel"
      :products="products"
    />
  </main>
</template>
