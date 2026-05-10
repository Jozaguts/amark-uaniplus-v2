<script setup lang="ts">
const route = useRoute()

const section = computed(() => String(route.params.section || ''))
const slug = computed(() => String(route.query.slug || ''))
</script>

<template>
  <main class="page mx-auto mt-8 w-full max-w-[1400px] px-8">
    <p class="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6d6d6d]">
      {{ section }}
    </p>
    <h1 class="mt-2 text-[32px] font-semibold uppercase leading-tight tracking-[0.071em]">
      {{ $t('catalog.product.title') }}
    </h1>
    <p class="mt-3 text-[14px] leading-[1.5]">
      {{ $t('catalog.product.active') }}: {{ slug }}
    </p>
  </main>
</template>
