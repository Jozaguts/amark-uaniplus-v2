# Mockup Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Mockup tool to the design editor left sidebar that renders a live composited preview of the user's design on top of a lifestyle mockup image, with a download button.

**Architecture:** A new `MockupPanel.vue` component owns an off-screen Canvas 2D that composites the lifestyle mockup background + design objects using scale factors derived from the flat product image dimensions. It is driven by props from `[id].vue` and re-renders reactively (debounced 120ms) when the active view, selected color, or design objects change. No external libraries needed.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Canvas 2D API, VueUse `useDebounceFn` (already auto-imported via `@vueuse/nuxt`), Tailwind CSS, Phosphor Icons.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `types/editor-product.d.ts` | Add `EditorProductLifestyleMockup` type; add `mockups?` field to `EditorProductConfig` |
| Modify | `app/pages/design/[id].vue` | Add `'mockup'` to `EditorToolId`; add mockup tool to sidebar list; add `activeMockups` + `activeLifestyleMockup` computeds; wire `DesignMockupPanel` in template |
| Create | `app/components/design/panels/MockupPanel.vue` | Compositing logic, display, download button |

---

## Task 1: Add TypeScript types

**Files:**
- Modify: `types/editor-product.d.ts`

- [ ] **Step 1: Add `EditorProductLifestyleMockup` type and update `EditorProductConfig`**

Open `types/editor-product.d.ts`. Add the new type after `EditorProductMockup` (line 25) and add `mockups?` to `EditorProductConfig`:

```typescript
// Add after the existing EditorProductMockup type (after line 25):
export type EditorProductLifestyleMockup = {
  viewId: string
  src: string
  width: number
  height: number
  previewColorId: string
  previewColorHex: string
}
```

In `EditorProductConfig` (currently ends around line 91), add `mockups?`:

```typescript
export type EditorProductConfig = {
  enabled: boolean
  coordinateSpace: EditorCoordinateSpace
  defaultViewId: string | null
  selectedColorId: string | null
  selectedTechniqueId: string | null
  colors: EditorProductColor[]
  techniques: EditorProductTechnique[]
  views: EditorProductView[]
  word_art: EditorWordArt
  mockups?: EditorProductLifestyleMockup[]   // ← add this line
}
```

- [ ] **Step 2: Commit**

```bash
git add types/editor-product.d.ts
git commit -m "feat: add EditorProductLifestyleMockup type"
```

---

## Task 2: Add mockup tool and computed selectors to [id].vue

**Files:**
- Modify: `app/pages/design/[id].vue`

No template changes yet — only the script section.

- [ ] **Step 1: Add `'mockup'` to `EditorToolId` (line 45)**

Change:
```typescript
type EditorToolId = 'upload' | 'image' | 'text' | 'product' | 'saved' | 'issues' | 'guide'
```
To:
```typescript
type EditorToolId = 'mockup' | 'upload' | 'image' | 'text' | 'product' | 'saved' | 'issues' | 'guide'
```

- [ ] **Step 2: Add `'mockup'` as first entry in `editorToolsTop` (line 173)**

Change:
```typescript
const editorToolsTop = [
  { id: 'upload', label: 'Upload', icon: 'ph:upload-simple' },
  { id: 'image', label: 'Image', icon: 'ph:image-square' },
  { id: 'text', label: 'Text', icon: 'ph:text-t' },
  { id: 'product', label: 'Product', icon: 'ph:package' },
  { id: 'saved', label: 'Saved', icon: 'ph:bookmark-simple' },
] satisfies { id: EditorToolId, label: string, icon: string }[]
```
To:
```typescript
const editorToolsTop = [
  { id: 'mockup', label: 'Mockup', icon: 'ph:image' },
  { id: 'upload', label: 'Upload', icon: 'ph:upload-simple' },
  { id: 'image', label: 'Image', icon: 'ph:image-square' },
  { id: 'text', label: 'Text', icon: 'ph:text-t' },
  { id: 'product', label: 'Product', icon: 'ph:package' },
  { id: 'saved', label: 'Saved', icon: 'ph:bookmark-simple' },
] satisfies { id: EditorToolId, label: string, icon: string }[]
```

