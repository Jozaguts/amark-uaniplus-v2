<script setup lang="ts">
import LandingPageRenderer from '~/components/landing/LandingPageRenderer.vue'
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

const isLeafCategory = computed(() => Boolean(category.value && !childGroups.value.length))

const landingScopes = new Set(['fashion', 'accessories', 'digital-products'])

const landingScope = computed(() => {
  return landingScopes.has(categoryPath.value) ? categoryPath.value : ''
})

const { landingPage } = useLandingPage(landingScope)

useSeoMeta({
  title: computed(() => landingPage.value?.seo?.title || landingPage.value?.title || category.value?.name || ''),
  description: computed(() => landingPage.value?.seo?.description || ''),
  ogImage: computed(() => landingPage.value?.seo?.image || ''),
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
  <LandingPageRenderer
    v-if="landingPage"
    :page="landingPage"
  />

  <CatalogCategoryPage
    v-else-if="category && isLeafCategory"
    :category="category"
  />

  <section
    v-else-if="category"
    class="mx-auto w-full max-w-[1400px] px-8 py-10"
  >
    <h1 class="mb-8 text-center text-[26px] font-semibold uppercase leading-tight tracking-[0.14em]">
      {{ category.name }}
    </h1>

    <div
      v-if="childGroups.length"
      class="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
    >
      <article
        v-for="item in childGroups"
        :key="item.path"
        class="min-w-0"
      >
        <span
          v-if="hasChildren(item)"
          class="mb-3 block border-b border-[#e4e4e4] pb-2 text-[14px] font-semibold uppercase leading-none tracking-[0.083em] text-black"
        >
          {{ item.name }}
        </span>

        <NuxtLink
          v-else
          :to="linkTarget(item.url)"
          class="mb-3 block border-b border-[#e4e4e4] pb-2 text-[14px] font-semibold uppercase leading-none tracking-[0.083em] text-black"
        >
          {{ item.name }}
        </NuxtLink>

        <ul
          v-if="item.children?.length"
          class="space-y-1"
        >
          <li
            v-for="child in item.children"
            :key="child.path"
          >
            <NuxtLink
              :to="linkTarget(child.url)"
              class="text-[14px] font-normal leading-[1.4] text-[#6e6e6e]"
            >
              {{ child.name }}
            </NuxtLink>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>
