<script setup lang="ts">
import type { ProductCard } from '~/types/category-landing'
import type { CatalogSection } from '~/composables/useCatalogNavigation'

const props = defineProps<{
  titleKey: string
  ctaLabelKey: string
  products: readonly ProductCard[]
  section?: CatalogSection
}>()

const { categoryPath, productPath, slugFromKey } = useCatalogNavigation(props.section)

function productHref(product: ProductCard) {
  return product.href || productPath(product.slug || slugFromKey(product.nameKey))
}

function productCategoryHref(product: ProductCard) {
  return product.categoryHref || categoryPath(product.categorySlug || slugFromKey(product.categoryKey))
}
</script>

<template>
  <section class="flex container px-8 mx-auto max-w-[100em] flex-col justify-center">
    <div class="container px-16 py-8 mx-auto max-w-[100em] w-full">
      <NuxtLink
        :to="categoryPath(slugFromKey(titleKey))"
        class="inline-block text-black no-underline hover:no-underline mt-8"
        :aria-label="$t(ctaLabelKey)"
      >
        <span class="mb-5 block h-px w-[350px] max-w-full bg-black" aria-hidden="true" />
        <h2 class="text-[30px] font-bold uppercase leading-tight tracking-normal">
          {{ $t(titleKey) }}
        </h2>
      </NuxtLink>

      <div class="relative w-full container mx-auto">
        <ClientOnly>
          <swiper-container
            class="mt-6 w-full"
            slides-per-view="5"
            space-between="8"
            navigation="true"
          >
            <swiper-slide
              v-for="(product, index) in products"
              :key="`${product.nameKey}-${index}`"
            >
              <article class="text-left">
                <NuxtLink
                  :to="productHref(product)"
                  class="block text-black no-underline hover:no-underline"
                  :aria-label="$t(product.ctaLabelKey)"
                >
                  <img
                    class="max-w-57.5 h-full max-h-87.5 w-full object-cover aspect-2/3 align-middle"
                    :src="product.src"
                    :srcset="product.srcset"
                    :alt="$t(product.altKey)"
                  >
                  <h3 class="text-center mt-4 text-xs leading-4.5 tracking-1 font-bold">
                    {{ $t(product.nameKey) }}
                  </h3>
                </NuxtLink>

                <NuxtLink
                  :to="productCategoryHref(product)"
                  class="block text-center text-xs leading-4.5 tracking-1 text-black no-underline hover:underline"
                >
                  {{ $t(product.categoryKey) }}
                </NuxtLink>

                <NuxtLink
                  :to="productHref(product)"
                  class="block text-center text-xs leading-4.5 tracking-1 font-bold text-black no-underline hover:underline"
                  :aria-label="$t(product.ctaLabelKey)"
                >
                  {{ $t(product.priceKey) }}
                </NuxtLink>
              </article>
            </swiper-slide>
          </swiper-container>

          <template #fallback>
            <div class="mt-6 flex gap-9 overflow-x-auto pb-3">
              <article
                v-for="(product, index) in products"
                :key="`${product.nameKey}-fallback-${index}`"
                class="w-[220px] shrink-0 text-center sm:w-[240px]"
              >
                <NuxtLink
                  :to="productHref(product)"
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
                </NuxtLink>
                <NuxtLink
                  :to="productCategoryHref(product)"
                  class="mt-1 block text-[12px] leading-tight tracking-[0.071em] text-black no-underline hover:underline"
                >
                  {{ $t(product.categoryKey) }}
                </NuxtLink>
                <NuxtLink
                  :to="productHref(product)"
                  class="mt-1 block text-[13px] font-bold leading-tight text-black no-underline hover:underline"
                  :aria-label="$t(product.ctaLabelKey)"
                >
                  {{ $t(product.priceKey) }}
                </NuxtLink>
              </article>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<style scoped>
swiper-container {
  --swiper-navigation-color: #000;
  --swiper-navigation-size: 22px;
}
</style>