- [ ] **Step 3: Add `activeMockups` and `activeLifestyleMockup` computeds**

Add these two computeds after the existing `activeMockup` computed (around line 291):

```typescript
const activeMockups = computed(() => editor.value?.mockups ?? [])

const activeLifestyleMockup = computed(() => {
  const viewId = activeViewId.value
  const colorId = selectedColorId.value
  const candidates = activeMockups.value.filter(m => m.viewId === viewId)

  return candidates.find(m => m.previewColorId === colorId)
    ?? candidates[0]
    ?? null
})
```

- [ ] **Step 4: Commit**

```bash
git add app/pages/design/[id].vue
git commit -m "feat: add mockup tool to sidebar and lifestyle mockup computed selectors"
```

---

## Task 3: Create MockupPanel component

**Files:**
- Create: `app/components/design/panels/MockupPanel.vue`

- [ ] **Step 1: Create the file with compositing logic and template**

Create `app/components/design/panels/MockupPanel.vue` with this complete content:

```vue
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

const activeCanvas = ref<HTMLCanvasElement | null>(null)
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
      }
    }

    activeCanvas.value = canvas
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
    props.designObjects.map(o => `${o.id}:${o.x}:${o.y}:${o.width}:${o.height}:${o.rotation}:${o.text ?? o.src}`).join('|'),
  ],
  () => debouncedRender(),
  { immediate: true },
)

const downloadMockup = () => {
  const canvas = activeCanvas.value

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
    <div class="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-cotton-grey-1 p-4">
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
```

- [ ] **Step 2: Commit**

```bash
git add app/components/design/panels/MockupPanel.vue
git commit -m "feat: add MockupPanel component with canvas compositing and download"
```

---

## Task 4: Wire MockupPanel into the [id].vue template

**Files:**
- Modify: `app/pages/design/[id].vue`

The panel section is the `<div class="min-h-0 flex-1">` block inside the left `<section>` (around line 2322). It renders the active tool panel via `v-if / v-else-if` chains.

- [ ] **Step 1: Add `<DesignMockupPanel>` as the first `v-if` branch in the panel section**

Locate the block that starts with `<DesignUploadPanel v-if="activeTool === 'upload'"` (around line 2323). Add the mockup panel **before** it:

```html
<DesignMockupPanel
  v-if="activeTool === 'mockup'"
  :active-mockup="activeLifestyleMockup"
  :flat-mockup="activeMockup"
  :print-area="activePrintArea"
  :design-objects="activeDesignObjects"
  :artwork-image-elements="artworkImageElements"
  :active-view-id="activeViewId"
/>
<DesignUploadPanel
  v-else-if="activeTool === 'upload'"
  ...
/>
```

The full updated block (replace the entire `<div class="min-h-0 flex-1">` contents):

