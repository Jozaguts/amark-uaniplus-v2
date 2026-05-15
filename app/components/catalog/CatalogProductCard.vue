<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'

defineProps<{
  product: CatalogProduct
}>()

const { t } = useI18n()

function productText(value?: string | null, key?: string): string {
  if (value)
    return value

  return key ? t(key) : ''
}
</script>

<template>
  <article class="group relative text-center">
    <button
      type="button"
      class="absolute right-[18px] top-[18px] z-10 grid size-[32px] place-items-center rounded-full border border-[#e4e4e4] bg-white text-black"
      :aria-label="$t('catalog.category.filters.favorite')"
    >
      <Icon
        name="lucide:heart"
        class="size-[18px]"
      />
    </button>

    <NuxtLink
      :to="product.to"
      class="block text-black no-underline"
    >
      <div class="relative flex aspect-[0.66] w-full items-end justify-center bg-white">
        <img
          :src="product.image"
          :srcset="product.srcset"
          :alt="productText(product.alt, product.altKey)"
          class="h-full w-full object-contain object-bottom"
          loading="lazy"
          width="576"
          height="864"
        >

        <span class="absolute bottom-[105px] left-1/2 hidden h-[34px] w-[160px] -translate-x-1/2 items-center justify-center border border-[#d6d6d6] bg-white text-[13px] font-semibold uppercase tracking-[0.16em] group-hover:flex">
          {{ $t('catalog.category.filters.quickView') }}
        </span>
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

    <NuxtLink
      v-if="product.isDesignable && product.designTo"
      :to="product.designTo"
      class="mx-[10px] mt-[13px] flex h-[42px] items-center justify-center border border-black bg-black text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-black"
    >
      {{ $t('catalog.category.design.cta') }}
    </NuxtLink>
  </article>
</template>
