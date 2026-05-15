<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()

const productSlug = computed(() => String(route.params.slug || ''))
</script>

<template>
  <main class="mx-auto w-full max-w-[1344px] px-[20px] pb-[80px] pt-[48px] lg:px-0">
    <div class="container mx-auto">
      <NuxtLink
        :to="localePath('/')"
        class="text-[12px] leading-none underline"
      >
        {{ t('catalog.design.back') }}
      </NuxtLink>

      <section class="mt-10 grid min-h-[520px] gap-8 border border-[#e5e5e5] bg-white p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-10">
        <div class="flex min-h-[420px] items-center justify-center bg-[#f7f7f7]">
          <p class="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#555]">
              {{ t('catalog.design.preview') }}
          </p>
        </div>

        <aside class="flex flex-col justify-between">
          <div>
            <p class="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#777]">
              {{ t('catalog.design.kicker') }}
            </p>
            <h1 class="mt-3 text-[26px] font-semibold uppercase tracking-[0.12em]">
              {{ t('catalog.design.title') }}
            </h1>
            <p class="mt-4 text-[14px] leading-6 text-[#555]">
              {{ t('catalog.design.description') }}
            </p>
            <p class="mt-6 text-[12px] uppercase tracking-[0.12em] text-[#777]">
              {{ t('catalog.design.product') }}: {{ productSlug }}
            </p>
          </div>

          <button
            type="button"
            class="mt-8 h-[46px] w-full bg-black text-[13px] font-semibold uppercase tracking-[0.18em] text-white"
          >
            {{ t('catalog.design.start') }}
          </button>
        </aside>
      </section>
    </div>
  </main>
</template>
