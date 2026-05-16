<script setup lang="ts">
import type { ProductContent } from '~/types/product-detail'

const props = defineProps<{
  content?: ProductContent | null
}>()

const activeTab = shallowRef('description')

const tabs = [
  { key: 'description', labelKey: 'catalog.product.tabs.description' },
  { key: 'sizeFit', labelKey: 'catalog.product.tabs.sizeFit' },
  { key: 'aboutBrand', labelKey: 'catalog.product.tabs.aboutBrand' },
] as const

const descriptionItems = computed(() => props.content?.description ?? [])
</script>

<template>
  <section class="mt-[36px]">
    <div
      class="flex flex-wrap gap-x-[12px] gap-y-2"
      role="tablist"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        class="pb-[4px] text-[18px] font-semibold capitalize leading-none text-[#6f7780]"
        :class="activeTab === tab.key && 'border-b-2 border-black text-black'"
        :aria-selected="activeTab === tab.key"
        @click="activeTab = tab.key"
      >
        {{ $t(tab.labelKey) }}
      </button>
    </div>

    <div class="mt-[24px] text-[13px] leading-[1.6]">
      <ul
        v-if="activeTab === 'description' && descriptionItems.length"
        class="ml-[17px] list-disc"
      >
        <li
          v-for="item in descriptionItems"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>

      <p v-else-if="activeTab === 'sizeFit'">
        {{ content?.size_fit || $t('catalog.product.sizeFit.viewSizeGuide') }}
      </p>

      <p v-else-if="activeTab === 'aboutBrand'">
        {{ content?.about_brand || $t('catalog.product.aboutBrand.copy') }}
      </p>

      <p v-else>
        {{ $t('catalog.product.description.empty') }}
      </p>
    </div>
  </section>
</template>
