<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { ProductDetail, ProductOption } from '~/types/product-detail'

const props = defineProps<{
  product: ProductDetail
  designTo?: RouteLocationRaw
}>()

const route = useRoute()
const { t } = useI18n()
const { addProductToCart } = useProductCart()
const addToBagPending = shallowRef(false)
const addToBagMessage = shallowRef('')
const addToBagError = shallowRef('')
const selectedColorValue = shallowRef('')
const selectedSizeValue = shallowRef('')

const selectedColor = computed(() => {
  return availableColors.value.find(color => color.value === selectedColorValue.value)
    ?? availableColors.value.find(color => color.is_selected)
    ?? availableColors.value[0]
    ?? null
})

const availableColors = computed(() => {
  return props.product.options?.colors?.filter(color => color.is_available !== false) ?? []
})

const sizes = computed(() => props.product.options?.sizes ?? [])

const selectedSize = computed(() => {
  return sizes.value.find(size => size.value === selectedSizeValue.value && size.is_available !== false)
    ?? sizes.value.find(size => size.is_selected && size.is_available !== false)
    ?? sizes.value.find(size => size.is_available !== false)
    ?? null
})

watch(
  () => props.product.slug,
  () => {
    selectedColorValue.value = availableColors.value.find(color => color.is_selected)?.value
      ?? availableColors.value[0]?.value
      ?? ''
    selectedSizeValue.value = sizes.value.find(size => size.is_selected && size.is_available !== false)?.value
      ?? sizes.value.find(size => size.is_available !== false)?.value
      ?? ''
    addToBagMessage.value = ''
    addToBagError.value = ''
  },
  { immediate: true },
)

function colorSwatchStyle(color: ProductOption): Record<string, string> {
  return {
    backgroundColor: color.hex || '#f4f4f4',
  }
}

function sizeClass(size: ProductOption): string {
  if (size.is_available === false)
    return 'border-[#7c7c7c] bg-[#f7f7f7] text-[#8b8b8b]'

  return size.value === selectedSize.value?.value
    ? 'border-black bg-white text-black'
    : 'border-[#7c7c7c] bg-[#f7f7f7] text-[#6d6d6d]'
}

function selectColor(color: ProductOption) {
  selectedColorValue.value = color.value
  addToBagMessage.value = ''
  addToBagError.value = ''
}

function selectSize(size: ProductOption) {
  if (size.is_available === false)
    return

  selectedSizeValue.value = size.value
  addToBagMessage.value = ''
  addToBagError.value = ''
}

async function handleAddToBag() {
  if (!props.product.is_available || addToBagPending.value)
    return

  addToBagMessage.value = ''
  addToBagError.value = ''
  addToBagPending.value = true

  try {
    const result = await addProductToCart(props.product, {
      colorValue: selectedColor.value?.value,
      sizeValue: selectedSize.value?.value,
      returnTo: route.fullPath,
    })

    if (result.status === 'added')
      addToBagMessage.value = t('catalog.product.detail.addedToBag')
  } catch (error) {
    const storefrontError = error as { data?: { message?: string } }
    addToBagError.value = storefrontError?.data?.message ?? t('catalog.product.detail.addToBagError')
  } finally {
    addToBagPending.value = false
  }
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

    <section v-if="selectedColor || availableColors.length" class="mt-[22px]">
      <p
        v-if="selectedColor"
        class="text-[17px] leading-none"
      >
        <span class="font-semibold">{{ $t('catalog.product.detail.colorLabel') }}</span>
        <span class="ml-[8px]">{{ selectedColor.label }}</span>
      </p>

      <div
        v-if="availableColors.length"
        class="mt-[16px] flex flex-wrap gap-[9px]"
      >
        <button
          v-for="color in availableColors"
          :key="color.value"
          type="button"
          class="grid size-[31px] place-items-center rounded-full border"
          :class="color.value === selectedColor?.value ? 'border-black' : 'border-transparent'"
          :aria-label="$t('catalog.product.detail.colorOption', { color: color.label })"
          @click="selectColor(color)"
        >
          <span
            class="block size-[28px] rounded-full border border-[#e3e3e3]"
            :style="colorSwatchStyle(color)"
            aria-hidden="true"
          />
        </button>
      </div>
    </section>

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
          class="relative h-[34px] min-w-[64px] rounded-[4px] border px-3 text-[15px] leading-none enabled:cursor-pointer disabled:cursor-not-allowed"
          :class="sizeClass(size)"
          :disabled="size.is_available === false"
          @click="selectSize(size)"
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

    <div class="mt-[21px] grid gap-[24px]">
      <button
        type="button"
        class="h-[64px] cursor-pointer bg-black text-[15px] font-semibold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:bg-[#8b8b8b]"
        :disabled="!product.is_available || addToBagPending"
        @click="handleAddToBag"
      >
        {{ addToBagPending ? $t('catalog.product.detail.addToBagPending') : $t('catalog.product.detail.addToBag') }}
      </button>
      <button
        type="button"
        class="h-[64px] border-2 border-black bg-white text-[15px] font-semibold uppercase tracking-[0.18em] disabled:border-[#8b8b8b] disabled:text-[#8b8b8b]"
        :disabled="!product.is_available"
      >
        {{ $t('catalog.product.detail.buyNow') }}
      </button>
    </div>

    <p
      v-if="addToBagMessage"
      class="mt-[12px] text-[13px] font-semibold text-[#1f7a1f]"
    >
      {{ addToBagMessage }}
    </p>

    <p
      v-if="addToBagError"
      class="mt-[12px] text-[13px] font-semibold text-[#b00000]"
    >
      {{ addToBagError }}
    </p>

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
