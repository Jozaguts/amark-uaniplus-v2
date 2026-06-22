<script setup lang="ts">
import type { CatalogNavigationItem } from '~/types/catalog-navigation'

const route = useRoute()
const localePath = useLocalePath()
const { findByUrl, findByPath, pending } = useCatalogNavigationTree()
const { setActiveCategoryPath } = useActiveNavigation()

const section = computed(() => route.params.section as string)
const pathSegments = computed(() => {
  const p = route.params.path
  return Array.isArray(p) ? p : [p]
})

const fullUrl = computed(() => `/${section.value}/${pathSegments.value.join('/')}`)

const categoryPath = computed(() => `${section.value}/${pathSegments.value.join('/')}`)

const category = computed<CatalogNavigationItem | null>(() => {
  return findByUrl(fullUrl.value) ?? findByPath(categoryPath.value)
})

// When nav is loaded but item isn't in the tree, build a minimal item so
// CatalogCategoryPage can still call the products API using the URL path.
const syntheticCategory = computed<CatalogNavigationItem | null>(() => {
  if (pending.value || category.value) return null
  const lastSlug = pathSegments.value.at(-1) ?? ''
  return {
    id: categoryPath.value,
    name: lastSlug.replace(/-/g, ' '),
    slug: lastSlug,
    path: categoryPath.value,
    url: fullUrl.value,
    level: pathSegments.value.length + 1,
    children: [],
  }
})

const resolvedCategory = computed(() => category.value ?? syntheticCategory.value)

// Recuerda la categoría navegada para que el nav siga activo al abrir un producto.
watch(resolvedCategory, (current) => {
  if (current)
    setActiveCategoryPath(current.path)
}, { immediate: true })

const childGroups = computed(() => resolvedCategory.value?.children ?? [])

const isLeafCategory = computed(() =>
  Boolean(resolvedCategory.value && !childGroups.value.length),
)

useSeoMeta({
  title: computed(() => resolvedCategory.value?.name || ''),
})

const expandedGroupPath = shallowRef<string | null>(null)

function hasChildren(item: CatalogNavigationItem): boolean {
  return Boolean(item.children?.length)
}

function canNavigate(item: CatalogNavigationItem): boolean {
  return catalogNavigationState(item).canNavigate
}

function linkTarget(url: string): string {
  if (/^https?:\/\//.test(url))
    return url

  return localePath(url)
}

function toggleGroup(item: CatalogNavigationItem): void {
  expandedGroupPath.value = expandedGroupPath.value === item.path ? null : item.path
}
</script>

<template>
  <div v-if="pending" class="flex min-h-[300px] items-center justify-center">
    <span class="text-[14px] text-[#8a8a8a]">{{ $t('catalog.category.loading') }}</span>
  </div>

  <CatalogCategoryPage
    v-else-if="resolvedCategory && isLeafCategory"
    :category="resolvedCategory"
  />

  <section v-else-if="resolvedCategory">
    <h1 class="py-8 text-center text-[26px] font-semibold uppercase leading-tight tracking-[0.14em]">
      {{ resolvedCategory.name }}
    </h1>

    <!-- Mobile: accordion -->
    <div v-if="childGroups.length" class="lg:hidden divide-y divide-[#e4e4e4] border-t border-[#e4e4e4]">
      <div v-for="item in childGroups" :key="item.path">
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
                v-if="canNavigate(child)"
                :to="linkTarget(child.url)"
                class="block px-4 py-3.5 text-[14px] text-[#222]"
              >
                {{ child.name }}
              </NuxtLink>
              <span v-else class="block px-4 py-3.5 text-[14px] text-[#222]">
                {{ child.name }}
              </span>
            </li>
          </ul>
        </template>

        <NuxtLink
          v-else-if="canNavigate(item)"
          :to="linkTarget(item.url)"
          class="flex w-full items-center px-4 py-4 text-[14px] font-semibold uppercase tracking-[0.083em] text-black"
        >
          {{ item.name }}
        </NuxtLink>
        <span
          v-else
          class="flex w-full items-center px-4 py-4 text-[14px] font-semibold uppercase tracking-[0.083em] text-black"
        >
          {{ item.name }}
        </span>
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
          v-else-if="canNavigate(item)"
          :to="linkTarget(item.url)"
          class="mb-3 block border-b border-[#e4e4e4] pb-2 text-[14px] font-semibold uppercase leading-none tracking-[0.083em] text-black"
        >
          {{ item.name }}
        </NuxtLink>
        <span
          v-else
          class="mb-3 block border-b border-[#e4e4e4] pb-2 text-[14px] font-semibold uppercase leading-none tracking-[0.083em] text-black"
        >
          {{ item.name }}
        </span>

        <ul v-if="item.children?.length" class="space-y-1">
          <li v-for="child in item.children" :key="child.path">
            <NuxtLink
              v-if="canNavigate(child)"
              :to="linkTarget(child.url)"
              class="text-[14px] font-normal leading-[1.4] text-[#6e6e6e]"
            >
              {{ child.name }}
            </NuxtLink>
            <span v-else class="text-[14px] font-normal leading-[1.4] text-[#6e6e6e]">
              {{ child.name }}
            </span>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>
