<script setup lang="ts">
import type { DesignEditorUploadAsset } from '~/data/design-editor'

const props = defineProps<{
  asset: DesignEditorUploadAsset
  active?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  remove: [id: string]
}>()
</script>

<template>
  <button
    type="button"
    class="group relative block h-[114px] w-[114px] overflow-hidden rounded-[6px] border bg-white text-left transition"
    :class="active ? 'border-primary shadow-[0_0_0_1px_#111314]' : 'border-[#efefeb] hover:border-borderSecondary'"
    @click="emit('select', asset.id)"
  >
    <div
      v-if="asset.status === 'uploading'"
      class="flex h-full w-full items-center justify-center bg-[#e5e5e3]"
    />

    <img
      v-else
      :src="asset.src"
      :alt="asset.name"
      class="h-full w-full object-cover"
    >

    <div
      v-if="asset.status === 'uploading'"
      class="absolute inset-x-0 bottom-0 flex items-center justify-start p-1"
    >
      <span class="inline-flex items-center gap-1 rounded bg-black/65 px-1.5 py-1 text-[10px] font-medium text-white">
        <Icon
          name="ph:spinner-gap"
          size="12px"
          class="animate-spin"
        />
        <span>{{ asset.progress }}%</span>
      </span>
    </div>

    <button
      v-if="asset.status === 'ready' && asset.canRemove !== false"
      type="button"
      class="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-[4px] bg-white ring-1 ring-[#dbdbd9] transition lg:opacity-0 lg:group-hover:opacity-100"
      @click.stop="emit('remove', asset.id)"
    >
      <Icon
        name="ph:trash"
        size="14px"
        class="text-primary"
      />
    </button>
  </button>
</template>
