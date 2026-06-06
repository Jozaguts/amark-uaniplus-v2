<script setup lang="ts">
import type { ProductGalleryImage } from '~/types/catalog'

const props = defineProps<{
  images: ProductGalleryImage[]
}>()

const { t } = useI18n()

const thumbnailImages = computed(() => props.images.slice(0, 4))

function imageAlt(image: ProductGalleryImage): string {
  if (image.alt)
    return image.alt

  return image.altKey ? t(image.altKey) : ''
}
</script>

<template>
  <section class="relative min-w-0">
    <button
      type="button"
      class="absolute left-[28px] top-[50%] z-10 -translate-y-1/2 text-black"
      :aria-label="$t('catalog.product.gallery.previous')"
    >
      <Icon
        name="lucide:chevron-left"
        class="size-[28px]"
      />
    </button>

    <div class="grid  place-content-center grid-cols-1 items-end gap-[44px] px-[55px] md:grid-cols-2">
      <div
        v-for="image in images.slice(0, 2)"
        :key="image.src"
        class="flex  items-center justify-center"
      >
        <img
          :src="image.src"
          :srcset="image.srcset"
          :alt="imageAlt(image)"
          class="max-h-[500px] w-full object-contain object-bottom"
          width="960"
          height="1450"
        >
      </div>
    </div>

    <button
      type="button"
      class="absolute right-[20px] top-[50%] z-10 -translate-y-1/2 text-black"
      :aria-label="$t('catalog.product.gallery.next')"
    >
      <Icon
        name="lucide:chevron-right"
        class="size-[28px]"
      />
    </button>

    <div class="mt-[36px] flex justify-center gap-[10px]">
      <button
        v-for="(image, index) in thumbnailImages"
        :key="image.thumb"
        type="button"
        class="grid size-[39px] place-items-center rounded-full border bg-white"
        :class="index === 0 ? 'border-black' : 'border-[#e0e0e0]'"
        :aria-label="$t('catalog.product.gallery.thumbnail', { number: index + 1 })"
      >
        <img
          :src="image.thumb"
          :srcset="image.thumbSrcset"
          :alt="imageAlt(image)"
          class="max-h-[29px] max-w-[30px] object-contain"
          width="87"
          height="131"
        >
      </button>
    </div>
  </section>
</template>
