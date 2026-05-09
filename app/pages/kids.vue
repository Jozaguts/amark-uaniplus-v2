<script setup lang="ts">
const heroSlides = [
  {
    ctaLabelKey: 'kids.home.hero.slides.play.ctaLabel',
    altKey: 'kids.home.hero.slides.play.alt',
    src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1505&q=80',
  },
  {
    ctaLabelKey: 'kids.home.hero.slides.weekend.ctaLabel',
    altKey: 'kids.home.hero.slides.weekend.alt',
    src: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1505&q=80',
  },
  {
    ctaLabelKey: 'kids.home.hero.slides.sun.ctaLabel',
    altKey: 'kids.home.hero.slides.sun.alt',
    src: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1505&q=80',
  },
] as const

const categories = [
  {
    titleKey: 'kids.home.categories.new.title',
    ctaLabelKey: 'kids.home.categories.new.ctaLabel',
    altKey: 'kids.home.categories.new.alt',
    src: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'kids.home.categories.girls.title',
    ctaLabelKey: 'kids.home.categories.girls.ctaLabel',
    altKey: 'kids.home.categories.girls.alt',
    src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'kids.home.categories.boys.title',
    ctaLabelKey: 'kids.home.categories.boys.ctaLabel',
    altKey: 'kids.home.categories.boys.alt',
    src: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'kids.home.categories.baby.title',
    ctaLabelKey: 'kids.home.categories.baby.ctaLabel',
    altKey: 'kids.home.categories.baby.alt',
    src: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=420&q=80',
  },
  {
    titleKey: 'kids.home.categories.shoes.title',
    ctaLabelKey: 'kids.home.categories.shoes.ctaLabel',
    altKey: 'kids.home.categories.shoes.alt',
    src: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=420&q=80',
  },
] as const

const products = [
  {
    nameKey: 'kids.home.products.items.rainbow.name',
    categoryKey: 'kids.home.products.items.rainbow.brand',
    priceKey: 'kids.home.products.items.rainbow.price',
    ctaLabelKey: 'kids.home.products.items.rainbow.ctaLabel',
    altKey: 'kids.home.products.items.rainbow.alt',
    src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=420&q=80',
  },
  {
    nameKey: 'kids.home.products.items.denim.name',
    categoryKey: 'kids.home.products.items.denim.brand',
    priceKey: 'kids.home.products.items.denim.price',
    ctaLabelKey: 'kids.home.products.items.denim.ctaLabel',
    altKey: 'kids.home.products.items.denim.alt',
    src: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=420&q=80',
  },
  {
    nameKey: 'kids.home.products.items.sneaker.name',
    categoryKey: 'kids.home.products.items.sneaker.brand',
    priceKey: 'kids.home.products.items.sneaker.price',
    ctaLabelKey: 'kids.home.products.items.sneaker.ctaLabel',
    altKey: 'kids.home.products.items.sneaker.alt',
    src: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=420&q=80',
  },
  {
    nameKey: 'kids.home.products.items.romper.name',
    categoryKey: 'kids.home.products.items.romper.brand',
    priceKey: 'kids.home.products.items.romper.price',
    ctaLabelKey: 'kids.home.products.items.romper.ctaLabel',
    altKey: 'kids.home.products.items.romper.alt',
    src: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=420&q=80',
  },
  {
    nameKey: 'kids.home.products.items.romper.name',
    categoryKey: 'kids.home.products.items.romper.brand',
    priceKey: 'kids.home.products.items.romper.price',
    ctaLabelKey: 'kids.home.products.items.romper.ctaLabel',
    altKey: 'kids.home.products.items.romper.alt',
    src: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=420&q=80',
  },
] as const
</script>

<template>
  <CategoryLanding
    title-key="kids.home.title"
    :hero-slides="heroSlides"
    :categories="categories"
    products-title-key="kids.home.products.title"
    products-cta-label-key="kids.home.products.ctaLabel"
    :products="products"
  />
</template>
