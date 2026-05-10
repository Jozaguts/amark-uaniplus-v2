<script setup lang="ts">
import type { HeroSlide } from '~/types/category-landing'

const props = defineProps<{
  slides: readonly HeroSlide[]
}>()

const route = useRoute()

const fallbackSlide = computed(() => props.slides[0])

function slideHref(slide?: HeroSlide) {
  return slide?.href || route.path
}
</script>

<template>
  <section class="flex container px-8 mx-auto max-w-[100em] justify-center">
    <div class="relative w-full container mx-auto px-8">
      <ClientOnly>
        <swiper-container
          slides-per-view="1"
          space-between="16"
          pagination="true"
          loop="true"
        >
          <swiper-slide
            v-for="slide in slides"
            :key="slide.src"
          >
            <NuxtLink
              :to="slideHref(slide)"
              class="block"
              :aria-label="$t(slide.ctaLabelKey)"
            >
              <img
                class="block aspect-[1505/761] h-auto w-full object-cover align-middle"
                :src="slide.src"
                :srcset="slide.srcset"
                :alt="$t(slide.altKey)"
              >
            </NuxtLink>
          </swiper-slide>
        </swiper-container>

        <template #fallback>
          <NuxtLink
            v-if="fallbackSlide"
            :to="slideHref(fallbackSlide)"
            class="block"
            :aria-label="$t(fallbackSlide.ctaLabelKey)"
          >
            <img
              class="block aspect-[1505/761] h-auto w-full object-cover align-middle"
              :src="fallbackSlide.src"
              :srcset="fallbackSlide.srcset"
              :alt="$t(fallbackSlide.altKey)"
            >
          </NuxtLink>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>

<style scoped>
swiper-container {
  --swiper-pagination-color: #000;
  --swiper-pagination-bullet-inactive-color: #000;
  --swiper-pagination-bullet-size: 7px;
}
</style>
