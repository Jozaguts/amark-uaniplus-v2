<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

withDefaults(defineProps<{
  designTo: RouteLocationRaw
  cartPending?: boolean
}>(), {
  cartPending: false,
})

const emit = defineEmits<{
  addToCart: []
}>()
</script>

<template>
  <!-- Thin dual CTAs — design → studio, cart always clickable (auth handled on click) -->
  <div class="mt-2 grid w-full grid-cols-2 gap-2">
    <NuxtLink
      :to="designTo"
      class="flex h-9 items-center justify-center bg-black px-1.5 text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-white transition-colors hover:bg-[#1a1a1a] sm:h-10 sm:text-[11px]"
    >
      {{ $t('landing.card.addYourDesign') }}
    </NuxtLink>
    <button
      type="button"
      class="flex h-9 items-center justify-center border border-black bg-white px-1.5 text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-black transition-colors hover:bg-[#f5f5f5] sm:h-10 sm:text-[11px]"
      :aria-busy="cartPending || undefined"
      @click="emit('addToCart')"
    >
      {{ cartPending ? $t('landing.card.addingToCart') : $t('landing.card.addToCart') }}
    </button>
  </div>
</template>
