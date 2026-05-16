<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { ProductDetail, ProductOption } from '~/types/product-detail'

const props = defineProps<{
  product: ProductDetail
  designTo?: RouteLocationRaw
}>()

const selectedColor = computed(() => {
  return props.product.options?.colors?.find(color => color.is_selected) ?? props.product.options?.colors?.[0] ?? null
})

const sizes = computed(() => props.product.options?.sizes ?? [])

function sizeClass(size: ProductOption): string {
  if (size.is_available === false)
    return 'border-[#7c7c7c] bg-[#f7f7f7] text-[#8b8b8b]'

  return size.is_selected
    ? 'border-black bg-white text-black'
    : 'border-[#7c7c7c] bg-[#f7f7f7] text-[#6d6d6d]'
}
</script>

<template>
  <aside class="w-full max-w-[430px] shrink-0">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-[26px] font-semibold leading-[1.1]">
          {{ product.name }}
        </h1>
        <p
          v-if="product.brand"
          class="mt-[4px] text-[14px] leading-none"
        >
          {{ product.brand }}
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
      <span class="font-semibold text-[#b00000]">{{ product.price.formatted }}</span>
      <s
        v-if="product.price.compare_at_formatted"
        class="font-semibold text-[#6f7780]"
      >
        {{ product.price.compare_at_formatted }}
      </s>
      <span
        v-if="product.shipping?.duties_label"
        class="text-[11px] tracking-[0.04em] text-[#6f7780]"
      >
        {{ product.shipping.duties_label }}
      </span>
    </p>

    <section
      v-if="sizes.length"
      class="mt-[20px]"
    >
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
          :key="size.value"
          type="button"
          class="relative h-[34px] min-w-[64px] rounded-[4px] border px-3 text-[15px] leading-none"
          :class="sizeClass(size)"
          :disabled="size.is_available === false"
        >
          <span>{{ size.label }}</span>
          <span
            v-if="size.is_available === false"
            class="absolute left-[12px] right-[12px] top-1/2 h-px -translate-y-1/2 -rotate-[8deg] bg-[#8b8b8b]"
            aria-hidden="true"
          />
        </button>
      </div>
    </section>

    <p
      v-if="product.inventory?.label"
      class="mt-[20px] text-[16px] font-semibold text-[#b00000]"
    >
      {{ product.inventory.label }}
    </p>

    <p
      v-if="selectedColor"
      class="mt-[22px] text-[17px] leading-none"
    >
      <span class="font-semibold">{{ $t('catalog.product.detail.colorLabel') }}</span>
      <span class="ml-[8px]">{{ selectedColor.label }}</span>
    </p>

    <div class="mt-[21px] grid grid-cols-2 gap-[16px]">
      <button
        type="button"
        class="h-[64px] bg-black text-[15px] font-semibold uppercase tracking-[0.18em] text-white disabled:bg-[#8b8b8b]"
        :disabled="!product.is_available"
      >
        {{ $t('catalog.product.detail.addToBag') }}
      </button>
      <button
        type="button"
        class="h-[64px] border-2 border-black bg-white text-[15px] font-semibold uppercase tracking-[0.18em] disabled:border-[#8b8b8b] disabled:text-[#8b8b8b]"
        :disabled="!product.is_available"
      >
        {{ $t('catalog.product.detail.buyNow') }}
      </button>
    </div>

    <NuxtLink
      v-if="product.is_designable && designTo"
      :to="designTo"
      class="mt-[16px] flex h-[54px] items-center justify-center border-2 border-black bg-white text-[14px] font-semibold uppercase tracking-[0.18em] text-black"
    >
      {{ $t('catalog.category.design.cta') }}
    </NuxtLink>

    <button
      type="button"
      class="mt-[25px] text-[18px] font-semibold leading-none"
    >
      {{ $t('catalog.product.detail.addToLists') }}
    </button>

    <div class="mt-[26px] space-y-[15px] text-[13px] leading-none">
      <p v-if="product.shipping?.delivery_label">
        {{ product.shipping.delivery_label }}
      </p>
      <p v-if="product.shipping?.shipping_label">
        {{ product.shipping.shipping_label }}
      </p>
    </div>
  </aside>
</template>
