<script setup lang="ts">
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import type { DesignEditorAsset, DesignEditorDialogTab, DesignEditorUploadAsset } from '~/data/design-editor'
import DesignAssetGrid from '~/components/design/panels/AssetGrid.vue'
import DesignUploadAssetCard from '~/components/design/panels/UploadAssetCard.vue'

const props = defineProps<{
  historyAssets: DesignEditorAsset[]
  uploadedAssets: DesignEditorUploadAsset[]
  activeUploadedAssetId: string | null
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  'open-image-management': [tab: DesignEditorDialogTab]
  'upload-file': [file: File]
  'select-uploaded-asset': [id: string]
  'remove-uploaded-asset': [id: string]
  'retry-load': []
}>()

const activeTab = ref<'upload' | 'history'>('upload')
const buttonUploadRef = ref<UploadInstance>()
const dropzoneUploadRef = ref<UploadInstance>()

const uploadingAsset = computed(() => props.uploadedAssets.find(asset => asset.status === 'uploading') ?? null)
const hasUploadedAssets = computed(() => props.uploadedAssets.length > 0)
const isEmptyState = computed(() => !props.loading && !hasUploadedAssets.value)

const handleUploadChange: UploadProps['onChange'] = (uploadFile) => {
  const rawFile = uploadFile.raw as UploadRawFile | undefined

  if (!rawFile) {
    return
  }

  emit('upload-file', rawFile)
  buttonUploadRef.value?.clearFiles()
  dropzoneUploadRef.value?.clearFiles()
}
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="p-3">
      <ElUpload
        ref="buttonUploadRef"
        action="#"
        multiple
        :auto-upload="false"
        :show-file-list="false"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        class="design-editor-upload-trigger block w-full"
        :on-change="handleUploadChange"
      >
        <button
          type="button"
          class="flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white"
          :class="uploadingAsset ? 'bg-[#4f4f52]' : 'bg-primary'"
        >
          <Icon
            :name="uploadingAsset ? 'ph:spinner-gap' : 'ph:upload-simple'"
            size="18px"
            :class="uploadingAsset ? 'animate-spin' : ''"
          />
          <span>Upload</span>
        </button>
      </ElUpload>
    </div>

    <div class="min-h-0 flex-1 px-3 pb-3">
      <ElTabs
        v-model="activeTab"
        class="design-editor-tabs h-full"
      >
        <ElTabPane
          label="UPLOAD"
          name="upload"
          class="h-full"
        >
          <ElScrollbar height="100%">
            <div class="space-y-6 pr-1 pt-2">
              <div class="space-y-3">
                <p class="text-sm font-medium text-primary">
                  Folders
                </p>
                <button
                  type="button"
                  class="flex items-center gap-3 rounded-lg border border-dashed border-borderSecondary px-3 py-3 text-sm text-primary transition hover:border-primary"
                >
                  <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-cotton-grey-1">
                    <Icon
                      name="ph:folder-plus"
                      size="18px"
                    />
                  </span>
                  <span>Create folder</span>
                </button>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-medium text-primary">
                    All images
                  </p>

                  <button
                    type="button"
                    class="text-xs font-medium text-[#b0b4b7] transition hover:text-primary"
                    @click="emit('open-image-management', 'mine')"
                  >
                    View All
                  </button>
                </div>

                <div
                  v-if="uploadingAsset"
                  class="flex items-center gap-2 text-[10px] font-normal leading-[130%] text-black"
                >
                  <span class="min-w-[42px]">{{ uploadingAsset.speedLabel }}</span>
                  <ElProgress
                    :percentage="uploadingAsset.progress"
                    :show-text="false"
                    :stroke-width="4"
                    color="#111314"
                    class="flex-1"
                  />
                  <span class="min-w-[28px] text-right">{{ uploadingAsset.progress }}%</span>
                </div>

                <div
                  v-if="props.loading && !hasUploadedAssets"
                  class="grid grid-cols-2 gap-[10px]"
                >
                  <ElSkeleton
                    v-for="index in 4"
                    :key="index"
                    animated
                    class="h-[114px] w-[114px]"
                  >
                    <template #template>
                      <ElSkeletonItem
                        variant="image"
                        class="h-[114px] w-[114px] rounded-[6px]"
                      />
                    </template>
                  </ElSkeleton>
                </div>

                <div
                  v-else-if="hasUploadedAssets"
                  class="grid grid-cols-2 gap-[10px]"
                >
                  <DesignUploadAssetCard
                    v-for="asset in props.uploadedAssets"
                    :key="asset.id"
                    :asset="asset"
                    :active="asset.id === props.activeUploadedAssetId"
                    @select="emit('select-uploaded-asset', $event)"
                    @remove="emit('remove-uploaded-asset', $event)"
                  />
                </div>

                <ElUpload
                  v-else
                  ref="dropzoneUploadRef"
                  drag
                  action="#"
                  multiple
                  :auto-upload="false"
                  :show-file-list="false"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  class="design-editor-upload"
                  :on-change="handleUploadChange"
                >
                  <div class="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-borderSecondary px-6 py-10 text-center">
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
                      class="mt-4 max-w-[220px] text-xs leading-5 text-[#d14343]"
                    >
                      {{ props.errorMessage }}
                    </p>

                    <button
                      v-if="props.errorMessage && isEmptyState"
                      type="button"
                      class="mt-4 inline-flex items-center justify-center rounded-lg border border-borderSecondary px-3 py-2 text-xs font-medium text-primary transition hover:border-primary"
                      @click.stop="emit('retry-load')"
                    >
                      Retry
                    </button>
                  </div>
                </ElUpload>
              </div>
            </div>
          </ElScrollbar>
        </ElTabPane>

        <ElTabPane
          label="HISTORY"
          name="history"
          class="h-full"
        >
          <div class="flex h-full flex-col pt-2">
            <div class="mb-3 flex items-center justify-end">
              <button
                type="button"
                class="text-xs font-medium text-[#686f72] transition hover:text-primary"
                @click="emit('open-image-management', 'history')"
              >
                View All
              </button>
            </div>

            <ElScrollbar height="100%">
              <div
                v-if="props.loading && !props.historyAssets.length"
                class="grid grid-cols-2 gap-4 pr-1"
              >
                <ElSkeleton
                  v-for="index in 4"
                  :key="`history-skeleton-${index}`"
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
                v-else
                class="pr-1"
              >
                <DesignAssetGrid
                  :assets="props.historyAssets"
                  :empty-message="props.errorMessage || 'Your upload history is empty.'"
                />
              </div>
            </ElScrollbar>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>
  </div>
</template>
