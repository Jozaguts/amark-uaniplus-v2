<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'
import ProductCardActions from '~/components/shared/ProductCardActions.vue'

const props = defineProps<{
  product: CatalogProduct
}>()

const { t } = useI18n()
const localePath = useLocalePath()

function productText(value?: string | null, key?: string): string {
  if (value)
    return value

  return key ? t(key) : ''
}

const designTo = computed(() => {
  if (props.product.designTo)
    return props.product.designTo

  return props.product.to
})

const cartTo = computed(() => localePath('/order/checkout'))
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
        :cart-to="cartTo"
      />
    </div>
  </article>
</template>
