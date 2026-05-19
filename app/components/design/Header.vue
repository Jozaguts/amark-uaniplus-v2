<script setup lang="ts">
import DesignPriceSummaryPopover from "~/components/design/PriceSummaryPopover.vue";
const props = defineProps<{}
const editorBackHref = computed(() => `/product/details/${product.value?.id ?? productId.value}`)
</script>

<template>
  <header class="flex items-center gap-2 rounded-[10px] bg-black p-1 text-white">
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <NuxtLink
          :to="editorBackHref"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-transparent transition hover:border-white/30 hover:bg-white/5"
          aria-label="Back to product"
      >
        <Icon
            name="ph:arrow-left"
            size="18px"
            class="text-white"
        />
      </NuxtLink>

      <div class="min-w-0">
        <div class="hidden items-center gap-2 lg:flex">
          <h1 class="truncate text-sm font-medium text-white lg:max-w-[180px] xl:max-w-[280px] 2xl:max-w-[360px]">
            {{ productName }}
          </h1>
          <Icon
              name="ruuul:switch"
              size="20px"
              class="cursor-pointer p-1 text-white"
          />
        </div>

        <p class="text-[11px] uppercase tracking-[0.12em] text-white/45 lg:hidden">
          Design editor
        </p>
        <h1 class="truncate text-sm font-medium text-white lg:hidden">
          {{ productName }}
        </h1>
      </div>
    </div>

    <div class="hidden min-w-0 flex-[2] items-center justify-center px-4 lg:flex" />

    <div class="ml-auto flex items-center gap-2.5">
      <DesignPriceSummaryPopover
          :total-label="priceSummary.totalLabel"
          :total-price="priceSummary.totalPrice"
          :line-items="priceSummary.lineItems"
          :footnote="priceSummary.footnote"
      />

      <button
          type="button"
          class="flex h-11 items-center justify-center rounded-[10px] border border-white/20 bg-white px-4 text-sm font-semibold text-primary transition hover:bg-[#f5f5f3]"
      >
        Save Design
      </button>
    </div>
  </header>
</template>

<style scoped>

</style>