<script setup lang="ts">
import type { CatalogNavigationItem } from '~/types/catalog-navigation'

const route = useRoute()
const section = computed(() => route.params.section as string)

const { findByUrl, findByPath, pending } = useCatalogNavigationTree()
const { landingPage } = useLandingPage(section)
const { setActiveCategoryPath } = useActiveNavigation()

// La sección se resuelve contra el árbol de navegación (API), no contra una
// lista fija, para que cualquier categoría raíz (women, men, accessories, …)
// funcione.
const category = computed<CatalogNavigationItem | null>(() =>
  findByUrl(`/${section.value}`) ?? findByPath(section.value),
)

// Recuerda la sección para que el nav siga activo al abrir un producto desde el landing.
watch(section, current => setActiveCategoryPath(current), { immediate: true })

// 404 sólo cuando el nav ya cargó y la sección no es ni landing page ni
// categoría del catálogo.
watch(
  () => !pending.value && !landingPage.value && !category.value,
  (notFound) => {
    if (notFound)
      throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  },
  { immediate: true },
)

useSeoMeta({
  title: computed(() => landingPage.value?.seo?.title || landingPage.value?.title || category.value?.name || ''),
  description: computed(() => landingPage.value?.seo?.description || ''),
  ogImage: computed(() => landingPage.value?.seo?.image || ''),
})
</script>

<template>
  <LandingPageRenderer
    v-if="landingPage"
    :page="landingPage"
  />

  <CatalogCategoryGroups
    v-else-if="category"
    :category="category"
  />

  <div v-else-if="pending" class="flex min-h-[300px] items-center justify-center">
    <span class="text-[14px] text-[#8a8a8a]">{{ $t('catalog.category.loading') }}</span>
  </div>
</template>
