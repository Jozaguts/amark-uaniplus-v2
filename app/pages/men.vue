<script setup lang="ts">
const topTiles = [
  {
    altKey: 'men.home.topTiles.sale.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050726_RM_Sale_HP.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050726_RM_Sale_HP.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050726_RM_Sale_HP_2x.jpg 2x',
  },
  {
    altKey: 'men.home.topTiles.golf.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RM_GolfShop_HP_r.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RM_GolfShop_HP_r.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050426_RM_GolfShop_HP_2x_r.jpg 2x',
  },
] as const

const featureSections = [
  {
    titleKey: 'men.home.features.newArrivals.title',
    descriptionKey: 'men.home.features.newArrivals.description',
    ctaKey: 'men.home.cta.shopNow',
    ctaLabelKey: 'men.home.features.newArrivals.ctaLabel',
    altKey: 'men.home.features.newArrivals.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_NewArrivals_HP.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_NewArrivals_HP.jpg 1x, https://is4.revolveassets.com/images/up/2026/April/050426_RM_NewArrivals_HP_2x.jpg 2x',
  },
  {
    titleKey: 'men.home.features.newProportions.title',
    descriptionKey: 'men.home.features.newProportions.description',
    ctaKey: 'men.home.cta.shopEdit',
    ctaLabelKey: 'men.home.features.newProportions.ctaLabel',
    altKey: 'men.home.features.newProportions.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_NewProportions_HP.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_NewProportions_HP.jpg 1x, https://is4.revolveassets.com/images/up/2026/April/050426_RM_NewProportions_HP_2x.jpg 2x',
  },
  {
    titleKey: 'men.home.features.northFace.title',
    descriptionKey: 'men.home.features.northFace.description',
    ctaKey: 'men.home.cta.shopCollection',
    ctaLabelKey: 'men.home.features.northFace.ctaLabel',
    altKey: 'men.home.features.northFace.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_NorthFace_HP.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_NorthFace_HP.jpg 1x, https://is4.revolveassets.com/images/up/2026/April/050426_RM_NorthFace_HP_2x.jpg 2x',
  },
] as const

const categoryRows = [
  [
    {
      titleKey: 'men.home.categories.shorts.title',
      ctaLabelKey: 'men.home.categories.shorts.ctaLabel',
      altKey: 'men.home.categories.shorts.alt',
      src: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Shorts_HP_2x.jpg',
      srcset: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Shorts_HP_2x.jpg 1x, https://is4.revolveassets.com/images/up/2026/April/050426_RM_Shorts_HP_2x.jpg 2x',
    },
    {
      titleKey: 'men.home.categories.swim.title',
      ctaLabelKey: 'men.home.categories.swim.ctaLabel',
      altKey: 'men.home.categories.swim.alt',
      src: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Swim_HP_2x.jpg',
      srcset: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Swim_HP_2x.jpg 1x, https://is4.revolveassets.com/images/up/2026/April/050426_RM_Swim_HP_2x.jpg 2x',
    },
    {
      titleKey: 'men.home.categories.polos.title',
      ctaLabelKey: 'men.home.categories.polos.ctaLabel',
      altKey: 'men.home.categories.polos.alt',
      src: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Polos_HP_2x.jpg',
      srcset: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Polos_HP_2x.jpg 1x, https://is4.revolveassets.com/images/up/2026/April/050426_RM_Polos_HP_2x.jpg 2x',
    },
  ],
  [
    {
      titleKey: 'men.home.categories.hats.title',
      ctaLabelKey: 'men.home.categories.hats.ctaLabel',
      altKey: 'men.home.categories.hats.alt',
      src: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Hats_HP_2x.jpg',
      srcset: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Hats_HP_2x.jpg 1x, https://is4.revolveassets.com/images/up/2026/April/050426_RM_Hats_HP_2x.jpg 2x',
    },
    {
      titleKey: 'men.home.categories.tees.title',
      ctaLabelKey: 'men.home.categories.tees.ctaLabel',
      altKey: 'men.home.categories.tees.alt',
      src: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Tees_HP_2x.jpg',
      srcset: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Tees_HP_2x.jpg 1x, https://is4.revolveassets.com/images/up/2026/April/050426_RM_Tees_HP_2x.jpg 2x',
    },
    {
      titleKey: 'men.home.categories.shirts.title',
      ctaLabelKey: 'men.home.categories.shirts.ctaLabel',
      altKey: 'men.home.categories.shirts.alt',
      src: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Shirts_HP_2x.jpg',
      srcset: 'https://is4.revolveassets.com/images/up/2026/April/050426_RM_Shirts_HP_2x.jpg 1x, https://is4.revolveassets.com/images/up/2026/April/050426_RM_Shirts_HP_2x.jpg 2x',
    },
  ],
] as const
</script>

