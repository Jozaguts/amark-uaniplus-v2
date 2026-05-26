<script setup lang="ts">
definePageMeta({
  validate: route => ['women', 'men', 'pet'].includes(route.params.section as string),
})

const route = useRoute()
const section = computed(() => route.params.section as string)
const { landingPage } = useLandingPage(section)

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
