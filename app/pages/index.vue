<script setup lang="ts">
const { categoryPath, slugFromKey } = useCatalogNavigation('women')

const buckets = [
  {
    titleKey: 'women.home.buckets.justIn.title',
    ctaKey: 'women.home.buckets.shopNow',
    ctaLabelKey: 'women.home.buckets.justIn.ctaLabel',
    imageAltKey: 'women.home.buckets.justIn.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_NA_Spotlight.jpg',
    srcset: undefined,
    overlayCountKey: 'women.home.buckets.justIn.count',
    overlayTextKey: 'women.home.buckets.justIn.overlay',
  },
  {
    titleKey: 'women.home.buckets.sets.title',
    ctaKey: 'women.home.buckets.shopNow',
    ctaLabelKey: 'women.home.buckets.sets.ctaLabel',
    imageAltKey: 'women.home.buckets.sets.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050626_RW_Sets_02.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050626_RW_Sets_02.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050626_RW_Sets_02_2x.jpg 2x',
  },
] as const

const shopKickers = [
  {
    titleKey: 'women.home.shops.items.vacay.title',
    ctaLabelKey: 'women.home.shops.items.vacay.ctaLabel',
    altKey: 'women.home.shops.items.vacay.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_CuteVacayOutfits_1x.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_CuteVacayOutfits_2x.jpg 2x',
  },
  {
    titleKey: 'women.home.shops.items.event.title',
    ctaLabelKey: 'women.home.shops.items.event.ctaLabel',
    altKey: 'women.home.shops.items.event.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_SpecialEventDresses_1x.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_SpecialEventDresses_2x.jpg 2x',
  },
  {
    titleKey: 'women.home.shops.items.summer.title',
    ctaLabelKey: 'women.home.shops.items.summer.ctaLabel',
    altKey: 'women.home.shops.items.summer.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_SummerPreview_1x.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_SummerPreview_2x.jpg 2x',
  },
  {
    titleKey: 'women.home.shops.items.coolGirl.title',
    ctaLabelKey: 'women.home.shops.items.coolGirl.ctaLabel',
    altKey: 'women.home.shops.items.coolGirl.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_CoolGirlCapsule_1x.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_CoolGirlCapsule_2x.jpg 2x',
  },
  {
    titleKey: 'women.home.shops.items.perfectSets.title',
    ctaLabelKey: 'women.home.shops.items.perfectSets.ctaLabel',
    altKey: 'women.home.shops.items.perfectSets.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_PerfectSets_1x.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_PerfectSets_2x.jpg 2x',
  },
  {
    titleKey: 'women.home.shops.items.graduation.title',
    ctaLabelKey: 'women.home.shops.items.graduation.ctaLabel',
    altKey: 'women.home.shops.items.graduation.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_GraduationDresses_1x.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_Shops_GraduationDresses_2x.jpg 2x',
  },
] as const

const spotlightBuckets = [
  {
    titleKey: 'women.home.spotlight.items.outfit.title',
    ctaKey: 'women.home.buckets.shopNow',
    ctaLabelKey: 'women.home.spotlight.items.outfit.ctaLabel',
    altKey: 'women.home.spotlight.items.outfit.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050526_RW_SpringShop_02_2x.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050526_RW_SpringShop_02_2x.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050526_RW_SpringShop_02_2x.jpg 2x',
  },
  {
    titleKey: 'women.home.spotlight.items.essentials.title',
    ctaKey: 'women.home.spotlight.shopHeartloom',
    ctaLabelKey: 'women.home.spotlight.items.essentials.ctaLabel',
    altKey: 'women.home.spotlight.items.essentials.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050626_RW_Heartloom_02_2x_r.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050626_RW_Heartloom_02_2x_r.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050626_RW_Heartloom_02_2x_r.jpg 2x',
  },
  {
    titleKey: 'women.home.spotlight.items.dresses.title',
    ctaKey: 'women.home.buckets.shopNow',
    ctaLabelKey: 'women.home.spotlight.items.dresses.ctaLabel',
    altKey: 'women.home.spotlight.items.dresses.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_SpringDresses_02.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_SpringDresses_02.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050426_RW_SpringDresses_02_2x.jpg 2x',
  },
  {
    titleKey: 'women.home.spotlight.items.euro.title',
    ctaKey: 'women.home.buckets.shopNow',
    ctaLabelKey: 'women.home.spotlight.items.euro.ctaLabel',
    altKey: 'women.home.spotlight.items.euro.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_EuroEscape_Spotlight.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_EuroEscape_Spotlight.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050426_RW_EuroEscape_Spotlight_2x.jpg 2x',
  },
] as const

