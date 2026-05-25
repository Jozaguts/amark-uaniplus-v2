<script setup lang="ts">
import type { CatalogSidebarGroup } from '~/types/catalog'

const props = defineProps<{
  groups: CatalogSidebarGroup[]
}>()

const openGroupTitles = shallowRef<Set<string>>(new Set())

function toggleGroup(title: string): void {
  const next = new Set(openGroupTitles.value)
  if (next.has(title))
    next.delete(title)
  else
    next.add(title)
  openGroupTitles.value = next
}
</script>

<template>
  <aside class="w-full shrink-0 lg:w-[292px]">
    <!-- Desktop: always expanded -->
    <div class="hidden lg:block">
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
    </div>

    <!-- Mobile: collapsible accordion per group -->
    <div class="lg:hidden border-t border-[#eaeaea]">
      <div
        v-for="group in groups"
        :key="group.title"
        class="border-b border-[#eaeaea]"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-black"
          @click="toggleGroup(group.title)"
        >
          <span>{{ group.title }}</span>
          <Icon
            name="ph:caret-down"
            class="size-[15px] shrink-0 text-[#6f7780] transition-transform duration-200"
            :class="openGroupTitles.has(group.title) ? 'rotate-180' : ''"
          />
        </button>

        <ul
          v-if="openGroupTitles.has(group.title)"
          class="pb-3 space-y-[10px] text-[15px] leading-[1.15] text-[#6f7780]"
        >
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
      </div>
    </div>
  </aside>
</template>
