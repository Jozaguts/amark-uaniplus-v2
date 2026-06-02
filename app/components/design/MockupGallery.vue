<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { EditorProductLifestyleMockup, EditorProductView } from '~~/types/editor-product'
import { designOverlayStyle, isLifestyle, resolvePrintZone, selectMockupForView, tintLayerStyle } from '~/utils/mockupRender'

const props = defineProps<{
  mockups: EditorProductLifestyleMockup[]
  views: EditorProductView[]
  designOverlayUrls: Record<string, string | null>
  selectedColorId: string
  selectedColorHex: string
  activeViewId: string
}>()

const { t } = useI18n()
const selectedViewId = shallowRef(props.activeViewId)
const isDownloading = shallowRef(false)
const downloadError = shallowRef(false)

// The preview <img> can't size from a percentage max-height because its wrapper
// has an auto height (it hugs the image). Measuring the container gives definite
// pixel caps so the mockup fits instead of rendering at its natural size.
const previewContainer = shallowRef<HTMLElement | null>(null)
const { width: previewWidth, height: previewHeight } = useElementSize(previewContainer)
const previewFrameStyle = computed<CSSProperties>(() => ({
  maxWidth: `${Math.max(0, Math.round(previewWidth.value))}px`,
  maxHeight: `${Math.max(0, Math.round(previewHeight.value))}px`,
}))

const mockupsByView = computed(() => {
  return props.views.reduce<Record<string, EditorProductLifestyleMockup | null>>((mockups, view) => {
    mockups[view.id] = selectMockupForView(props.mockups, view, props.selectedColorId)
    return mockups
  }, {})
})

const activeView = computed(() => {
  return props.views.find(view => view.id === selectedViewId.value)
    ?? props.views[0]
    ?? null
})
const activeMockup = computed(() => activeView.value ? mockupsByView.value[activeView.value.id] : null)
const activeMockupSrc = computed(() => activeMockup.value?.src ?? activeView.value?.mockup.src ?? '')
const activeOverlayStyle = computed(() => activeView.value ? overlayStyleForView(activeView.value.id) : null)
const activeTintStyle = computed(() => activeView.value ? tintStyleForView(activeView.value.id) : null)

watch(() => props.activeViewId, (viewId) => {
  selectedViewId.value = viewId
})

watch(selectedViewId, () => {
  downloadError.value = false
})

const mockupSrcForView = (view: EditorProductView) => {
  return mockupsByView.value[view.id]?.src ?? view.mockup.src
}

const resolveZoneForView = (viewId: string) => {
  const view = props.views.find(candidate => candidate.id === viewId)
  return view ? resolvePrintZone(view, mockupsByView.value[view.id]) : null
}

const overlayStyleForView = (viewId: string): CSSProperties | null => {
  const resolved = resolveZoneForView(viewId)
  return resolved ? designOverlayStyle(resolved.zone, resolved.blendMode) : null
}

const tintStyleForView = (viewId: string): CSSProperties | null => {
  const mockup = mockupsByView.value[viewId]
  if (!isLifestyle(mockup) || !mockup?.maskUrl || !props.selectedColorHex) return null
  return tintLayerStyle(mockup.maskUrl, props.selectedColorHex)
}

const loadImageForCanvas = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()

    if (!src.startsWith('data:')) {
      image.crossOrigin = 'anonymous'
    }

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Could not load image: ${src}`))
    image.src = src
  })
}

const downloadMockup = async () => {
  const view = activeView.value

  if (!view) return

  const mockup = activeMockup.value
  const backgroundSrc = mockup?.src ?? view.mockup.src

  isDownloading.value = true
  downloadError.value = false

  try {
    const backgroundImage = await loadImageForCanvas(backgroundSrc)
    const canvas = document.createElement('canvas')
    const width = backgroundImage.naturalWidth || mockup?.width || view.mockup.width
    const height = backgroundImage.naturalHeight || mockup?.height || view.mockup.height

    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')

    if (!context) return

    context.drawImage(backgroundImage, 0, 0, width, height)

    const overlayUrl = props.designOverlayUrls[view.id]
    const resolved = resolveZoneForView(view.id)

    if (overlayUrl && resolved) {
      const overlayImage = await loadImageForCanvas(overlayUrl)
      const { zone, blendMode } = resolved

      context.globalCompositeOperation = blendMode
      context.drawImage(
        overlayImage,
        zone.x * width,
        zone.y * height,
        zone.w * width,
        zone.h * height,
      )
      context.globalCompositeOperation = 'source-over'
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        downloadError.value = true
        return
      }

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = `mockup-${view.id}.png`
      anchor.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }
  catch {
    downloadError.value = true
  }
  finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <div class="flex h-full min-h-0">
    <div class="flex w-[100px] shrink-0 flex-col gap-2 overflow-y-auto border-r border-borderSecondary p-2">
      <button
        v-for="view in views"
        :key="view.id"
        type="button"
        class="relative w-full overflow-hidden rounded border-2 transition"
        :class="selectedViewId === view.id ? 'border-primary' : 'border-transparent hover:border-borderSecondary'"
        @click="selectedViewId = view.id"
      >
        <img
          :src="mockupSrcForView(view)"
          :alt="view.label"
          class="block w-full bg-[#f9f9f9] object-contain"
        >
        <div
          v-if="tintStyleForView(view.id)"
          class="pointer-events-none absolute inset-0"
          :style="tintStyleForView(view.id)!"
        />
        <img
          v-if="designOverlayUrls[view.id] && overlayStyleForView(view.id)"
          :src="designOverlayUrls[view.id]!"
          alt=""
          class="pointer-events-none absolute"
          :style="overlayStyleForView(view.id)!"
        />
        <span class="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1 py-0.5 text-center text-[9px] text-white">
          {{ view.label }}
        </span>
      </button>
    </div>

    <div class="flex min-h-0 flex-1 flex-col">
      <div
        ref="previewContainer"
        class="flex flex-1 items-center justify-center overflow-hidden bg-[#f9f9f9] p-4"
      >
        <div class="relative">
          <img
            v-if="activeMockupSrc"
            :src="activeMockupSrc"
            :alt="activeView?.label ?? t('catalog.designEditor.mockups.previewAlt')"
            class="block object-contain"
            :style="previewFrameStyle"
          >
          <div
            v-if="activeTintStyle"
            class="pointer-events-none absolute inset-0"
            :style="activeTintStyle"
          />
          <img
            v-if="activeView && designOverlayUrls[activeView.id] && activeOverlayStyle"
            :src="designOverlayUrls[activeView.id]!"
            alt=""
            class="pointer-events-none absolute"
            :style="activeOverlayStyle"
          >
        </div>
      </div>

      <div class="shrink-0 border-t border-borderSecondary p-3">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-lg border border-borderSecondary bg-white py-2.5 text-sm font-medium text-primary transition hover:bg-cotton-grey-1 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isDownloading || !activeMockupSrc"
          @click="downloadMockup"
        >
          <Icon
            name="ph:download-simple"
            size="18px"
          />
          {{ isDownloading ? t('catalog.designEditor.mockups.downloading') : t('catalog.designEditor.mockups.download') }}
        </button>
        <p
          v-if="downloadError"
          class="mt-2 text-center text-[11px] text-[#8b8f94]"
        >
          {{ t('catalog.designEditor.mockups.downloadError') }}
        </p>
      </div>
    </div>
  </div>
</template>