const exclusiveKickers = [
  {
    titleKey: 'women.home.exclusive.items.office.title',
    ctaLabelKey: 'women.home.exclusive.items.office.ctaLabel',
    altKey: 'women.home.exclusive.items.office.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_OfficeApproved_Kicker.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_OfficeApproved_Kicker.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050426_RW_OfficeApproved_Kicker_2x.jpg 2x',
  },
  {
    titleKey: 'women.home.exclusive.items.hotList.title',
    ctaLabelKey: 'women.home.exclusive.items.hotList.ctaLabel',
    altKey: 'women.home.exclusive.items.hotList.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_TheHotList_Kicker.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_TheHotList_Kicker.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050426_RW_TheHotList_Kicker_2x.jpg 2x',
  },
  {
    titleKey: 'women.home.exclusive.items.mothersDay.title',
    ctaLabelKey: 'women.home.exclusive.items.mothersDay.ctaLabel',
    altKey: 'women.home.exclusive.items.mothersDay.alt',
    src: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_MothersDayGifts_Kicker.jpg',
    srcset: 'https://is4.revolveassets.com/images/up/2026/May/050426_RW_MothersDayGifts_Kicker.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050426_RW_MothersDayGifts_Kicker_2x.jpg 2x',
  },
] as const

const uandiplusPromo = {
  ctaLabelKey: 'women.home.uandiplusPromo.ctaLabel',
  altKey: 'women.home.uandiplusPromo.alt',
  src: 'https://is4.revolveassets.com/images/up/2025/July/070925_FWxPromo_RWhomepagebanner_1x.jpg',
  srcset: 'https://is4.revolveassets.com/images/up/2025/July/070925_FWxPromo_RWhomepagebanner_1x.jpg 1x, https://is4.revolveassets.com/images/up/2025/July/070925_FWxPromo_RWhomepagebanner_2x.jpg 2x',
} as const
</script>
<template>
  <div class="page home">
    <h1 class="sr-only">
      {{ $t('women.home.title') }}
    </h1>

    <section class="w-full">
      <div class="relative left-1/2 mb-[22px] w-full max-w-[1400px] -translate-x-1/2">
        <NuxtLink
            :to="categoryPath(slugFromKey('women.home.hero.ctaLabel'))"
            class="relative block aspect-[100/46.285714]"
            :aria-label="$t('women.home.hero.ctaLabel')"
        >
          <img
              class="absolute left-0 top-0 h-full w-full object-cover align-middle"
              src="https://is4.revolveassets.com/images/up/2026/May/050726_RW_WeddingSeason_01.jpg"
              srcset="https://is4.revolveassets.com/images/up/2026/May/050726_RW_WeddingSeason_01.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050726_RW_WeddingSeason_01_2x.jpg 2x"
              :alt="$t('women.home.hero.alt')"
          >
        </NuxtLink>
      </div>
    </section>

    <section class="mt-8 flex justify-center">
      <div class="mx-auto mt-4 w-full max-w-[1400px] px-8">
        <div class="flex flex-wrap justify-center items-center gap-4 pt-[2%]">
          <article
              v-for="bucket in buckets"
              :key="bucket.titleKey"
              class="relative mb-[58px] flex flex-[1_1_48%] flex-col justify-between"
          >
            <NuxtLink
                :to="categoryPath(slugFromKey(bucket.titleKey))"
                class="flex flex-1 flex-col text-black no-underline hover:no-underline"
                :aria-label="$t(bucket.ctaLabelKey)"
            >
              <div class="flex w-full flex-grow flex-col items-center justify-center pb-[15px] text-center">
                <h2 class="mb-0 mt-[11px] text-[18px] font-semibold uppercase leading-tight tracking-[0.142em]">
                  {{ $t(bucket.titleKey) }}
                </h2>
                <span class="relative text-[12px] font-semibold uppercase leading-[1.15] tracking-[0.05em] hover:underline">
                  {{ $t(bucket.ctaKey) }}
                </span>
              </div>

              <div class="relative block aspect-[100/125.037936] w-full overflow-hidden bg-[#c00]">
                <img
                    class="absolute left-0 top-0 h-full w-full object-cover align-middle"
                    :src="bucket.src"
                    :srcset="bucket.srcset"
                    :alt="$t(bucket.imageAltKey)"
                >
                <p
                    v-if="bucket.overlayCountKey && bucket.overlayTextKey"
                    class="absolute inset-0 flex flex-col items-center justify-center text-center text-[56px] font-semibold uppercase leading-[0.92] tracking-[0.142em] text-white"
                >
                  <span class="text-[96px] leading-none tracking-normal">
                    {{ $t(bucket.overlayCountKey) }}
                  </span>
                  {{ $t(bucket.overlayTextKey) }}
                </p>
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section
        id="looksWeLoveMarkup"
        class="flex justify-center pt-[11px]"
        :aria-labelledby="'section-heading-featuredshops'"
    >
      <div class="w-full max-w-[1400px] px-8">
        <div class="text-center">
          <h2
              id="section-heading-featuredshops"
              class="mb-2 mt-4 text-[18px] font-semibold uppercase leading-tight tracking-[0.142em]"
          >
            {{ $t('women.home.shops.title') }}
          </h2>

          <div class="mb-[32px]">
            <p class="inline-block text-[14px] leading-[1.5] tracking-[0.05em] text-black">
              {{ $t('women.home.shops.description') }}
              <span aria-hidden="true"> | </span>
              <NuxtLink
                  :to="categoryPath(slugFromKey('women.home.shops.title'))"
                  class="inline-block font-semibold"
              >
                {{ $t('women.home.shops.shopNow') }}
                <span class="sr-only">{{ $t('women.home.shops.title') }}</span>
              </NuxtLink>
            </p>
          </div>
        </div>

        <div class="-ml-4 flex flex-wrap">
          <article
              v-for="kicker in shopKickers"
              :key="kicker.titleKey"
              class="relative mb-[58px] ml-4 flex w-[calc(33.333333%-16px)] flex-col justify-between"
          >
            <NuxtLink
                :to="categoryPath(slugFromKey(kicker.titleKey))"
                class="flex flex-1 flex-col text-black no-underline hover:no-underline"
                :aria-label="$t(kicker.ctaLabelKey)"
            >
              <div class="flex w-full flex-grow flex-col items-center justify-center pb-[15px] text-center">
                <h3 class="m-0 text-[18px] font-semibold uppercase leading-tight tracking-[0.142em]">
                  {{ $t(kicker.titleKey) }}
                </h3>
              </div>

              <div class="relative block aspect-[100/133.640553] w-full overflow-hidden">
                <img
                    class="absolute left-0 top-0 h-full w-full object-cover align-middle"
                    :src="kicker.src"
                    :srcset="kicker.srcset"
                    :alt="$t(kicker.altKey)"
                >
              </div>

              <div class="relative mt-[4px] text-center text-[12px] font-semibold uppercase leading-[1.15] tracking-[0.05em] hover:underline">
                {{ $t('women.home.shops.shopNow') }}
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section class="mb-[32px] flex justify-center overflow-hidden">
      <div class="w-full max-w-[1400px] px-8">
        <h2 class="sr-only">
          {{ $t('women.home.spotlight.title') }}
        </h2>

        <div class="flex flex-wrap items-start justify-center gap-4">
          <article
              v-for="item in spotlightBuckets"
              :key="item.titleKey"
              class="relative mb-[58px] flex flex-[1_1_48%] flex-col justify-between"
          >
            <NuxtLink
                :to="categoryPath(slugFromKey(item.titleKey))"
                class="flex flex-1 flex-col text-black no-underline hover:no-underline"
                :aria-label="$t(item.ctaLabelKey)"
            >
              <div class="flex w-full flex-grow flex-col items-center justify-center pb-[15px] text-center">
                <h3 class="mb-0 mt-[11px] text-[18px] font-semibold uppercase leading-tight tracking-[0.142em]">
                  {{ $t(item.titleKey) }}
                </h3>
                <span class="relative text-[12px] font-semibold uppercase leading-[1.15] tracking-[0.05em] hover:underline">
                  {{ $t(item.ctaKey) }}
                </span>
              </div>

              <div class="relative block aspect-[100/125.037936] w-full overflow-hidden">
                <img
                    class="absolute left-0 top-0 h-full w-full object-cover align-middle"
                    :src="item.src"
                    :srcset="item.srcset"
                    :alt="$t(item.altKey)"
                >
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section class="flex justify-center">
      <div class="mt-[32px] w-full max-w-[1400px] px-8 pb-0">
        <h2 class="sr-only">
          {{ $t('women.home.exclusive.title') }}
        </h2>

        <div class="-ml-4 flex flex-wrap">
          <article
              v-for="item in exclusiveKickers"
              :key="item.titleKey"
              class="relative mb-[58px] ml-4 flex w-[calc(33.333333%-16px)] flex-col justify-between"
          >
            <NuxtLink
                :to="categoryPath(slugFromKey(item.titleKey))"
                class="flex flex-1 flex-col text-black no-underline hover:no-underline"
                :aria-label="$t(item.ctaLabelKey)"
            >
              <div class="flex w-full flex-grow flex-col items-center justify-center pb-[15px] text-center">
                <h3 class="m-0 text-[18px] font-semibold uppercase leading-tight tracking-[0.142em]">
                  {{ $t(item.titleKey) }}
                </h3>
              </div>

              <div class="relative block aspect-[100/123.502304] w-full overflow-hidden">
                <img
                    class="absolute left-0 top-0 h-full w-full object-cover align-middle"
                    :src="item.src"
                    :srcset="item.srcset"
                    :alt="$t(item.altKey)"
                >
              </div>

              <div class="relative mt-[4px] text-center text-[12px] font-semibold uppercase leading-[1.15] tracking-[0.05em] hover:underline">
                {{ $t('women.home.shops.shopNow') }}
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section class="flex justify-center">
      <div class="w-full max-w-[1400px] px-8">
        <NuxtLink
            :to="categoryPath(slugFromKey(uandiplusPromo.ctaLabelKey))"
            class="mt-[32px] block pt-[32px]"
            :aria-label="$t(uandiplusPromo.ctaLabelKey)"
        >
          <img
              class="block h-auto w-full align-middle"
              :src="uandiplusPromo.src"
              :srcset="uandiplusPromo.srcset"
              :alt="$t(uandiplusPromo.altKey)"
          >
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
