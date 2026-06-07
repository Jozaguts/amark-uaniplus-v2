<script setup lang="ts">
import type { ProductGalleryImage } from '~/types/catalog'

const props = defineProps<{
  images: ProductGalleryImage[]
}>()

const { t } = useI18n()

// La galería siempre muestra como máximo 4 imágenes (slides, paginación y
// thumbnails), aunque el backend envíe más.
const MAX_SLIDES = 4
const slides = computed<ProductGalleryImage[]>(() => props.images.slice(0, MAX_SLIDES))

const mainSwiper = ref<(HTMLElement & { swiper?: { slideTo: (index: number) => void, activeIndex: number } }) | null>(null)
const activeIndex = ref(0)

function imageAlt(image: ProductGalleryImage): string {
  if (image.alt)
    return image.alt

  return image.altKey ? t(image.altKey) : ''
}

function goTo(index: number): void {
  mainSwiper.value?.swiper?.slideTo(index)
  activeIndex.value = index
}

function onSlideChange(event: Event): void {
  const swiper = (event as CustomEvent).detail?.[0]

  if (swiper)
    activeIndex.value = swiper.activeIndex
}
</script>

<template>
  <section class="relative min-w-0">
    <ClientOnly>
      <swiper-container
        ref="mainSwiper"
        class="product-gallery-swiper w-full"
        slides-per-view="1"
        space-between="0"
        auto-height="true"
        navigation="true"
        pagination="true"
        @swiperslidechange="onSlideChange"
      >
        <swiper-slide
          v-for="image in slides"
          :key="image.src"
        >
          <div class="flex h-full items-center justify-center px-[40px] md:px-[55px]">
            <img
              :src="image.src"
              :srcset="image.srcset"
              :alt="imageAlt(image)"
              class="max-h-[420px] w-full object-contain md:max-h-[520px]"
              width="960"
              height="1450"
            >
          </div>
        </swiper-slide>
      </swiper-container>

      <template #fallback>
        <div class="flex items-center justify-center px-[40px] md:px-[55px]">
          <img
            v-if="slides[0]"
            :src="slides[0].src"
            :srcset="slides[0].srcset"
            :alt="imageAlt(slides[0])"
            class="max-h-[420px] w-full object-contain md:max-h-[520px]"
            width="960"
            height="1450"
          >
        </div>
      </template>
    </ClientOnly>

    <!-- Thumbnails sincronizados (escritorio); en móvil basta swipe + bullets -->
    <div
      v-if="slides.length > 1"
      class="mt-[24px] hidden justify-center gap-[10px] overflow-x-auto pb-[4px] md:flex"
    >
      <button
        v-for="(image, index) in slides"
        :key="image.thumb"
        type="button"
        class="grid size-[44px] shrink-0 place-items-center overflow-hidden rounded-full border bg-white transition-colors"
        :class="index === activeIndex ? 'border-black' : 'border-[#e0e0e0]'"
        :aria-label="$t('catalog.product.gallery.thumbnail', { number: index + 1 })"
        :aria-current="index === activeIndex"
        @click="goTo(index)"
      >
        <img
          :src="image.thumb"
          :srcset="image.thumbSrcset"
          :alt="imageAlt(image)"
          class="size-full object-cover"
          width="87"
          height="131"
        >
      </button>
    </div>
  </section>
</template>

<style scoped>
.product-gallery-swiper {
  --swiper-navigation-color: #000;
  --swiper-navigation-size: 24px;
  --swiper-pagination-color: #000;
  --swiper-pagination-bottom: 4px;
  padding-bottom: 28px;
}

/* Móvil: swipe + bullets de paginación; ocultamos las flechas. */
@media (max-width: 767px) {
  .product-gallery-swiper::part(button-prev),
  .product-gallery-swiper::part(button-next) {
    display: none;
  }
}

/* Escritorio: el indicador de posición son los thumbnails; ocultamos los bullets. */
@media (min-width: 768px) {
  .product-gallery-swiper::part(pagination) {
    display: none;
  }
}
</style>
