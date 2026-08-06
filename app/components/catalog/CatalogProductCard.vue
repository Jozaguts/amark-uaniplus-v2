<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'
import ProductCardActions from '~/components/shared/ProductCardActions.vue'

const props = defineProps<{
  product: CatalogProduct
}>()

const { t } = useI18n()
const route = useRoute()
const { localizedHref, designQueryPrefs, productSlugFromHref } = useLocalizedHref()
const { addProductToCartBySlug } = useProductCart()

const cartPending = shallowRef(false)
const cartMessage = shallowRef('')
const cartError = shallowRef('')

function productText(value?: string | null, key?: string): string {
  if (value)
    return value

  return key ? t(key) : ''
}

const designTo = computed(() => {
  if (props.product.designTo)
    return props.product.designTo

  if (props.product.designUrl)
    return localizedHref(props.product.designUrl)

  if (props.product.slug)
    return localizedHref(`/design/${props.product.slug}`)

  return props.product.to
})

const productSlug = computed(() => {
  if (props.product.slug)
    return props.product.slug

  return productSlugFromHref(props.product.designUrl)
    || productSlugFromHref(typeof props.product.to === 'string' ? props.product.to : null)
})

async function handleAddToCart() {
  if (cartPending.value)
    return

  const slug = productSlug.value
  cartPending.value = true
  cartMessage.value = ''
  cartError.value = ''

  try {
    if (!slug)
      throw new Error('product_not_found')

    const prefs = designQueryPrefs(props.product.designUrl)
    const result = await addProductToCartBySlug(slug, {
      colorValue: prefs.colorValue,
      sizeValue: prefs.sizeValue,
      returnTo: route.fullPath,
    })

    // Guest / 401 → redirect to login; AuthPage replays pending cart action.
    if (result.status === 'added')
      cartMessage.value = t('landing.card.addedToCart')
  }
  catch (error) {
    const code = error instanceof Error ? error.message : ''
    cartError.value = code === 'product_unavailable' || code === 'product_not_found'
      ? t('landing.card.productUnavailable')
      : t('landing.card.addToCartError')
  }
  finally {
    cartPending.value = false
  }
}
</script>

<template>
  <article class="relative text-center">
    <NuxtLink
      :to="product.to"
      class="block text-black no-underline"
    >
      <div class="relative flex aspect-[0.66] w-full items-end justify-center bg-white">
        <img
          :src="product.image"
          :srcset="product.srcset"
          :alt="productText(product.alt, product.altKey)"
          class="h-full w-full object-cover object-[2/3]"
          loading="lazy"
          width="576"
          height="864"
        >
      </div>

      <div class="mt-[15px] min-h-[65px] px-[10px]">
        <h3 class="text-[13px] font-semibold leading-[1.25]">
          {{ productText(product.name, product.nameKey) }}
        </h3>
        <p class="mt-[2px] text-[13px] uppercase leading-[1.25]">
          {{ productText(product.brand, product.brandKey) }}
        </p>
        <p class="mt-[7px] text-[13px] font-semibold leading-[1.25] text-[#c62118]">
          {{ productText(product.salePrice, product.salePriceKey) }}
          <s
            v-if="product.retailPrice || product.retailPriceKey"
            class="ml-[6px] font-normal text-[#6f7780]"
          >
            {{ productText(product.retailPrice, product.retailPriceKey) }}
          </s>
        </p>
      </div>
    </NuxtLink>

    <div class="px-[10px]">
      <ProductCardActions
        :design-to="designTo"
        :cart-pending="cartPending"
        @add-to-cart="handleAddToCart"
      />
      <p
        v-if="cartMessage"
        class="mt-1 text-[11px] font-semibold text-[#1f7a1f]"
        role="status"
      >
        {{ cartMessage }}
      </p>
      <p
        v-if="cartError"
        class="mt-1 text-[11px] font-semibold text-[#b00000]"
        role="alert"
      >
        {{ cartError }}
      </p>
    </div>
  </article>
</template>
