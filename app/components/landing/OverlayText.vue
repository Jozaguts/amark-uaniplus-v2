<script setup lang="ts">
const props = defineProps<{ text?: string }>()

const text = computed(() => {
  return props.text?.split(' ')
})
</script>

<template>
  <p class="m-0 text-[20px] font-semibold  leading-[1.2] tracking-normal md:text-[22px] text-center">
    <span v-for="(word, idx) in text"
          class="px-1 capitalize"
          :class=" idx === 1 ? 'bg-red-fied text-white font-bold px-1 py-0' : 'text-white font-semibold'">
      {{ word }}
    </span>
  </p>
</template>