<template>
  <div class="page home pt-[153px]">
    <h1 class="sr-only">
      {{ $t('men.home.title') }}
    </h1>

    <section class="flex justify-center">
      <div class="mt-[1%] grid w-full max-w-[1400px] grid-cols-1 gap-4 px-8 md:grid-cols-2">
        <a
          v-for="tile in topTiles"
          :key="tile.altKey"
          href="#"
          :aria-label="$t(tile.altKey)"
        >
          <img
            class="block aspect-[660/880] h-auto w-full object-cover align-middle"
            :src="tile.src"
            :srcset="tile.srcset"
            :alt="$t(tile.altKey)"
          >
        </a>
      </div>
    </section>

    <section
      v-for="(feature, index) in featureSections"
      :key="feature.titleKey"
      class="mt-[32px] flex justify-center"
    >
      <div class="w-full max-w-[1400px] px-8">
        <div class="mt-[16px] pb-0">
          <h2 class="text-[20px] font-semibold uppercase leading-tight tracking-[0.071em]">
            {{ $t(feature.titleKey) }}
          </h2>
          <div class="mb-[16px] flex flex-wrap items-center gap-x-3 gap-y-1">
            <p class="m-0 text-[14px] leading-[1.5]">
              {{ $t(feature.descriptionKey) }}
            </p>
            <a
              href="#"
              class="text-[14px] font-semibold uppercase leading-none tracking-[0.071em] underline-offset-2 hover:underline"
              :aria-label="$t(feature.ctaLabelKey)"
            >
              <span class="sr-only">{{ $t(feature.titleKey) }}</span>
              {{ $t(feature.ctaKey) }}
            </a>
          </div>
        </div>

        <a
          href="#"
          :aria-label="$t(feature.ctaLabelKey)"
        >
          <img
            class="block aspect-[1334/880] h-auto w-full object-cover align-middle"
            :src="feature.src"
            :srcset="feature.srcset"
            :alt="$t(feature.altKey)"
          >
        </a>

        <div
          v-if="index === 1"
          class="grid grid-cols-1 gap-4 pt-[32px] md:grid-cols-3"
        >
          <article
            v-for="item in categoryRows[0]"
            :key="item.titleKey"
          >
            <h2 class="text-[20px] font-semibold uppercase leading-tight tracking-[0.071em]">
              {{ $t(item.titleKey) }}
            </h2>
            <a
              href="#"
              class="mb-[8px] block text-[14px] font-semibold uppercase leading-none tracking-[0.071em] underline-offset-2 hover:underline"
              :aria-label="$t(item.ctaLabelKey)"
            >
              <span class="sr-only">{{ $t(item.titleKey) }}</span>
              {{ $t('men.home.cta.shopNow') }}
            </a>
            <a
              href="#"
              :aria-label="$t(item.ctaLabelKey)"
            >
              <img
                class="block aspect-[434/580] h-auto w-full object-cover align-middle"
                :src="item.src"
                :srcset="item.srcset"
                :alt="$t(item.altKey)"
              >
            </a>
          </article>
        </div>

        <div
          v-if="index === 2"
          class="mt-[32px] grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <article
            v-for="item in categoryRows[1]"
            :key="item.titleKey"
          >
            <h2 class="text-[20px] font-semibold uppercase leading-tight tracking-[0.071em]">
              {{ $t(item.titleKey) }}
            </h2>
            <a
              href="#"
              class="mb-[8px] block text-[14px] font-semibold uppercase leading-none tracking-[0.071em] underline-offset-2 hover:underline"
              :aria-label="$t(item.ctaLabelKey)"
            >
              <span class="sr-only">{{ $t(item.titleKey) }}</span>
              {{ $t('men.home.cta.shopNow') }}
            </a>
            <a
              href="#"
              :aria-label="$t(item.ctaLabelKey)"
            >
              <img
                class="block aspect-[434/580] h-auto w-full object-cover align-middle"
                :src="item.src"
                :srcset="item.srcset"
                :alt="$t(item.altKey)"
              >
            </a>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
