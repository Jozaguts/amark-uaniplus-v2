<template>
  <div class="page home">
    <h1 class="sr-only">
      {{ $t('women.home.title') }}
    </h1>

    <section class="w-full">
      <div class="relative left-1/2 mb-[22px] w-full max-w-[1400px] -translate-x-1/2">
        <a
          href="#"
          class="relative block aspect-[100/46.285714]"
          :aria-label="$t('women.home.hero.ctaLabel')"
        >
          <img
            class="absolute left-0 top-0 h-full w-full object-cover align-middle"
            src="https://is4.revolveassets.com/images/up/2026/May/050726_RW_WeddingSeason_01.jpg"
            srcset="https://is4.revolveassets.com/images/up/2026/May/050726_RW_WeddingSeason_01.jpg 1x, https://is4.revolveassets.com/images/up/2026/May/050726_RW_WeddingSeason_01_2x.jpg 2x"
            :alt="$t('women.home.hero.alt')"
          >
        </a>
      </div>
    </section>
  </div>
</template>
