<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { ProductGalleryImage, ProductSizeOption } from '~/types/catalog'

defineProps<{
  backTo: RouteLocationRaw
}>()

const galleryImages: ProductGalleryImage[] = [1, 2, 3, 4, 5].map(number => ({
  src: `https://is4.revolveassets.com/images/p4/n/uv/RGBR-MZ51_V${number}.jpg`,
  srcset: `https://is4.revolveassets.com/images/p4/n/uv/RGBR-MZ51_V${number}.jpg 1x, https://is4.revolveassets.com/images/p4/n/z/RGBR-MZ51_V${number}.jpg 2x`,
  thumb: `https://is4.revolveassets.com/images/p4/n/ct/RGBR-MZ51_V${number}.jpg`,
  thumbSrcset: `https://is4.revolveassets.com/images/p4/n/ct/RGBR-MZ51_V${number}.jpg 1x, https://is4.revolveassets.com/images/p4/n/ps/RGBR-MZ51_V${number}.jpg 2x`,
  altKey: `catalog.product.gallery.views.${number}`,
}))

const sizes: ProductSizeOption[] = [
  { label: '41', disabled: true },
  { label: '42', disabled: true },
  { label: '43', disabled: true },
  { label: '44', disabled: true },
  { label: '45', selected: true },
]
</script>

<template>
  <main class="page mx-auto w-full max-w-[1344px] px-[20px] pb-[80px] pt-[28px] lg:px-0">
    <NuxtLink
      :to="backTo"
      class="text-[12px] leading-none underline"
    >
      {{ $t('catalog.product.backToResults') }}
    </NuxtLink>

    <div class="mt-[27px] flex flex-col gap-[45px] lg:flex-row lg:items-start">
      <div class="min-w-0 flex-1">
        <ProductGallery :images="galleryImages" />
      </div>

      <div class="pt-[2px]">
        <ProductInfoPanel :sizes="sizes" />
        <ProductDetailsTabs />
      </div>
    </div>
  </main>
</template>
