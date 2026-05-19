<script setup lang="ts">
type PriceLineItem = {
  label: string
  value: string
}

const props = defineProps<{
  totalLabel: string
  totalPrice: string
  lineItems: PriceLineItem[]
  footnote?: string
}>()

const isOpen = ref(false)
</script>

<template>
  <client-only>
  <ElPopover
    v-model:visible="isOpen"
    trigger="click"
    placement="bottom-end"
    :width="320"
    :show-arrow="true"
    :offset="10"
    popper-class="design-price-popover"
  >
    <template #reference>
      <button
        type="button"
        class="group inline-flex h-11 min-w-[116px] items-center justify-between gap-2 rounded-[10px] border border-white/16 bg-[#1a1c1f] px-3 text-left text-white transition hover:border-white/24"
        :aria-expanded="isOpen"
      >
        <div class="min-w-0">
          <p class="truncate text-[11px] leading-none text-white/70">
            {{ totalLabel }}
          </p>
          <p class="mt-1 truncate text-[12px] font-semibold leading-none text-white">
            {{ totalPrice }}
          </p>
        </div>

        <Icon
          name="ruuul:chevron-down"
          size="1.1em"
          class="shrink-0 text-white transition-transform duration-200"
          :class="isOpen ? 'rotate-180' : ''"
        />
      </button>
    </template>

    <div class="space-y-4">
      <div class="space-y-2 border-b border-dashed border-[#d9d9d7] pb-3">
        <div
          v-for="item in lineItems"
          :key="item.label"
          class="flex items-center justify-between gap-4 text-[15px] leading-none text-primary"
        >
          <p>{{ item.label }}</p>
          <p class="font-medium">{{ item.value }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-4 text-[15px] leading-none text-primary">
          <p class="font-semibold">{{ totalLabel }}</p>
          <p class="font-semibold">{{ totalPrice }}</p>
        </div>
        <p
          v-if="footnote"
          class="text-xs leading-4 text-[#8b8f94]"
        >
          {{ footnote }}
        </p>
      </div>
    </div>
  </ElPopover>
    </client-only>
</template>
