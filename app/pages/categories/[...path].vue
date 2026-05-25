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

const expandedGroupPath = shallowRef<string | null>(null)

function hasChildren(item: CatalogNavigationItem): boolean {
  return Boolean(item.children?.length)
}

function linkTarget(url: string): string {
  if (/^https?:\/\//.test(url))
    return url

  return localePath(url)
}

function toggleGroup(item: CatalogNavigationItem): void {
  expandedGroupPath.value = expandedGroupPath === item.path ? null : item.path
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

  <section v-else-if="category">
    <h1 class="py-8 text-center text-[26px] font-semibold uppercase leading-tight tracking-[0.14em]">
      {{ category.name }}
    </h1>

    <!-- Mobile: accordion -->
    <div v-if="childGroups.length" class="lg:hidden divide-y divide-[#e4e4e4] border-t border-[#e4e4e4]">
      <div v-for="item in childGroups" :key="item.path">
        <!-- group has children → accordion toggle -->
        <template v-if="hasChildren(item)">
          <button
            type="button"
            class="flex w-full items-center justify-between px-4 py-4 text-[14px] font-semibold uppercase tracking-[0.083em] text-black"
            @click="toggleGroup(item)"
          >
            <span>{{ item.name }}</span>
            <Icon
              name="ph:caret-down"
              class="size-[16px] shrink-0 text-[#6e6e6e] transition-transform duration-200"
              :class="expandedGroupPath === item.path ? 'rotate-180' : ''"
            />
          </button>
          <ul
            v-if="expandedGroupPath === item.path"
            class="border-t border-[#e4e4e4] bg-white divide-y divide-[#efefef]"
          >
            <li v-for="child in item.children" :key="child.path">
              <NuxtLink
                :to="linkTarget(child.url)"
                class="block px-4 py-3.5 text-[14px] text-[#222]"
              >
                {{ child.name }}
              </NuxtLink>
            </li>
          </ul>
        </template>

        <!-- group is a direct link -->
        <NuxtLink
          v-else
          :to="linkTarget(item.url)"
          class="flex w-full items-center px-4 py-4 text-[14px] font-semibold uppercase tracking-[0.083em] text-black"
        >
          {{ item.name }}
        </NuxtLink>
      </div>
    </div>

    <!-- Desktop: grid -->
    <div
      v-if="childGroups.length"
      class="mx-auto hidden w-full max-w-[1400px] px-8 pb-10 lg:grid lg:gap-8 lg:grid-cols-4"
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

        <ul v-if="item.children?.length" class="space-y-1">
          <li v-for="child in item.children" :key="child.path">
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
