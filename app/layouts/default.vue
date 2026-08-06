<script setup lang="ts">
import Footer from '~/components/Footer.vue'
import Header from '~/components/Header.vue'
import RecentlyViewedSection from '~/components/RecentlyViewedSection.vue'

const route = useRoute()

/** Home + root section landings only: / /women /men /accessories (+ locale prefix). */
const showRecentlyViewed = computed(() => {
  const path = route.path.replace(/^\/(en|es)(?=\/|$)/, '') || '/'
  if (path === '/')
    return true

  const segments = path.split('/').filter(Boolean)
  if (segments.length !== 1)
    return false

  return ['women', 'men', 'accessories'].includes(segments[0]!.toLowerCase())
})
</script>

<template>
  <Header />
  <main>
    <slot />
  </main>
  <RecentlyViewedSection v-if="showRecentlyViewed" />
  <Footer />
</template>
