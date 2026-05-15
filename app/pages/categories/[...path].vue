<script setup lang="ts">
import type { CatalogNavigationItem } from '~/types/catalog-navigation'

const route = useRoute()
const localePath = useLocalePath()
const { findByPath } = useCatalogNavigationTree()

const categoryPath = computed(() => {
  const path = route.params.path

  return Array.isArray(path) ? path.join('/') : String(path ?? '')
})

const category = computed(() => findByPath(categoryPath.value))

const childGroups = computed(() => category.value?.children ?? [])

useSeoMeta({
  title: computed(() => category.value?.name ?? ''),
})

function hasChildren(item: CatalogNavigationItem): boolean {
  return Boolean(item.children?.length)
}

function linkTarget(url: string): string {
  if (/^https?:\/\//.test(url))
    return url

  return localePath(url)
}
</script>

<template>
  <section
    v-if="category"
    class="mx-auto w-full max-w-[1400px] px-8 py-10"
  >



  </section>
</template>
