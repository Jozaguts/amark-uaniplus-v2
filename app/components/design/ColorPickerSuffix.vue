<script setup lang="ts">
const color = defineModel<string>({ required: true })

defineProps<{
  ariaLabel: string
}>()

const predefinedColors = [
  '#c53232',
  '#d02424',
  '#111314',
  '#ffffff',
  '#2f80ed',
  '#27ae60',
  '#f2c94c',
  '#9b51e0',
]
</script>

<template>
  <ElColorPicker
    v-model="color"
    color-format="hex"
    :predefine="predefinedColors"
    :aria-label="ariaLabel"
    popper-class="design-color-picker-popper"
    size="small"
  />
</template>