```html
<div class="min-h-0 flex-1">
  <DesignMockupPanel
    v-if="activeTool === 'mockup'"
    :active-mockup="activeLifestyleMockup"
    :flat-mockup="activeMockup"
    :print-area="activePrintArea"
    :design-objects="activeDesignObjects"
    :artwork-image-elements="artworkImageElements"
    :active-view-id="activeViewId"
  />
  <DesignUploadPanel
    v-else-if="activeTool === 'upload'"
    :history-assets="uploadHistoryAssets"
    :uploaded-assets="uploadedAssets"
    :active-uploaded-asset-id="activeUploadedAssetId"
    :loading="uploadArtworksPending"
    :error-message="combinedUploadErrorMessage"
    @open-image-management="openImageManagement"
    @retry-load="loadUploadArtworks(true)"
    @upload-file="uploadFile"
    @select-uploaded-asset="selectUploadedAsset"
    @remove-uploaded-asset="removeUploadedAsset"
  />
  <DesignImagePanel
    v-else-if="activeTool === 'image'"
    :categories="platformAssetCategories"
    :assets="platformAssets"
    :selected-category="selectedPlatformCategory"
    :active-asset-id="activePlatformAssetId"
    :loading="platformArtworksPending || platformArtworkCategoriesPending"
    :error-message="combinedPlatformArtworkErrorMessage"
    @open-image-management="openImageManagement"
    @update:selected-category="selectPlatformCategory"
    @select-asset="selectPlatformAsset"
    @retry-load="retryPlatformArtworkCatalogLoad"
  />
  <DesignTextPanel
    v-else-if="activeTool === 'text'"
    :text-options="editorTextWordArtOptions"
    :number-options="editorNumberWordArtOptions"
    :show-fallback-notice="usesFallbackWordArtOptions"
    @add-text-word-art="addDesignTextToActiveView"
    @add-number-word-art="addDesignTextToActiveView"
  />
  <DesignProductPanel
    v-else-if="activeTool === 'product' && product"
    :product="product"
    :selected-color-id="selectedColorId"
    :selected-technique-id="selectedTechniqueId"
    :active-view-id="activeViewId"
  />
  <DesignSavedPanel
    v-else-if="activeTool === 'saved'"
    :current-design-id="activeDesignDraftId"
    :refresh-key="savedDraftsRefreshKey"
    @deleted-design="handleDeletedSavedDesign"
  />

  <div
    v-else
    class="flex h-full min-h-[320px] flex-col items-center justify-center p-6 text-center"
  >
    <span class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cotton-grey-1 text-primary">
      <Icon
        :name="activeToolMeta?.icon ?? 'ph:package'"
        size="24px"
      />
    </span>
    <p class="text-sm font-medium text-primary">
      {{ activeToolMeta?.label ?? 'Panel' }}
    </p>
    <p class="mt-2 max-w-[220px] text-xs leading-5 text-[#8b8f94]">
      This panel will be connected next.
    </p>
  </div>
</div>
```

- [ ] **Step 2: Verify the app loads without TypeScript errors**

Run the dev server and open the design editor:

```bash
pnpm dev
```

Open `http://uandiplus.test:3000/design/<any-product-slug>` in the browser.

Expected:
- No red errors in terminal or browser console
- Left sidebar shows "Mockup" as the first icon
- Clicking Mockup shows the panel with the composited preview image
- If the API returns `mockups` for the active view + color, the lifestyle photo appears; otherwise the flat product image appears with the design on top
- The Download button is enabled and clicking it triggers a PNG download

- [ ] **Step 3: Commit**

```bash
git add app/pages/design/[id].vue
git commit -m "feat: wire MockupPanel into design editor sidebar"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Mockup tool in left sidebar, first position
- [x] Panel mirrors active view (props driven by `activeViewId`)
- [x] Lifestyle mockup compositing with Canvas 2D
- [x] Fallback to flat product image when no lifestyle mockup
- [x] Color-aware mockup selection (`previewColorId` match)
- [x] Download button — `canvas.toBlob()` → PNG
- [x] Debounced re-render on design object changes (120ms)
- [x] No "Adjusted mockup" switch
- [x] `editor.mockups[]` at top level of `EditorProductConfig`
- [x] `EditorProductLifestyleMockup` type added
- [x] `activeMockups` + `activeLifestyleMockup` computeds in `[id].vue`

**Type consistency across tasks:**
- `EditorProductLifestyleMockup` defined in Task 1, used in Task 2 (`activeLifestyleMockup` return type) and Task 3 (prop type) — consistent.
- `activeMockup` prop in `MockupPanel` = `EditorProductLifestyleMockup | null` — matches the computed in Task 2.
- `flatMockup` prop = `EditorProductMockup | null` — matches `activeMockup` computed from `[id].vue` line 289 which returns `EditorProductMockup | null`.
- `artworkImageElements` prop type = `Record<string, HTMLImageElement>` — matches `shallowRef<Record<string, HTMLImageElement>>` at line 211.
