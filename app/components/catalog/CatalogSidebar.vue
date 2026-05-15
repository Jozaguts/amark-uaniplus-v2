<script setup lang="ts">
import type { CatalogSidebarGroup } from '~/types/catalog'

defineProps<{
  groups: CatalogSidebarGroup[]
}>()

const { categoryPath, slugFromKey } = useCatalogNavigation()

function fallbackItemPath(item: CatalogSidebarGroup['items'][number]) {
  if (item.to)
    return item.to

  return categoryPath(item.active ? 'all-sale-items' : slugFromKey(item.labelKey ?? item.label ?? 'item'))
}
</script>

<template>
  <aside class="w-full shrink-0 lg:w-[292px]">
    <section
      v-for="group in groups"
      :key="group.titleKey"
      class="mb-[24px]"
    >
      <h2 class="border-b border-[#eaeaea] pb-[8px] text-[13px] font-semibold uppercase leading-none tracking-[0.08em]">
        {{ $t(group.titleKey) }}
      </h2>

      <ul class="mt-[10px] space-y-[5px] text-[16px] leading-[1.15] text-[#6f7780]">
        <li
          v-for="item in group.items"
          :key="item.labelKey ?? item.label"
        >
          <NuxtLink
            :to="fallbackItemPath(item)"
            class="inline-block hover:text-black hover:underline"
            :class="{
              'text-black underline': item.active,
              'text-[#c62118]': item.danger,
            }"
          >
            {{ item.label ?? $t(item.labelKey ?? '') }}
          </NuxtLink>
        </li>
      </ul>
    </section>
  </aside>
</template>
