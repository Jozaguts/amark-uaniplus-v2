<script setup lang="ts">
import type { DesignEditorAsset } from '~/data/design-editor'

withDefaults(defineProps<{
  assets: DesignEditorAsset[]
  activeAssetId?: string | null
  emptyMessage?: string
  gridClass?: string
  itemClass?: string
}>(), {
  activeAssetId: null,
  emptyMessage: 'No assets found.',
  gridClass: 'grid grid-cols-1 gap-4 justify-items-center',
  itemClass: 'aspect-[2/3]',
})

const emit = defineEmits<{
  'select-asset': [assetId: string]
}>()
</script>

<template>
  <div
    v-if="assets.length"
    :class="gridClass"
  >
    <button
      v-for="asset in assets"
      :key="asset.id"
      type="button"
      class="group flex w-full flex-col items-center gap-2 text-center max-w-[150px]"
      @click="emit('select-asset', asset.id)"
    >
      <div
        class="design-checkerboard flex w-full max-h-[200px] items-center justify-center overflow-hidden rounded-[6px] border border-[#efefeb]"
        :class="[itemClass, asset.id === activeAssetId ? 'ring-2 ring-primary ring-offset-2 ring-offset-white' : '']"
      >
        <img
          :src="asset.src"
          :alt="asset.name"
          class="h-full w-full object-contain transition duration-200 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
    </button>
  </div>

  <div
    v-else
    class="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-borderSecondary px-6 py-10 text-center text-sm text-[#8b8f94]"
  >
    {{ emptyMessage }}
  </div>
</template>
