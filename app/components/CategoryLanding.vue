<script setup lang="ts">
interface LandingImage {
  altKey: string
  src: string
  srcset?: string
}

interface HeroSlide extends LandingImage {
  ctaLabelKey: string
  href?: string
}

interface CategoryTile extends LandingImage {
  titleKey: string
  ctaLabelKey: string
  href?: string
}

interface ProductCard extends LandingImage {
  nameKey: string
  categoryKey: string
  priceKey: string
  ctaLabelKey: string
  href?: string
  categoryHref?: string
}

defineProps<{
  titleKey: string
  heroSlides: readonly HeroSlide[]
  categories: readonly CategoryTile[]
  productsTitleKey: string
  productsCtaLabelKey: string
  products: readonly ProductCard[]
}>()

const route = useRoute()

function slugFromKey(key: string) {
  const parts = key.split('.')

  return parts.at(-2) || parts.at(-1) || 'item'
}

function scopedPath(segment: string) {
  return `${route.path.replace(/\/$/, '')}/${segment}`.replace(/\/{2,}/g, '/')
}

function categoryHref(category: CategoryTile) {
  return category.href || scopedPath(slugFromKey(category.titleKey))
}

function productHref(product: ProductCard) {
  return product.href || scopedPath(`products/${slugFromKey(product.nameKey)}`)
}

function productCategoryHref(product: ProductCard) {
  return product.categoryHref || scopedPath(slugFromKey(product.categoryKey))
}
</script>

<template>
  <main class="page  mt-4 ">
    <h1 class="sr-only">
      {{ $t(titleKey) }}
    </h1>

    <section class="flex container px-8 mx-auto max-w-[100em] justify-center">
      <div class="relative w-full container mx-auto px-8">
        <ClientOnly>
          <swiper-container
            slides-per-view="1"
            space-between="16"
            pagination="true"
            loop="true"
          >
            <swiper-slide
              v-for="slide in heroSlides"
              :key="slide.src"
            >
              <a
                :href="slide.href || route.path"
                class="block"
                :aria-label="$t(slide.ctaLabelKey)"
              >
                <img
                  class="block aspect-[1505/761] h-auto w-full object-cover align-middle"
                  :src="slide.src"
                  :srcset="slide.srcset"
                  :alt="$t(slide.altKey)"
                >
              </a>
            </swiper-slide>
          </swiper-container>

          <template #fallback>
            <a
              :href="heroSlides[0]?.href || route.path"
              class="block"
              :aria-label="$t(heroSlides[0]?.ctaLabelKey || titleKey)"
            >
              <img
                v-if="heroSlides[0]"
                class="block aspect-[1505/761] h-auto w-full object-cover align-middle"
                :src="heroSlides[0].src"
                :srcset="heroSlides[0].srcset"
                :alt="$t(heroSlides[0].altKey)"
              >
            </a>
          </template>
        </ClientOnly>
      </div>
    </section>

    <section class="flex px-8 mx-auto  justify-center   bg-[#f4f4f4] py-8">
      <div
          class="container px-16 py-8 mx-auto max-w-[100em] grid w-full grid-cols-2 justify-items-center gap-y-10 gap-x-4  sm:grid-cols-3 lg:grid-cols-5">
        <a
          v-for="category in categories"
          :key="category.titleKey"
          :href="categoryHref(category)"
          class="group block w-full text-center text-black no-underline hover:no-underline"
          :aria-label="$t(category.ctaLabelKey)"
        >
          <img
            class="block h-75 w-full rounded  object-cover align-middle"
            :src="category.src"
            :srcset="category.srcset"
            :alt="$t(category.altKey)"
          >
          <h2 class="mt-3 text-[15px] font-bold uppercase leading-tight tracking-normal group-hover:underline">
            {{ $t(category.titleKey) }}
          </h2>
        </a>
      </div>
    </section>

    <section class="flex container px-8 mx-auto max-w-[100em flex-col justify-center">
      <div class="container px-16 py-8 mx-auto max-w-[100em] w-full">
        <a
            href="#"
            class="inline-block text-black no-underline hover:no-underline mt-8"
            :aria-label="$t(productsCtaLabelKey)"
        >
          <span class="mb-5 block h-px w-[350px] max-w-full bg-black" aria-hidden="true" />
          <h2 class="text-[30px] font-bold uppercase leading-tight tracking-normal">
            {{ $t(productsTitleKey) }}
          </h2>
        </a>
        <div class="relative w-full container mx-auto">
          <ClientOnly>
            <swiper-container
                class="mt-6 w-full"
                slides-per-view="5"
                space-between="8"
                navigation="true"
            >
              <swiper-slide
                  v-for="product in products"
                  :key="product.nameKey"
                  class=""
              >
                <article class="text-left">
                  <a
                      :href="productHref(product)"
                      class="block text-black no-underline hover:no-underline"
                      :aria-label="$t(product.ctaLabelKey)"
                  >
                    <img
                        class="max-w-57.5 h-full max-h-87.5 w-full object-cover aspect-2/3 align-middle"
                        :src="product.src"
                        :srcset="product.srcset"
                        :alt="$t(product.altKey)"
                    >
                    <h3 class="text-center mt-4 text-xs leading-4.5  tracking-1 font-bold">
                      {{ $t(product.nameKey) }}
                    </h3>
                  </a>

                  <a
                      :href="productCategoryHref(product)"
                      class="block text-center text-xs leading-4.5 tracking-1  text-black no-underline hover:underline"
                  >
                    {{ $t(product.categoryKey) }}
                  </a>

                  <a
                      :href="productHref(product)"
                      class="block text-center text-xs leading-4.5  tracking-1 font-bold text-black no-underline hover:underline"
                      :aria-label="$t(product.ctaLabelKey)"
                  >
                    {{ $t(product.priceKey) }}
                  </a>
                </article>
              </swiper-slide>
            </swiper-container>

            <template #fallback>
              <div class="mt-6 flex gap-9 overflow-x-auto pb-3">
                <article
                    v-for="product in products"
                    :key="product.nameKey"
                    class="w-[220px] shrink-0 text-center sm:w-[240px]"
                >
                  <a
                      :href="productHref(product)"
                      class="block text-black no-underline hover:no-underline"
                      :aria-label="$t(product.ctaLabelKey)"
                  >
                    <img
                        class="block aspect-[304/456] w-full object-cover align-middle"
                        :src="product.src"
                        :srcset="product.srcset"
                        :alt="$t(product.altKey)"
                    >
                    <h3 class="mt-5 min-h-[38px] text-[13px] font-semibold leading-[1.35]">
                      {{ $t(product.nameKey) }}
                    </h3>
                  </a>
                  <a
                      :href="productCategoryHref(product)"
                      class="mt-1 block text-[12px] leading-tight tracking-[0.071em] text-black no-underline hover:underline"
                  >
                    {{ $t(product.categoryKey) }}
                  </a>
                  <a
                      :href="productHref(product)"
                      class="mt-1 block text-[13px] font-bold leading-tight text-black no-underline hover:underline"
                      :aria-label="$t(product.ctaLabelKey)"
                  >
                    {{ $t(product.priceKey) }}
                  </a>
                </article>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
swiper-container {
  --swiper-navigation-color: #000;
  --swiper-navigation-size: 22px;
  --swiper-pagination-color: #000;
  --swiper-pagination-bullet-inactive-color: #000;
  --swiper-pagination-bullet-size: 7px;
}
</style>
