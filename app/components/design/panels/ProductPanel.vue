<script setup lang="ts">
import type { EditorProduct } from '~~/types/editor-product'

const props = defineProps<{
  product: EditorProduct
  selectedColorId: string
  selectedTechniqueId: string
  activeViewId: string
}>()

const editor = computed(() => props.product.editor)
const selectedTechnique = computed(() => {
  return editor.value.techniques.find(option => option.id === props.selectedTechniqueId) ?? editor.value.techniques[0] ?? null
})
const selectedTechniqueLabel = computed(() => {
  return selectedTechnique.value?.name ?? selectedTechnique.value?.label ?? selectedTechnique.value?.id ?? 'N/A'
})
const activeView = computed(() => {
  return editor.value.views.find(view => view.id === props.activeViewId) ?? editor.value.views[0] ?? null
})
const printAreas = computed(() => {
  return editor.value.views.map((view) => {
    return {
      ...view.printArea,
      viewId: view.id,
      viewLabel: view.label,
    }
  })
})
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden px-3 pb-3">
    <ElScrollbar height="100%">
      <div class="space-y-6 pr-1 pt-2">
        <div class="space-y-1 border-b border-borderSecondary pb-4">
          <h2 class="text-[18px] font-medium leading-[1.2] text-primary">
            {{ product.name }}
          </h2>
          <p class="text-sm text-[#8b8f94]">
            {{ product.sku }}
          </p>
        </div>

        <div class="space-y-3 border-b border-borderSecondary pb-4">
          <p class="text-sm font-medium text-primary">
            Select Colors
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="color in editor.colors"
              :key="color.id"
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded-full border border-[#d6d9dc]"
              :style="{ backgroundColor: color.hex }"
            >
              <Icon
                v-if="color.id === selectedColorId"
                name="ph:check"
                size="14px"
                class="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
              />
            </button>
          </div>
        </div>

        <div class="space-y-3 border-b border-borderSecondary pb-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-primary">
                Current view
              </p>
              <p class="mt-2 text-sm leading-6 text-[#686f72]">
                {{ activeView?.label ?? 'N/A' }}
              </p>
            </div>
            <p class="text-sm font-medium text-primary">
              {{ editor.coordinateSpace }}
            </p>
          </div>
        </div>

        <div class="space-y-3 border-b border-borderSecondary pb-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-primary">
                Technique
              </p>
              <p class="mt-2 text-sm leading-6 text-[#686f72]">
                Available decoration methods for this product.
              </p>
            </div>
            <p class="text-sm font-medium text-primary">
              {{ selectedTechniqueLabel }}
            </p>
          </div>
        </div>

        <div class="space-y-3 pb-4">
          <p class="text-sm font-medium text-primary">
            Print areas
          </p>

          <ul class="space-y-2 text-xs">
            <li
              v-for="area in printAreas"
              :key="area.id"
              class="flex items-center justify-between gap-4"
            >
              <span class="text-[#686f72]">{{ area.viewLabel }}</span>
              <span class="text-primary">{{ Math.round(area.width) }} x {{ Math.round(area.height) }} px</span>
            </li>
          </ul>
        </div>
      </div>
    </ElScrollbar>
  </div>
</template>
