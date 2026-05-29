<script setup lang="ts">
import type {
  DesignEditorAsset,
  DesignEditorAssetCategory,
  DesignEditorDialogTab,
} from '~/data/design-editor'
import DesignAssetGrid from '~/components/design/panels/AssetGrid.vue'

const props = defineProps<{
  categories: DesignEditorAssetCategory[]
  assets: DesignEditorAsset[]
  selectedCategory: string
  activeAssetId?: string | null
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  'open-image-management': [tab: DesignEditorDialogTab]
  'update:selectedCategory': [value: string]
  'select-asset': [id: string]
  'retry-load': []
}>()
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden p-3">
    <div class="mb-3 flex items-center justify-between gap-3">
      <p class="text-2xl font-medium text-primary">
        Recommend
      </p>

      <button
        type="button"
        class="text-xs font-medium text-[#686f72] transition hover:text-primary"
        @click="emit('open-image-management', 'recommend')"
      >
        View All
      </button>
    </div>

    <ElSelect
      :model-value="props.selectedCategory"
      placeholder="Select"
      clearable
      class="design-editor-select mb-3 w-full"
      @update:model-value="emit('update:selectedCategory', $event || '')"
    >
      <ElOption
        v-for="category in categories"
        :key="category.value"
        :label="category.label"
        :value="category.value"
      />
    </ElSelect>

    <ElScrollbar height="100%">
      <div class="space-y-4 pr-1">
        <div
          v-if="props.loading"
          class="grid grid-cols-1 gap-4"
        >
          <ElSkeleton
            v-for="index in 6"
            :key="`platform-image-skeleton-${index}`"
            animated
          >
            <template #template>
              <ElSkeletonItem
                variant="image"
                class="aspect-[4/5] w-full rounded-[6px]"
              />
            </template>
          </ElSkeleton>
        </div>

        <div
          v-else-if="props.errorMessage"
          class="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-borderSecondary px-6 py-10 text-center"
        >
          <p class="text-sm text-[#8b8f94]">
            {{ props.errorMessage }}
          </p>
          <button
            type="button"
            class="mt-4 inline-flex items-center justify-center rounded-lg border border-borderSecondary px-3 py-2 text-xs font-medium text-primary transition hover:border-primary"
            @click="emit('retry-load')"
          >
            Retry
          </button>
        </div>

        <DesignAssetGrid
          v-else
          :assets="props.assets"
          :active-asset-id="props.activeAssetId"
          empty-message="No platform images found."
          @select-asset="emit('select-asset', $event)"
        />

        <p class="pb-3 text-center text-xs text-[#686f72]">
          Didn’t find the style you want?
          <button
            type="button"
            class="underline underline-offset-2 transition hover:text-primary"
          >
            Tell us
          </button>
        </p>
      </div>
    </ElScrollbar>
  </div>
</template>
