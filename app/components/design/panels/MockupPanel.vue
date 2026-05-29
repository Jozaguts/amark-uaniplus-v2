<script setup lang="ts">
import type { DesignDraftCanvasObject } from '~~/types/design-draft'
import type {
  EditorProductLifestyleMockup,
  EditorProductMockup,
  EditorProductPrintArea,
} from '~~/types/editor-product'

const props = defineProps<{
  activeMockup: EditorProductLifestyleMockup | null
  flatMockup: EditorProductMockup | null
  printArea: EditorProductPrintArea | null
  designObjects: DesignDraftCanvasObject[]
  artworkImageElements: Record<string, HTMLImageElement>
  activeViewId: string
}>()

const compositeCanvas = ref<HTMLCanvasElement | null>(null)
const compositeDataUrl = ref<string | null>(null)
const isRendering = ref(false)

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load mockup image: ${src}`))
    img.src = src
  })

const renderComposite = async () => {
  const flat = props.flatMockup

  // Background image: lifestyle photo if available, otherwise flat product image
  const bgSrc = props.activeMockup?.src ?? flat?.src
  const bgWidth = props.activeMockup?.width ?? flat?.width
  const bgHeight = props.activeMockup?.height ?? flat?.height

  if (!bgSrc || !bgWidth || !bgHeight || !flat) {
    compositeDataUrl.value = null
    return
  }

  isRendering.value = true

  try {
    const canvas = document.createElement('canvas')
    canvas.width = bgWidth
    canvas.height = bgHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      compositeDataUrl.value = null
      return
    }

    // Draw background (lifestyle photo or flat product)
    const bgImage = await loadImage(bgSrc)
    ctx.drawImage(bgImage, 0, 0, bgWidth, bgHeight)

    // Scale from flat mockup coordinate space → background image space
    // When activeMockup is null, bg = flat → scaleX/scaleY = 1
    const scaleX = bgWidth / flat.width
    const scaleY = bgHeight / flat.height

    for (const object of props.designObjects) {
      const destX = object.x * scaleX
      const destY = object.y * scaleY
      const destW = object.width * scaleX
      const destH = object.height * scaleY
      const rotation = (object.rotation * Math.PI) / 180

      if (object.type === 'image' && object.src) {
        const img = props.artworkImageElements[object.assetId]
          ?? await loadImage(object.src)

        ctx.save()
        ctx.translate(destX + destW / 2, destY + destH / 2)
        ctx.rotate(rotation)
        ctx.drawImage(img, -destW / 2, -destH / 2, destW, destH)
        ctx.restore()
      }
      else if (object.type === 'text' && object.text) {
        const fontSize = Math.max(1, Math.round((object.fontSize ?? 28) * scaleY))
        const fontStyle = object.fontStyle ?? 'normal'
        const fontFamily = object.fontFamily ?? 'Arial'

        ctx.save()
        ctx.translate(destX + destW / 2, destY + destH / 2)
        ctx.rotate(rotation)
        ctx.fillStyle = object.fill ?? '#111314'
        ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.fillText(object.text, 0, 0, destW)
        ctx.restore()
        // TODO: letterSpacing and textTransform not yet applied — canvas 2D fidelity gap
      }
    }

    compositeCanvas.value = canvas
    compositeDataUrl.value = canvas.toDataURL('image/png')
  }
  catch {
    compositeDataUrl.value = null
  }
  finally {
    isRendering.value = false
  }
}

const debouncedRender = useDebounceFn(renderComposite, 120)

watch(
  () => [
    props.activeMockup?.src,
    props.flatMockup?.src,
    props.designObjects.map(o => `${o.id}:${o.x}:${o.y}:${o.width}:${o.height}:${o.rotation}:${o.text ?? o.src ?? ''}`).join('|'),
  ],
  () => debouncedRender(),
  { immediate: true },
)

watch(
  () => Object.keys(props.artworkImageElements).join(','),
  () => debouncedRender(),
)

const downloadMockup = () => {
  const canvas = compositeCanvas.value

  if (canvas) {
    canvas.toBlob((blob) => {
      if (!blob) {
        return
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mockup-${props.activeViewId}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')

    return
  }

  if (compositeDataUrl.value) {
    const a = document.createElement('a')
    a.href = compositeDataUrl.value
    a.download = `mockup-${props.activeViewId}.png`
    a.click()
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div
      class="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-cotton-grey-1 p-4"
    >
      <div
        v-if="isRendering"
        class="flex flex-col items-center gap-2 text-[#8b8f94]"
      >
        <Icon
          name="ph:spinner-gap"
          size="24px"
          class="animate-spin"
        />
        <span class="text-xs">Generating mockup…</span>
      </div>

      <img
        v-else-if="compositeDataUrl"
        :src="compositeDataUrl"
        alt="Mockup preview"
        class="max-h-full max-w-full rounded object-contain shadow-sm"
      >

      <div
        v-else
        class="flex flex-col items-center gap-2 text-center text-[#8b8f94]"
      >
        <Icon
          name="ph:image"
          size="32px"
          class="opacity-40"
        />
        <p class="text-xs">
          No mockup available for this view.
        </p>
      </div>
    </div>

    <div class="shrink-0 border-t border-borderSecondary p-3">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-lg border border-borderSecondary bg-white py-2.5 text-sm font-medium text-primary transition hover:bg-cotton-grey-1 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!compositeDataUrl"
        @click="downloadMockup"
      >
        <Icon
          name="ph:download-simple"
          size="18px"
        />
        Download
      </button>
    </div>
  </div>
</template>
