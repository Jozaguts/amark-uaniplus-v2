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
            <Icon name="icon:hanger-light" size="30px" />
          </span>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full text-[#8a8f98] transition hover:bg-[#f2f2f0] hover:text-primary"
            aria-label="Close success dialog"
            @click="closeDialog"
          >
            <Icon name="icon:x" size="18px" />
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
              <Icon name="icon:shopping-cart-simple" size="20px" />
            </span>
            <span class="flex flex-1 items-center justify-between gap-3 pl-4">
              <span class="text-sm font-semibold">Add to cart</span>
              <Icon name="icon:arrow-right" size="18px" class="text-[#4d545b]" />
            </span>
          </button>

          <button
            type="button"
            class="flex min-h-[84px] items-center justify-between rounded-2xl border border-borderSecondary px-4 py-4 text-left transition hover:border-primary/30 hover:bg-[#f8f8f6]"
            @click="emit('create-another')"
          >
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f7f5] text-primary">
              <Icon name="icon:paint-brush-broad" size="20px" />
            </span>
            <span class="flex flex-1 items-center justify-between gap-3 pl-4">
              <span class="text-sm font-semibold">Create another design</span>
              <Icon name="icon:arrow-right" size="18px" class="text-[#4d545b]" />
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
