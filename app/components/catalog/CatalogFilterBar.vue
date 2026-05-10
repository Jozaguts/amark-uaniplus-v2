<script setup lang="ts">
defineProps<{
  itemCountKey: string
}>()

const filterKeys = [
  'catalog.category.filters.designer',
  'catalog.category.filters.size',
  'catalog.category.filters.color',
  'catalog.category.filters.price',
]
</script>

<template>
  <div class="w-full">
    <div class="flex min-h-[44px] flex-col gap-4 border-b border-[#eaeaea] pb-[11px] md:flex-row md:items-center md:justify-between">
      <div class="flex flex-wrap items-center gap-x-[24px] gap-y-3">
        <button
          v-for="filterKey in filterKeys"
          :key="filterKey"
          type="button"
          class="flex items-center gap-[8px] text-[16px] leading-none text-black"
        >
          <span>{{ $t(filterKey) }}</span>
          <span class="text-[#555]">{{ $t('catalog.category.filters.selectedDash') }}</span>
          <Icon
            name="lucide:chevron-down"
            class="size-[14px]"
          />
        </button>
      </div>
    </div>

    <div class="mt-[21px] flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p class="text-[13px] font-semibold uppercase tracking-[0.035em]">
        {{ $t(itemCountKey) }}
      </p>

      <div class="flex flex-wrap items-center gap-x-[22px] gap-y-3 text-[16px] leading-none">
        <button
          type="button"
          class="flex items-center gap-[6px]"
        >
          <span>{{ $t('catalog.category.filters.sortBy') }} {{ $t('catalog.category.filters.newestMarkdowns') }}</span>
          <Icon
            name="lucide:chevron-down"
            class="size-[14px]"
          />
        </button>

        <button
          type="button"
          class="flex items-center gap-[6px]"
        >
          <span>{{ $t('catalog.category.filters.view') }} 500</span>
          <Icon
            name="lucide:chevron-down"
            class="size-[14px]"
          />
        </button>
      </div>
    </div>
  </div>
</template>
