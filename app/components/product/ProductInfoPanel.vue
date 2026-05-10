<script setup lang="ts">
import type { ProductSizeOption } from '~/types/catalog'

defineProps<{
  sizes: ProductSizeOption[]
}>()
</script>

<template>
  <aside class="w-full max-w-[430px] shrink-0">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-[26px] font-semibold leading-[1.1]">
          {{ $t('catalog.product.detail.name') }}
        </h1>
        <p class="mt-[4px] text-[14px] leading-none">
          {{ $t('catalog.product.detail.brand') }}
        </p>
      </div>

      <button
        type="button"
        class="mt-[19px] text-black"
        :aria-label="$t('catalog.product.detail.favorite')"
      >
        <Icon
          name="lucide:heart"
          class="size-[22px]"
        />
      </button>
    </div>

    <p class="mt-[15px] flex flex-wrap items-center gap-x-[11px] gap-y-1 text-[16px] leading-none">
      <span class="font-semibold text-[#b00000]">{{ $t('catalog.product.detail.salePrice') }}</span>
      <s class="font-semibold text-[#6f7780]">{{ $t('catalog.product.detail.retailPrice') }}</s>
      <span class="text-[11px] tracking-[0.04em] text-[#6f7780]">{{ $t('catalog.product.detail.duties') }}</span>
    </p>

    <section class="mt-[20px]">
      <div class="flex flex-wrap items-baseline gap-x-[12px] gap-y-2">
        <h2 class="text-[16px] font-semibold leading-none">
          {{ $t('catalog.product.detail.sizeLabel') }}
        </h2>
        <button
          type="button"
          class="text-[11px] underline"
        >
          {{ $t('catalog.product.detail.sizeGuide') }}
        </button>
        <button
          type="button"
          class="text-[11px] underline"
        >
          {{ $t('catalog.product.detail.findSize') }}
        </button>
      </div>

      <div class="mt-[18px] flex flex-wrap gap-[8px]">
        <button
          v-for="size in sizes"
          :key="size.label"
          type="button"
          class="relative h-[34px] w-[64px] rounded-[4px] border text-[15px] leading-none"
          :class="[
            size.selected ? 'border-black bg-white text-black' : 'border-[#7c7c7c] bg-[#f7f7f7] text-[#6d6d6d]',
            size.disabled && 'text-[#8b8b8b]',
          ]"
          :disabled="size.disabled"
        >
          <span>{{ size.label }}</span>
          <span
            v-if="size.disabled"
            class="absolute left-[12px] right-[12px] top-1/2 h-px -translate-y-1/2 -rotate-[8deg] bg-[#8b8b8b]"
            aria-hidden="true"
          />
        </button>
      </div>

      <p class="mt-[20px] text-[16px] font-semibold text-[#b00000]">
        {{ $t('catalog.product.detail.inventory') }}
      </p>
    </section>

    <p class="mt-[22px] text-[17px] leading-none">
      <span class="font-semibold">{{ $t('catalog.product.detail.colorLabel') }}</span>
      <span class="ml-[8px]">{{ $t('catalog.product.detail.colorValue') }}</span>
    </p>

    <div class="mt-[21px] grid grid-cols-2 gap-[16px]">
      <button
        type="button"
        class="h-[64px] bg-black text-[15px] font-semibold uppercase tracking-[0.18em] text-white"
      >
        {{ $t('catalog.product.detail.addToBag') }}
      </button>
      <button
        type="button"
        class="h-[64px] border-2 border-black bg-white text-[15px] font-semibold uppercase tracking-[0.18em]"
      >
        {{ $t('catalog.product.detail.buyNow') }}
      </button>
    </div>

    <button
      type="button"
      class="mt-[25px] text-[18px] font-semibold leading-none"
    >
      {{ $t('catalog.product.detail.addToLists') }}
    </button>

    <div class="mt-[26px] space-y-[15px] text-[13px] leading-none">
      <p>{{ $t('catalog.product.detail.delivery') }}</p>
      <p>{{ $t('catalog.product.detail.shipping') }}</p>
    </div>
  </aside>
</template>
