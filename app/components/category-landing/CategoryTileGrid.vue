<script setup lang="ts">
import type { CategoryTile } from '~/types/category-landing'

defineProps<{
  categories: readonly CategoryTile[]
}>()

const route = useRoute()

function slugFromKey(key: string) {
  const parts = key.split('.')

  return parts.at(-2) || parts.at(-1) || 'item'
}

function scopedPath(segment: string) {
  return `${route.path.replace(/\/$/, '')}/${segment}`.replace(/\/{2,}/g, '/')
}

function categoryHref(category: CategoryTile) {
  return category.href || scopedPath(slugFromKey(category.titleKey))
}
</script>

<template>
  <section class="flex px-8 mx-auto justify-center bg-[#f4f4f4] py-8">
    <div class="container px-16 py-8 mx-auto max-w-[100em] grid w-full grid-cols-2 justify-items-center gap-y-10 gap-x-4 sm:grid-cols-3 lg:grid-cols-5">
      <NuxtLink
        v-for="category in categories"
        :key="category.titleKey"
        :to="categoryHref(category)"
        class="group block w-full text-center text-black no-underline hover:no-underline"
        :aria-label="$t(category.ctaLabelKey)"
      >
        <img
          class="block h-75 w-full rounded object-cover align-middle"
          :src="category.src"
          :srcset="category.srcset"
          :alt="$t(category.altKey)"
        >
        <h2 class="mt-3 text-[15px] font-bold uppercase leading-tight tracking-normal group-hover:underline">
          {{ $t(category.titleKey) }}
        </h2>
      </NuxtLink>
    </div>
  </section>
</template>
