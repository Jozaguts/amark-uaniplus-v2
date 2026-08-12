<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'add-to-cart': []
  'create-another': []
}>()

const closeDialog = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <transition name="design-save-dialog">
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[90] flex items-start justify-center bg-black/35 px-4 pt-20"
      @click.self="closeDialog"
    >
      <div class="design-save-dialog-panel w-full max-w-[420px] rounded-[22px] bg-white px-5 py-5 text-primary shadow-[0_28px_90px_rgba(17,19,20,0.18)]">
        <div class="flex items-start justify-between">
          <span class="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f7f5] text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="30" height="30" fill="currentColor" class="inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE --><path fill="currentColor" d="M240.37 172.8L138 96l25.59-19.2A6 6 0 0 0 166 72a38 38 0 1 0-76 0a6 6 0 0 0 12 0a26 26 0 0 1 51.82-2.88l-29.32 22l-.21.16L15.63 172.8A14 14 0 0 0 24 198h208a14 14 0 0 0 8.39-25.2Zm-6.5 11.83A1.85 1.85 0 0 1 232 186H24a2 2 0 0 1-1.19-3.6L128 103.5l105.17 78.9a1.85 1.85 0 0 1 .7 2.23"/></svg>
          </span>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full text-[#8a8f98] transition hover:bg-[#f2f2f0] hover:text-primary"
            aria-label="Close success dialog"
            @click="closeDialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="18" height="18" fill="currentColor" class="inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE --><path fill="currentColor" d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128L50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z"/></svg>
          </button>
        </div>

        <div class="mt-2 text-center">
          <h2 class="text-[2rem] font-semibold leading-none tracking-[-0.03em]">
            Design saved successfully
          </h2>

        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            class="flex min-h-[84px] items-center justify-between rounded-2xl border border-borderSecondary px-4 py-4 text-left transition hover:border-primary/30 hover:bg-[#f8f8f6]"
            @click="emit('add-to-cart')"
          >
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f7f5] text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20" fill="currentColor" class="inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE --><path fill="currentColor" d="M104 216a16 16 0 1 1-16-16a16 16 0 0 1 16 16m88-16a16 16 0 1 0 16 16a16 16 0 0 0-16-16m47.71-125.86l-25.64 92.28A24.06 24.06 0 0 1 191 184H92.16A24.06 24.06 0 0 1 69 166.42L33.92 40H16a8 8 0 0 1 0-16h24a8 8 0 0 1 7.71 5.86L57.19 64H232a8 8 0 0 1 7.71 10.14M221.47 80H61.64l22.81 82.14a8 8 0 0 0 7.71 5.86H191a8 8 0 0 0 7.71-5.86Z"/></svg>
            </span>
            <span class="flex flex-1 items-center justify-between gap-3 pl-4">
              <span class="text-sm font-semibold">Add to cart</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false" role="presentation" width="18" height="18" fill="currentColor" class="text-[#4d545b] inline-block shrink-0">
    <path d="M15.772 7.46l-3.867-3.75a.75.75 0 0 0-1.044 1.077L13.4 7.25H.75a.75.75 0 0 0 0 1.5H13.4l-2.538 2.46a.75.75 0 0 0 1.044 1.077l3.867-3.75a.75.75 0 0 0 0-1.077z"></path>
</svg>
            </span>
          </button>

          <button
            type="button"
            class="flex min-h-[84px] items-center justify-between rounded-2xl border border-borderSecondary px-4 py-4 text-left transition hover:border-primary/30 hover:bg-[#f8f8f6]"
            @click="emit('create-another')"
          >
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f7f5] text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20" fill="currentColor" class="inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE --><path fill="currentColor" d="M216 24H72a40 40 0 0 0-40 40v72a24 24 0 0 0 24 24h48l-7.89 46.67A8.4 8.4 0 0 0 96 208a32 32 0 0 0 64 0a8.4 8.4 0 0 0-.11-1.33L152 160h48a24 24 0 0 0 24-24V32a8 8 0 0 0-8-8M72 40h104v40a8 8 0 0 0 16 0V40h16v64H48V64a24 24 0 0 1 24-24m128 104h-48a16 16 0 0 0-15.84 18.26v.2L144 208.6a16 16 0 0 1-32 0l7.8-46.14v-.2A16 16 0 0 0 104 144H56a8 8 0 0 1-8-8v-16h160v16a8 8 0 0 1-8 8"/></svg>
            </span>
            <span class="flex flex-1 items-center justify-between gap-3 pl-4">
              <span class="text-sm font-semibold">Create another design</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false" role="presentation" width="18" height="18" fill="currentColor" class="text-[#4d545b] inline-block shrink-0">
    <path d="M15.772 7.46l-3.867-3.75a.75.75 0 0 0-1.044 1.077L13.4 7.25H.75a.75.75 0 0 0 0 1.5H13.4l-2.538 2.46a.75.75 0 0 0 1.044 1.077l3.867-3.75a.75.75 0 0 0 0-1.077z"></path>
</svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.design-save-dialog-enter-active,
.design-save-dialog-leave-active {
  transition: opacity 180ms ease;
}

.design-save-dialog-enter-active .design-save-dialog-panel,
.design-save-dialog-leave-active .design-save-dialog-panel {
  transition: transform 180ms ease, opacity 180ms ease;
}

.design-save-dialog-enter-from,
.design-save-dialog-leave-to {
  opacity: 0;
}

.design-save-dialog-enter-from .design-save-dialog-panel,
.design-save-dialog-leave-to .design-save-dialog-panel {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
