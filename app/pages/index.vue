<script setup lang="ts">
import LandingPageRenderer from '~/components/landing/LandingPageRenderer.vue'

const { landingPage } = useLandingPage('home')

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
