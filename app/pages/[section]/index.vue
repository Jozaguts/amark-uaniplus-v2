<script setup lang="ts">
definePageMeta({
  validate: route => ['women', 'men', 'pet'].includes(route.params.section as string),
})

const route = useRoute()
const section = computed(() => route.params.section as string)
const { landingPage } = useLandingPage(section)
const { setActiveCategoryPath } = useActiveNavigation()

// Recuerda la sección para que el nav siga activo al abrir un producto desde el landing.
watch(section, current => setActiveCategoryPath(current), { immediate: true })

useSeoMeta({
  title: computed(() => landingPage.value?.seo?.title || landingPage.value?.title || ''),
  description: computed(() => landingPage.value?.seo?.description || ''),
  ogImage: computed(() => landingPage.value?.seo?.image || ''),
})
</script>

<template>
  <LandingPageRenderer
    v-if="landingPage"
    :page="landingPage"
  />
</template>
