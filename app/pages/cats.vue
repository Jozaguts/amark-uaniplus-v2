<script setup lang="ts">
import CategoryHeroSlider from '~/components/category-landing/CategoryHeroSlider.vue'
import CategoryProductCarousel from '~/components/category-landing/CategoryProductCarousel.vue'
import CategoryTileGrid from '~/components/category-landing/CategoryTileGrid.vue'

const heroSlides = [
  {
    ctaLabelKey: 'cats.home.hero.slides.lounge.ctaLabel',
    altKey: 'cats.home.hero.slides.lounge.alt',
    src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1505&q=80',
  },
  {
    ctaLabelKey: 'cats.home.hero.slides.play.ctaLabel',
    altKey: 'cats.home.hero.slides.play.alt',
    src: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1505&q=80',
  },
  {
    ctaLabelKey: 'cats.home.hero.slides.cozy.ctaLabel',
    altKey: 'cats.home.hero.slides.cozy.alt',
    src: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1505&q=80',
  },
] as const

const categories = [
  {
    titleKey: 'cats.home.categories.new.title',
    ctaLabelKey: 'cats.home.categories.new.ctaLabel',
    altKey: 'cats.home.categories.new.alt',
    src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'cats.home.categories.beds.title',
    ctaLabelKey: 'cats.home.categories.beds.ctaLabel',
    altKey: 'cats.home.categories.beds.alt',
    src: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'cats.home.categories.toys.title',
    ctaLabelKey: 'cats.home.categories.toys.ctaLabel',
    altKey: 'cats.home.categories.toys.alt',
    src: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'cats.home.categories.scratchers.title',
    ctaLabelKey: 'cats.home.categories.scratchers.ctaLabel',
    altKey: 'cats.home.categories.scratchers.alt',
    src: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'cats.home.categories.carriers.title',
    ctaLabelKey: 'cats.home.categories.carriers.ctaLabel',
    altKey: 'cats.home.categories.carriers.alt',
    src: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'cats.home.categories.grooming.title',
    ctaLabelKey: 'cats.home.categories.grooming.ctaLabel',
    altKey: 'cats.home.categories.grooming.alt',
    src: 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?auto=format&fit=crop&w=420&q=80',
  },
] as const

const products = [
  {
    nameKey: 'cats.home.products.items.bed.name',
    categoryKey: 'cats.home.products.items.bed.brand',
    priceKey: 'cats.home.products.items.bed.price',
    ctaLabelKey: 'cats.home.products.items.bed.ctaLabel',
    altKey: 'cats.home.products.items.bed.alt',
    src: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=420&q=80',
  },
  {
    nameKey: 'cats.home.products.items.tower.name',
    categoryKey: 'cats.home.products.items.tower.brand',
    priceKey: 'cats.home.products.items.tower.price',
    ctaLabelKey: 'cats.home.products.items.tower.ctaLabel',
    altKey: 'cats.home.products.items.tower.alt',
    src: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=420&q=80',
  },
  {
    nameKey: 'cats.home.products.items.teaser.name',
    categoryKey: 'cats.home.products.items.teaser.brand',
    priceKey: 'cats.home.products.items.teaser.price',
    ctaLabelKey: 'cats.home.products.items.teaser.ctaLabel',
    altKey: 'cats.home.products.items.teaser.alt',
    src: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=420&q=80',
  },
  {
    nameKey: 'cats.home.products.items.carrier.name',
    categoryKey: 'cats.home.products.items.carrier.brand',
    priceKey: 'cats.home.products.items.carrier.price',
    ctaLabelKey: 'cats.home.products.items.carrier.ctaLabel',
    altKey: 'cats.home.products.items.carrier.alt',
    src: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=420&q=80',
  },
] as const
</script>

<template>
  <main class="page mt-4">
    <h1 class="sr-only">
      {{ $t('cats.home.title') }}
    </h1>

    <CategoryHeroSlider section="cats" :slides="heroSlides" />
    <CategoryTileGrid section="cats" :categories="categories" />
    <CategoryProductCarousel
      section="cats"
      title-key="cats.home.products.title"
      cta-label-key="cats.home.products.ctaLabel"
      :products="products"
    />
  </main>
</template>
