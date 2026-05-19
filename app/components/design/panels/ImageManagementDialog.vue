<script setup lang="ts">
import type { UploadProps, UploadRawFile } from 'element-plus'
import type {
  DesignEditorAsset,
  DesignEditorAssetCategory,
  DesignEditorDialogTab,
  DesignEditorUploadAsset,
} from '~/data/design-editor'
import DesignAssetGrid from '~/components/design/panels/AssetGrid.vue'
import DesignUploadAssetCard from '~/components/design/panels/UploadAssetCard.vue'

const props = defineProps<{
  modelValue: boolean
  initialTab: DesignEditorDialogTab
  categories: DesignEditorAssetCategory[]
  historyAssets: DesignEditorAsset[]
  recommendAssets: DesignEditorAsset[]
  selectedRecommendCategory: string
  mineAssets: DesignEditorUploadAsset[]
  activeUploadedAssetId?: string | null
  activeRecommendAssetId?: string | null
  loading?: boolean
  recommendLoading?: boolean
  errorMessage?: string | null
  recommendErrorMessage?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'upload-file': [file: File]
  'select-uploaded-asset': [id: string]
  'select-history-asset': [id: string]
  'select-recommend-asset': [id: string]
  'update:selectedRecommendCategory': [value: string]
  'remove-uploaded-asset': [id: string]
  'retry-load': []
  'retry-recommend-load': []
}>()

const activeTab = ref<DesignEditorDialogTab>('mine')

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

watch(
  () => [props.modelValue, props.initialTab] as const,
  ([isVisible, initialTab]) => {
    if (isVisible) {
      activeTab.value = initialTab
    }
  },
  { immediate: true },
)

const handleUploadChange: UploadProps['onChange'] = (uploadFile) => {
  const rawFile = uploadFile.raw as UploadRawFile | undefined

  if (!rawFile) {
    return
  }

  emit('upload-file', rawFile)
}
</script>

<template>
  <ElDialog
    v-model="visible"
    width="920px"
    top="4vh"
    append-to-body
    destroy-on-close
    class="design-image-management-dialog"
  >
    <template #header>
      <div class="text-[18px] font-semibold text-primary">
        Image Management
      </div>
    </template>

    <ElTabs
      v-model="activeTab"
      class="design-editor-tabs design-editor-dialog-tabs"
    >
      <ElTabPane
        label="MINE"
        name="mine"
      >
        <div class="pt-4">
          <div
            v-if="props.loading && !mineAssets.length"
            class="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <ElSkeleton
              v-for="index in 8"
              :key="`mine-skeleton-${index}`"
              animated
            >
              <template #template>
                <ElSkeletonItem
                  variant="image"
                  class="aspect-square w-full rounded-[6px]"
                />
              </template>
            </ElSkeleton>
          </div>

          <div v-else-if="mineAssets.length">
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              <DesignUploadAssetCard
                v-for="asset in mineAssets"
                :key="asset.id"
                :asset="asset"
                :active="asset.id === activeUploadedAssetId"
                @select="emit('select-uploaded-asset', $event)"
                @remove="emit('remove-uploaded-asset', $event)"
              />
            </div>
          </div>

          <ElUpload
            v-else
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            class="design-editor-upload"
            :on-change="handleUploadChange"
          >
            <div class="flex min-h-[420px] flex-col items-center justify-center rounded-xl px-6 py-10 text-center">
              <span class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cotton-grey-1 text-primary">
                <Icon
                  name="ph:upload-simple"
                  size="24px"
                />
              </span>
              <p class="text-sm font-medium text-primary">
                Upload or drag your files here
              </p>
              <p class="mt-2 text-xs text-[#8b8f94]">
                PNG, JPG or WEBP, max 10MB
              </p>

              <p
                v-if="props.errorMessage"
                class="mt-4 max-w-[260px] text-xs leading-5 text-[#d14343]"
              >
                {{ props.errorMessage }}
              </p>

              <button
                v-if="props.errorMessage"
                type="button"
                class="mt-4 inline-flex items-center justify-center rounded-lg border border-borderSecondary px-3 py-2 text-xs font-medium text-primary transition hover:border-primary"
                @click="emit('retry-load')"
              >
                Retry
              </button>
            </div>
          </ElUpload>
        </div>
      </ElTabPane>

      <ElTabPane
        label="HISTORY"
        name="history"
      >
        <div class="pt-4">
          <div
            v-if="props.loading && !historyAssets.length"
            class="grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            <ElSkeleton
              v-for="index in 8"
              :key="`history-dialog-skeleton-${index}`"
              animated
            >
              <template #template>
                <ElSkeletonItem
                  variant="image"
                  class="aspect-square w-full rounded-[6px]"
                />
              </template>
            </ElSkeleton>
          </div>

          <DesignAssetGrid
            v-else
            :assets="historyAssets"
            :active-asset-id="props.activeUploadedAssetId"
            :empty-message="props.errorMessage || 'Your upload history is empty.'"
            grid-class="grid grid-cols-2 gap-6 md:grid-cols-4"
            item-class="aspect-square"
            @select-asset="emit('select-history-asset', $event)"
          />
        </div>
      </ElTabPane>

      <ElTabPane
        label="RECOMMEND"
        name="recommend"
      >
        <div class="pt-4">
          <ElSelect
            :model-value="props.selectedRecommendCategory"
            placeholder="Select"
            clearable
            class="design-editor-select mb-4 w-full max-w-[300px]"
            @update:model-value="emit('update:selectedRecommendCategory', $event || '')"
          >
            <ElOption
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </ElSelect>

          <ElScrollbar height="520px">
            <div class="pr-2">
              <div
                v-if="props.recommendLoading"
                class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5"
              >
                <ElSkeleton
                  v-for="index in 10"
                  :key="`recommend-skeleton-${index}`"
                  animated
                >
                  <template #template>
                    <ElSkeletonItem
                      variant="image"
                      class="aspect-square w-full rounded-[6px]"
                    />
                  </template>
                </ElSkeleton>
              </div>

              <div
                v-else-if="props.recommendErrorMessage"
                class="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-borderSecondary px-6 py-10 text-center"
              >
                <p class="text-sm text-[#8b8f94]">
                  {{ props.recommendErrorMessage }}
                </p>
                <button
                  type="button"
                  class="mt-4 inline-flex items-center justify-center rounded-lg border border-borderSecondary px-3 py-2 text-xs font-medium text-primary transition hover:border-primary"
                  @click="emit('retry-recommend-load')"
                >
                  Retry
                </button>
              </div>

              <DesignAssetGrid
                v-else
                :assets="props.recommendAssets"
                :active-asset-id="props.activeRecommendAssetId"
                empty-message="No platform images found."
                grid-class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5"
                item-class="aspect-square"
                @select-asset="emit('select-recommend-asset', $event)"
              />
            </div>
          </ElScrollbar>
        </div>
      </ElTabPane>
    </ElTabs>
  </ElDialog>
</template>
