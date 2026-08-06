<script setup lang="ts">
import type { ProductCard } from '~/types/category-landing'
import type { CatalogSection } from '~/composables/useCatalogNavigation'
import ProductCardActions from '~/components/shared/ProductCardActions.vue'

const props = defineProps<{
  titleKey: string
  ctaLabelKey: string
  products: readonly ProductCard[]
  section?: CatalogSection
}>()

const route = useRoute()
const { t } = useI18n()
const { localizedHref } = useLocalizedHref()
const { addProductToCartBySlug } = useProductCart()
const { categoryPath, productPath, slugFromKey } = useCatalogNavigation(props.section)

const cartPendingKey = shallowRef<string | null>(null)
const cartMessageByKey = shallowRef<Record<string, string>>({})
const cartErrorByKey = shallowRef<Record<string, string>>({})

const swiperBreakpoints = {
  0: { slidesPerView: 1.35, spaceBetween: 10 },
  480: { slidesPerView: 2.1, spaceBetween: 10 },
  768: { slidesPerView: 3.2, spaceBetween: 12 },
  1024: { slidesPerView: 5, spaceBetween: 8 },
}

function productHref(product: ProductCard) {
  return product.href || productPath(product.slug || slugFromKey(product.nameKey))
}

function productCategoryHref(product: ProductCard) {
  return product.categoryHref || categoryPath(product.categorySlug || slugFromKey(product.categoryKey))
}

function productSlug(product: ProductCard) {
  return product.slug || slugFromKey(product.nameKey)
}

function productDesignHref(product: ProductCard) {
  return localizedHref(`/design/${productSlug(product)}`)
}

function productKey(product: ProductCard, index: number) {
  return `${product.nameKey}-${index}`
}

async function handleAddToCart(product: ProductCard, index: number) {
  const slug = productSlug(product)
  const key = productKey(product, index)

  if (!slug || cartPendingKey.value === key)
    return

  cartPendingKey.value = key
  cartMessageByKey.value = { ...cartMessageByKey.value, [key]: '' }
  cartErrorByKey.value = { ...cartErrorByKey.value, [key]: '' }

  try {
    const result = await addProductToCartBySlug(slug, { returnTo: route.fullPath })

    if (result.status === 'added') {
      cartMessageByKey.value = {
        ...cartMessageByKey.value,
        [key]: t('landing.card.addedToCart'),
      }
    }
  }
  catch (error) {
    const code = error instanceof Error ? error.message : ''
    cartErrorByKey.value = {
      ...cartErrorByKey.value,
      [key]: code === 'product_unavailable' || code === 'product_not_found'
        ? t('landing.card.productUnavailable')
        : t('landing.card.addToCartError'),
    }
  }
  finally {
    cartPendingKey.value = null
  }
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-[100em] flex-col justify-center px-4 sm:px-8">
    <div class="mx-auto w-full max-w-[100em] py-6 sm:py-8">
      <NuxtLink
        :to="categoryPath(slugFromKey(titleKey))"
        class="mt-4 inline-block text-black no-underline hover:no-underline sm:mt-8"
        :aria-label="$t(ctaLabelKey)"
      >
        <span class="mb-4 block h-px w-full max-w-[350px] bg-black sm:mb-5" aria-hidden="true" />
        <h2 class="text-[22px] font-bold uppercase leading-tight tracking-normal sm:text-[30px]">
          {{ $t(titleKey) }}
        </h2>
      </NuxtLink>

      <div class="relative mx-auto w-full">
        <ClientOnly>
          <swiper-container
            class="mt-6 w-full"
            slides-per-view="1.35"
            :space-between="10"
            :navigation="true"
            :breakpoints="swiperBreakpoints"
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
                    class="aspect-2/3 h-full max-h-87.5 w-full object-cover align-middle"
                    :src="product.src"
                    :srcset="product.srcset"
                    :alt="$t(product.altKey)"
                  >
                  <h3 class="mt-4 text-center text-xs font-bold leading-4.5 tracking-1">
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
                  class="block text-center text-xs font-bold leading-4.5 tracking-1 text-black no-underline hover:underline"
                  :aria-label="$t(product.ctaLabelKey)"
                >
                  {{ $t(product.priceKey) }}
                </NuxtLink>

                <ProductCardActions
                  :design-to="productDesignHref(product)"
                  :cart-pending="cartPendingKey === productKey(product, index)"
                  @add-to-cart="handleAddToCart(product, index)"
                />
                <p
                  v-if="cartMessageByKey[productKey(product, index)]"
                  class="mt-1 text-center text-[11px] font-semibold text-[#1f7a1f]"
                >
                  {{ cartMessageByKey[productKey(product, index)] }}
                </p>
                <p
                  v-if="cartErrorByKey[productKey(product, index)]"
                  class="mt-1 text-center text-[11px] font-semibold text-[#b00000]"
                >
                  {{ cartErrorByKey[productKey(product, index)] }}
                </p>
              </article>
            </swiper-slide>
          </swiper-container>

          <template #fallback>
            <div class="mt-6 flex gap-3 overflow-x-auto overscroll-x-contain pb-3 sm:gap-6">
              <article
                v-for="(product, index) in products"
                :key="`${product.nameKey}-fallback-${index}`"
                class="w-[42vw] max-w-[220px] shrink-0 text-center sm:w-[240px]"
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
                  <h3 class="mt-4 min-h-[38px] text-[13px] font-semibold leading-[1.35] sm:mt-5">
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

                <ProductCardActions
                  :design-to="productDesignHref(product)"
                  :cart-pending="cartPendingKey === productKey(product, index)"
                  @add-to-cart="handleAddToCart(product, index)"
                />
                <p
                  v-if="cartMessageByKey[productKey(product, index)]"
                  class="mt-1 text-center text-[11px] font-semibold text-[#1f7a1f]"
                >
                  {{ cartMessageByKey[productKey(product, index)] }}
                </p>
                <p
                  v-if="cartErrorByKey[productKey(product, index)]"
                  class="mt-1 text-center text-[11px] font-semibold text-[#b00000]"
                >
                  {{ cartErrorByKey[productKey(product, index)] }}
                </p>
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

@media (max-width: 767px) {
  swiper-container {
    --swiper-navigation-size: 18px;
  }
}
</style>
