<script setup lang="ts">
import type {
  LandingItem,
  LandingPage,
  LandingSection,
} from '~/types/landing-page'
import DirectionAwareHoverDemo from "~/components/shared/DirectionAwareHoverDemo.vue";
import OverlayText from "~/components/landing/OverlayText.vue";

const props = defineProps<{
  page: LandingPage
}>()

const localePath = useLocalePath()

const sections = computed(() => props.page.sections)

function linkTarget(url: string): string {
  if (/^https?:\/\//.test(url))
    return url

  return localePath(url)
}

function itemAriaLabel(item: LandingItem): string {
  return item.aria_label || item.cta_label || item.title || item.image.alt
}

function itemCtaTarget(item: LandingItem): string {
  return linkTarget(item.cta_url || item.url)
}

function hasItemOverlay(item: LandingItem): boolean {
  return Boolean(item.overlay?.text)
}

const overlayTextClass = 'max-w-[260px] rounded-md bg-black/70 p-4 text-left text-white shadow-lg backdrop-blur-sm md:p-5'

function sectionMaxWidth(section: LandingSection): string {
  return section.layout?.max_width || '1400px'
}

function aspectRatioStyle(section: LandingSection): Record<string, string> {
  const aspectRatio = section.layout?.aspect_ratio

  return aspectRatio ? { aspectRatio } : {}
}

function gridColumnsClass(section: LandingSection): string {
  const columns = section.layout?.columns_desktop

  if (columns === 2)
    return 'lg:grid-cols-2'

  if (columns === 4)
    return 'lg:grid-cols-4'

  return 'lg:grid-cols-3'
}
</script>

<template>
  <div class="page home">
    <h1 class="sr-only">
      {{ page.title }}
    </h1>

    <template
      v-for="section in sections"
      :key="section.id"
    >
      <section
        v-if="section.type === 'hero_banner'"
        class="w-full"
      >
        <div
          class="relative left-1/2 mb-[22px] w-full -translate-x-1/2"
          :style="{ maxWidth: sectionMaxWidth(section) }"
        >
          <NuxtLink
            v-for="item in section.items"
            :key="item.id"
            :to="linkTarget(item.url)"
            class="relative block"
            :aria-label="itemAriaLabel(item)"
          >
            <DirectionAwareHoverDemo
              class="relative block w-full overflow-hidden"
              :image-url="item.image.src"
              :srcset="item.image.srcset"
              :alt="item.image.alt"
              :hover-video-url="item.video_url"
              image-class="absolute left-0 top-0 h-full w-full object-contain align-middle"
              children-class="absolute inset-x-0 bottom-0 z-40 p-6 md:p-8"
              :style="aspectRatioStyle(section)"
            >
              <div
                v-if="hasItemOverlay(item)"
                :class="overlayTextClass"
              >
                <OverlayText :text="item.overlay?.text" />
              </div>
            </DirectionAwareHoverDemo>
          </NuxtLink>
        </div>
      </section>

      <section
        v-else-if="section.type === 'two_tile_grid'"
        class="mt-8 flex justify-center"
      >
        <div class="mx-auto mt-4 w-full max-w-[1400px] px-8">
          <div class="grid gap-4 pt-[2%] md:grid-cols-2">
            <article
              v-for="item in section.items"
              :key="item.id"
              class="relative mb-[58px] flex min-w-0 flex-col justify-between"
            >
              <NuxtLink
                :to="linkTarget(item.url)"
                class="flex flex-1 flex-col text-black no-underline hover:no-underline"
                :aria-label="itemAriaLabel(item)"
              >
                <div class="flex w-full flex-grow flex-col items-center justify-center pb-[15px] text-center">
                  <h2
                    v-if="item.title"
                    class="mb-0 mt-[11px] text-[18px] font-semibold uppercase leading-tight tracking-[0.142em]"
                  >
                    {{ item.title }}
                  </h2>
                  <span
                    v-if="item.cta_label"
                    class="relative text-[12px] font-semibold uppercase leading-[1.15] tracking-[0.05em] hover:underline"
                  >
                    {{ item.cta_label }}
                  </span>
                </div>

                <DirectionAwareHoverDemo
                  class="relative block w-full overflow-hidden "
                  :image-url="item.image.src"
                  :srcset="item.image.srcset"
                  :alt="item.image.alt"
                  :hover-video-url="item.video_url"
                  image-class="absolute left-0 top-0 h-full w-full object-cover align-middle"
                  children-class="absolute inset-x-0 bottom-0 z-40 p-6 md:p-8"
                  :style="aspectRatioStyle(section)"
                >
                  <div
                    v-if="hasItemOverlay(item)"
                    :class="overlayTextClass"
                  >
                    <OverlayText :text="item.overlay?.text" />
                  </div>
                </DirectionAwareHoverDemo>
              </NuxtLink>
            </article>
          </div>
        </div>
      </section>

      <section
        v-else-if="section.type === 'image_tile_grid' || section.type === 'text_kicker_grid'"
        class="flex justify-center pt-[11px]"
        :aria-labelledby="section.heading ? `landing-section-${section.id}` : undefined"
      >
        <div class="w-full max-w-[1400px] px-8">
          <div
            v-if="section.heading || section.description || section.cta"
            class="text-center"
          >
            <h2
              v-if="section.heading"
              :id="`landing-section-${section.id}`"
              class="mb-2 mt-4 text-[18px] font-semibold uppercase leading-tight tracking-[0.142em]"
            >
              {{ section.heading }}
            </h2>

            <div
              v-if="section.description || section.cta"
              class="mb-[32px]"
            >
              <p class="inline-block text-[14px] leading-[1.5] tracking-[0.05em] text-black">
                {{ section.description }}
                <template v-if="section.cta">
                  <span aria-hidden="true"> | </span>
                  <NuxtLink
                    :to="linkTarget(section.cta.url)"
                    class="inline-block font-semibold"
                  >
                    {{ section.cta.label }}
                  </NuxtLink>
                </template>
              </p>
            </div>
          </div>

          <div
            class="grid gap-x-4"
            :class="gridColumnsClass(section)"
          >
            <article
              v-for="item in section.items"
              :key="item.id"
              class="relative mb-[58px] flex min-w-0 flex-col justify-between"
            >
              <NuxtLink
                :to="linkTarget(item.url)"
                class="flex flex-1 flex-col text-black no-underline hover:no-underline"
                :aria-label="itemAriaLabel(item)"
              >
                <div class="flex w-full flex-grow flex-col items-center justify-center pb-[15px] text-center">
                  <h3
                    v-if="item.title"
                    class="m-0 text-[18px] font-semibold uppercase leading-tight tracking-[0.142em]"
                  >
                    {{ item.title }}
                  </h3>
                </div>

                <DirectionAwareHoverDemo
                  class="relative block w-full overflow-hidden"
                  :image-url="item.image.src"
                  :srcset="item.image.srcset"
                  :alt="item.image.alt"
                  :hover-video-url="item.video_url"
                  image-class="absolute left-0 top-0 h-full w-full object-cover align-middle"
                  children-class="absolute inset-x-0 bottom-0 z-40 p-6 md:p-8"
                  :style="aspectRatioStyle(section)"
                >
                  <div
                    v-if="hasItemOverlay(item)"
                    :class="overlayTextClass"
                  >
                    <OverlayText :text="item.overlay?.text" />
                  </div>
                </DirectionAwareHoverDemo>
              </NuxtLink>

              <NuxtLink
                v-if="item.cta_label"
                :to="itemCtaTarget(item)"
                class="relative mt-[4px] text-center text-[12px] font-semibold uppercase leading-[1.15] tracking-[0.05em] text-black hover:underline"
              >
                {{ item.cta_label }}
              </NuxtLink>
            </article>
          </div>
        </div>
      </section>

      <section
        v-else-if="section.type === 'promo_banner'"
        class="flex justify-center"
      >
        <div class="w-full max-w-[1400px] px-8">
          <NuxtLink
            v-for="item in section.items"
            :key="item.id"
            :to="linkTarget(item.url)"
            class="mt-[32px] block pt-[32px]"
            :aria-label="itemAriaLabel(item)"
          >
            <DirectionAwareHoverDemo
              class="relative block w-full overflow-hidden"
              :image-url="item.image.src"
              :srcset="item.image.srcset"
              :alt="item.image.alt"
              :hover-video-url="item.video_url"
              image-class="block h-auto w-full align-middle"
              children-class="absolute inset-x-0 bottom-0 z-40 p-6 md:p-8"
            >
              <div
                v-if="hasItemOverlay(item)"
                :class="overlayTextClass"
              >
                <OverlayText :text="item.overlay?.text" />
              </div>
            </DirectionAwareHoverDemo>
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>
