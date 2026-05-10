<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'

defineProps<{
  product: CatalogProduct
}>()
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
          :alt="$t(product.altKey)"
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
          {{ $t(product.nameKey) }}
        </h3>
        <p class="mt-[2px] text-[13px] uppercase leading-[1.25]">
          {{ $t(product.brandKey) }}
        </p>
        <p class="mt-[7px] text-[13px] font-semibold leading-[1.25] text-[#c62118]">
          {{ $t(product.salePriceKey) }}
          <s class="ml-[6px] font-normal text-[#6f7780]">
            {{ $t(product.retailPriceKey) }}
          </s>
        </p>
      </div>
    </NuxtLink>
  </article>
</template>
