<script setup lang="ts">
import type { CatalogSidebarGroup } from '~/types/catalog'

defineProps<{
  groups: CatalogSidebarGroup[]
}>()
</script>

<template>
  <aside class="w-full shrink-0 lg:w-[292px]">
    <section
      v-for="group in groups"
      :key="group.title"
      class="mb-[24px]"
    >
      <h2 class="border-b border-[#eaeaea] pb-[8px] text-[13px] font-semibold uppercase leading-none tracking-[0.08em]">
        {{ group.title }}
      </h2>

      <ul class="mt-[10px] space-y-[5px] text-[16px] leading-[1.15] text-[#6f7780]">
        <li
          v-for="item in group.items"
          :key="item.label"
        >
          <NuxtLink
            :to="item.to"
            class="inline-block hover:text-black hover:underline"
            :class="{
              'text-black underline': item.active,
              'text-[#c62118]': item.danger,
            }"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </section>
  </aside>
</template>
