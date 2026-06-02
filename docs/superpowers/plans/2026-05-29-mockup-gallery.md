# Mockup Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the left-sidebar MockupPanel with a "Design | Mockups" tab switch in the center workspace that shows a lifestyle mockup gallery using CSS `mix-blend-mode: multiply` compositing — zero latency, zero API cost.

**Architecture:** Four tasks in dependency order: types → script cleanup → new script additions → new component → template wiring. `[id].vue` gains `renderDesignOnlyCanvas` (Canvas 2D, transparent bg, display resolution) and `designOverlayUrls` (data URLs keyed by viewId). `MockupGallery.vue` composites the design over the lifestyle photo purely with CSS `position: absolute` + `mix-blend-mode`.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Canvas 2D API, VueUse `useDebounceFn` (auto-imported), Tailwind CSS, Phosphor Icons.

---

## File Map

| Action | File | What changes |
|---|---|---|
| Modify | `types/editor-product.d.ts` | Add `printZone` + `blendMode` to `EditorProductLifestyleMockup` |
| Delete | `app/components/design/panels/MockupPanel.vue` | Replaced by MockupGallery |
| Modify | `app/pages/design/[id].vue` — script | Remove mockup tool/imports/computeds; add `activeWorkspaceTab`, `designOverlayUrls`, `renderDesignOnlyCanvas`, `updateDesignOverlays`, `allEditorMockups` |
| Modify | `app/pages/design/[id].vue` — template | Tab switch in toolbar; v-show panels; wire MockupGallery |
| Create | `app/components/design/MockupGallery.vue` | Thumbnail strip + large view + download |

---

## Task 1: Update TypeScript types

**Files:**
- Modify: `types/editor-product.d.ts`

- [ ] **Step 1: Add `printZone` and `blendMode` to `EditorProductLifestyleMockup`**

The type currently is (lines 27–34):
```typescript
export type EditorProductLifestyleMockup = {
  viewId: string
  previewColorId: string
  previewColorHex: string
  src: string
  width: number
  height: number
}
```

Replace it with:
```typescript
export type EditorProductLifestyleMockup = {
  viewId: string
  previewColorId: string
  previewColorHex: string
  src: string
  width: number
  height: number
  printZone?: { x: number; y: number; w: number; h: number } | null
  blendMode?: 'multiply' | 'screen' | 'overlay' | null
}
```

`printZone` values are 0–1 ratios of the lifestyle photo dimensions (e.g., `x: 0.30` = 30% from left). `blendMode` defaults to `'multiply'` when absent.

- [ ] **Step 2: Commit**

```bash
git add types/editor-product.d.ts
git commit -m "feat: add printZone and blendMode fields to EditorProductLifestyleMockup"
```

---

## Task 2: Remove old MockupPanel — script cleanup in `[id].vue`

**Files:**
- Modify: `app/pages/design/[id].vue` (script section only)
- Delete: `app/components/design/panels/MockupPanel.vue`

- [ ] **Step 1: Delete MockupPanel.vue**

```bash
rm app/components/design/panels/MockupPanel.vue
```

- [ ] **Step 2: Remove import and add MockupGallery import (line 5)**

Change:
```typescript
import DesignMockupPanel from '~/components/design/panels/MockupPanel.vue'
```
To:
```typescript
import DesignMockupGallery from '~/components/design/MockupGallery.vue'
```

- [ ] **Step 3: Remove `'mockup'` from `EditorToolId` (line 46)**

Change:
```typescript
type EditorToolId = 'mockup' | 'upload' | 'image' | 'text' | 'product' | 'saved' | 'issues' | 'guide'
```
To:
```typescript
type EditorToolId = 'upload' | 'image' | 'text' | 'product' | 'saved' | 'issues' | 'guide'
```

- [ ] **Step 4: Remove mockup entry from `editorToolsTop` (lines 174–181)**

Change:
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
To:
```typescript
const editorToolsTop = [
  { id: 'upload', label: 'Upload', icon: 'ph:upload-simple' },
  { id: 'image', label: 'Image', icon: 'ph:image-square' },
  { id: 'text', label: 'Text', icon: 'ph:text-t' },
  { id: 'product', label: 'Product', icon: 'ph:package' },
  { id: 'saved', label: 'Saved', icon: 'ph:bookmark-simple' },
] satisfies { id: EditorToolId, label: string, icon: string }[]
```

- [ ] **Step 5: Remove `activeMockups` and `activeLifestyleMockup` computeds (lines 295–305)**

Delete these lines entirely:
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

- [ ] **Step 6: Commit**

```bash
git add app/pages/design/[id].vue
git commit -m "refactor: remove MockupPanel and mockup tool from design editor"
```

---

## Task 3: Add new state and rendering functions to `[id].vue` script

**Files:**
- Modify: `app/pages/design/[id].vue` (script section only)

All additions go in the `<script setup>` section. Add them after the existing `activeMockup` computed (around line 293 after Task 2's cleanup).

- [ ] **Step 1: Add `activeWorkspaceTab`, `designOverlayUrls`, and `allEditorMockups`**

Add after `const activeMockup = computed...`:

```typescript
const activeWorkspaceTab = ref<'design' | 'mockups'>('design')
const designOverlayUrls = ref<Record<string, string | null>>({})
const allEditorMockups = computed(() => editor.value?.mockups ?? [])
```

- [ ] **Step 2: Add `renderDesignOnlyCanvas` function**

Add after the `allEditorMockups` computed. This function renders design objects for a given view onto a transparent canvas at display resolution (max 800px). It uses `artworkImageElements` (already cached, no CORS needed) and skips uncached images:

```typescript
const DISPLAY_CANVAS_MAX_PX = 800

const renderDesignOnlyCanvas = async (view: EditorProductView): Promise<HTMLCanvasElement | null> => {
  const objects = designObjectsByView.value[view.id] ?? []
  const area = view.printArea

  if (!objects.length) return null

  const aspectRatio = area.height / area.width
  const canvasW = DISPLAY_CANVAS_MAX_PX
  const canvasH = Math.round(canvasW * aspectRatio)
  const scaleX = canvasW / area.width
  const scaleY = canvasH / area.height

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  ctx.clearRect(0, 0, canvasW, canvasH)

  const normalizedObjects = objects.map(object => ({
    ...object,
    x: object.x - area.x,
    y: object.y - area.y,
  }))

  for (const object of normalizedObjects) {
    if (object.type === 'image' && object.src) {
      const img = artworkImageElements.value[object.assetId]

      if (!img) continue

      const destX = object.x * scaleX
      const destY = object.y * scaleY
      const destW = object.width * scaleX
      const destH = object.height * scaleY
      const rotation = (object.rotation * Math.PI) / 180

      ctx.save()
      ctx.translate(destX + destW / 2, destY + destH / 2)
      ctx.rotate(rotation)
      ctx.drawImage(img, -destW / 2, -destH / 2, destW, destH)
      ctx.restore()
    }
    else if (object.type === 'text' && object.text) {
      const fontSize = Math.max(1, Math.round((object.fontSize ?? 28) * scaleY))
      const destX = object.x * scaleX
      const destY = object.y * scaleY
      const destW = object.width * scaleX
      const destH = object.height * scaleY
      const rotation = (object.rotation * Math.PI) / 180

      ctx.save()
      ctx.translate(destX + destW / 2, destY + destH / 2)
      ctx.rotate(rotation)
      ctx.fillStyle = object.fill ?? '#111314'
      ctx.font = `${object.fontStyle ?? 'normal'} ${fontSize}px ${object.fontFamily ?? 'Arial'}`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillText(object.text, 0, 0, destW)
      ctx.restore()
    }
  }

  return canvas
}
```

- [ ] **Step 3: Add `updateDesignOverlays` debounced function and watcher**

Add immediately after `renderDesignOnlyCanvas`:

```typescript
const updateDesignOverlays = useDebounceFn(async () => {
  if (activeWorkspaceTab.value !== 'mockups') return

  const urls: Record<string, string | null> = {}

  for (const view of availableViews.value) {
    const canvas = await renderDesignOnlyCanvas(view)
    urls[view.id] = canvas ? canvas.toDataURL('image/png') : null
  }

  designOverlayUrls.value = urls
}, 200)

if (import.meta.client) {
  watch(
    [activeWorkspaceTab, designObjectsByView, artworkImageElements],
    () => updateDesignOverlays(),
  )
}
```

Note: wrapped in `if (import.meta.client)` because `renderDesignOnlyCanvas` calls `document.createElement` (browser-only). The existing `if (import.meta.client)` block around line 2054 shows the established pattern.

- [ ] **Step 4: Commit**

```bash
git add app/pages/design/[id].vue
git commit -m "feat: add renderDesignOnlyCanvas and designOverlayUrls for mockup gallery"
```

---

## Task 4: Create `MockupGallery.vue` component

**Files:**
- Create: `app/components/design/MockupGallery.vue`

- [ ] **Step 1: Create the file**

```vue
<script setup lang="ts">
import type { EditorProductLifestyleMockup, EditorProductView } from '~~/types/editor-product'

const props = defineProps<{
  mockups: EditorProductLifestyleMockup[]
  views: EditorProductView[]
  designOverlayUrls: Record<string, string | null>
  selectedColorId: string
  activeViewId: string
}>()

const selectedViewId = ref(props.activeViewId)

watch(() => props.activeViewId, (id) => {
  selectedViewId.value = id
})

function mockupForView(viewId: string): EditorProductLifestyleMockup | null {
  const candidates = props.mockups.filter(m => m.viewId === viewId)

  return candidates.find(m => m.previewColorId === props.selectedColorId)
    ?? candidates[0]
    ?? null
}

function mockupSrcForView(view: EditorProductView): string {
  return mockupForView(view.id)?.src ?? view.mockup.src
}

const activeView = computed(() => props.views.find(v => v.id === selectedViewId.value) ?? props.views[0] ?? null)
const activeMockup = computed(() => activeView.value ? mockupForView(activeView.value.id) : null)
const activeMockupSrc = computed(() => activeMockup.value?.src ?? activeView.value?.mockup.src ?? '')
const activePrintZone = computed(() => activeMockup.value?.printZone ?? null)
const activeBlendMode = computed(() => activeMockup.value?.blendMode ?? 'multiply')
const activeDesignOverlayUrl = computed(() => props.designOverlayUrls[selectedViewId.value] ?? null)

const isDownloading = ref(false)

const loadImageForCanvas = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()

    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous'
    }

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load: ${src}`))
    img.src = src
  })

const downloadMockup = async () => {
  const view = activeView.value
  const mockup = activeMockup.value

  if (!view) return

  const bgSrc = mockup?.src ?? view.mockup.src
  isDownloading.value = true

  try {
    const bgImg = await loadImageForCanvas(bgSrc)
    const W = bgImg.naturalWidth || 3000
    const H = bgImg.naturalHeight || 3000

    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.drawImage(bgImg, 0, 0, W, H)

    const overlayUrl = props.designOverlayUrls[view.id]
    const pz = mockup?.printZone

    if (overlayUrl && pz) {
      const overlayImg = await loadImageForCanvas(overlayUrl)
      ctx.globalCompositeOperation = (mockup?.blendMode ?? 'multiply') as GlobalCompositeOperation
      ctx.drawImage(overlayImg, pz.x * W, pz.y * H, pz.w * W, pz.h * H)
      ctx.globalCompositeOperation = 'source-over'
    }

    canvas.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mockup-${view.id}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }
  catch {
    // CORS or network failure — download silently skipped
  }
  finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <div class="flex h-full min-h-0">
    <!-- Thumbnail strip -->
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
        />
        <!-- Design overlay on thumbnail -->
        <img
          v-if="designOverlayUrls[view.id] && mockupForView(view.id)?.printZone"
          :src="designOverlayUrls[view.id]!"
          alt=""
          class="pointer-events-none absolute"
          :style="{
            left: `${(mockupForView(view.id)!.printZone!.x) * 100}%`,
            top: `${(mockupForView(view.id)!.printZone!.y) * 100}%`,
            width: `${(mockupForView(view.id)!.printZone!.w) * 100}%`,
            height: `${(mockupForView(view.id)!.printZone!.h) * 100}%`,
            mixBlendMode: (mockupForView(view.id)?.blendMode ?? 'multiply') as string,
          }"
        />
        <span class="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1 py-0.5 text-center text-[9px] text-white">
          {{ view.label }}
        </span>
      </button>
    </div>

    <!-- Large view + download -->
    <div class="flex min-h-0 flex-1 flex-col">
      <!-- Large mockup -->
      <div class="flex flex-1 items-center justify-center overflow-hidden bg-[#f9f9f9] p-4">
        <div class="relative max-h-full max-w-full">
          <img
            :src="activeMockupSrc"
            :alt="activeView?.label ?? 'Mockup'"
            class="block max-h-full max-w-full object-contain"
          />
          <!-- Design overlay -->
          <img
            v-if="activeDesignOverlayUrl && activePrintZone"
            :src="activeDesignOverlayUrl"
            alt=""
            class="pointer-events-none absolute"
            :style="{
              left: `${activePrintZone.x * 100}%`,
              top: `${activePrintZone.y * 100}%`,
              width: `${activePrintZone.w * 100}%`,
              height: `${activePrintZone.h * 100}%`,
              mixBlendMode: activeBlendMode as string,
            }"
          />
        </div>
      </div>

      <!-- Download -->
      <div class="shrink-0 border-t border-borderSecondary p-3">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-lg border border-borderSecondary bg-white py-2.5 text-sm font-medium text-primary transition hover:bg-cotton-grey-1 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isDownloading"
          @click="downloadMockup"
        >
          <Icon
            name="ph:download-simple"
            size="18px"
          />
          {{ isDownloading ? 'Downloading...' : 'Download' }}
        </button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/design/MockupGallery.vue
git commit -m "feat: add MockupGallery component with mix-blend-mode compositing"
```

---

## Task 5: Update `[id].vue` template

**Files:**
- Modify: `app/pages/design/[id].vue` (template section only)

Four changes to make in the template.

- [ ] **Step 1: Add `v-show` to left `<aside>` (line ~2271)**

Change:
```html
<aside class="order-2 flex w-full shrink-0 lg:order-1 lg:w-[334px]">
```
To:
```html
<aside v-show="activeWorkspaceTab === 'design'" class="order-2 flex w-full shrink-0 lg:order-1 lg:w-[334px]">
```

- [ ] **Step 2: Remove `<DesignMockupPanel>` from left panel and fix upload panel conditional (lines ~2338–2349)**

Remove the `<DesignMockupPanel>` block and change `v-else-if` on `<DesignUploadPanel>` to `v-if`:

Before:
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
```

After:
```html
<div class="min-h-0 flex-1">
  <DesignUploadPanel
    v-if="activeTool === 'upload'"
```

- [ ] **Step 3: Restructure center toolbar — add tab switch (lines ~2416–2494)**

Change the outer toolbar div from `flex justify-between` to `grid grid-cols-[1fr_auto_1fr]` and insert the tab switch between color pickers and zoom controls.

Change:
```html
<div class="flex items-center justify-between border-b border-borderSecondary px-3 py-2 lg:px-4">
  <div class="flex flex-wrap items-center gap-2">
```
To:
```html
<div class="grid grid-cols-[1fr_auto_1fr] items-center border-b border-borderSecondary px-3 py-2 lg:px-4">
  <div class="flex flex-wrap items-center gap-2">
```

After the closing `</div>` of the color pickers block and before the opening `<div class="flex items-center gap-1 lg:gap-2">` of the zoom controls, insert the tab switch:

```html
          </div>

          <!-- Design | Mockups tab switch -->
          <div class="flex overflow-hidden rounded-[8px] border border-borderSecondary">
            <button
              type="button"
              class="px-4 py-1.5 text-[13px] font-semibold transition"
              :class="activeWorkspaceTab === 'design' ? 'bg-primary text-white' : 'bg-white text-[#6d6d6d] hover:bg-cotton-grey-1'"
              @click="activeWorkspaceTab = 'design'"
            >
              Design
            </button>
            <button
              type="button"
              class="border-l border-borderSecondary px-4 py-1.5 text-[13px] font-semibold transition"
              :class="activeWorkspaceTab === 'mockups' ? 'bg-primary text-white' : 'bg-white text-[#6d6d6d] hover:bg-cotton-grey-1'"
              @click="activeWorkspaceTab = 'mockups'"
            >
              Mockups
            </button>
          </div>

          <div class="flex items-center justify-end gap-1 lg:gap-2">
```

Also add `justify-end` to the zoom controls wrapper (the existing `<div class="flex items-center gap-1 lg:gap-2">` becomes `<div class="flex items-center justify-end gap-1 lg:gap-2">`).

- [ ] **Step 4: Add `v-show` to canvas div and wire `<DesignMockupGallery>` (lines ~2496–2576)**

Change:
```html
          <div
            ref="workspaceRef"
            class="relative flex-1 bg-white"
          >
```
To:
```html
          <div
            v-show="activeWorkspaceTab === 'design'"
            ref="workspaceRef"
            class="relative flex-1 bg-white"
          >
```

After the closing `</div>` of the canvas (line ~2575), before `</section>`, add:

```html
          <DesignMockupGallery
            v-if="activeWorkspaceTab === 'mockups'"
            class="flex-1 min-h-0"
            :mockups="allEditorMockups"
            :views="availableViews"
            :design-overlay-urls="designOverlayUrls"
            :selected-color-id="selectedColorId"
            :active-view-id="activeViewId"
          />
```

- [ ] **Step 5: Add `v-show` to right `<aside>` (line ~2578)**

Change:
```html
<aside class="order-3 flex w-full shrink-0 flex-col gap-1 lg:w-[327px]">
```
To:
```html
<aside v-show="activeWorkspaceTab === 'design'" class="order-3 flex w-full shrink-0 flex-col gap-1 lg:w-[327px]">
```

- [ ] **Step 6: Verify in browser**

Run `pnpm dev` and open the design editor (`http://uandiplus.test:3000/design/<slug>`).

Expected:
- **Design tab** (default): editor looks exactly as before — tools panel visible, Konva canvas visible, attributes panel visible
- **Mockups tab**: both side panels hidden, center area shows `MockupGallery` with thumbnail strip on the left and large view on the right
- Thumbnails show all product views (front, back, sleeve, etc.) with the view label at the bottom
- If `editor.mockups[]` entries have `printZone`, the design overlay (from `designOverlayUrls`) appears positioned over the lifestyle photo with `mix-blend-mode: multiply`
- If no `printZone`, the lifestyle photo shows without overlay
- Download button triggers `canvas.toBlob()` download
- Switching back to Design tab restores all panels

- [ ] **Step 7: Commit**

```bash
git add app/pages/design/[id].vue
git commit -m "feat: add Design | Mockups tab switch with gallery wiring"
```

---

## Self-Review

**Spec coverage:**
- [x] Tab switch "Design | Mockups" in center workspace toolbar — Task 5 Step 3
- [x] Left panel hidden when Mockups — Task 5 Step 1
- [x] Right panel hidden when Mockups — Task 5 Step 5
- [x] Canvas hidden when Mockups (v-show preserves Konva state) — Task 5 Step 4
- [x] All product views shown as thumbnails — MockupGallery iterates `props.views`
- [x] CSS mix-blend-mode overlay — Task 4 template
- [x] `printZone` coordinates from API — Task 1 type + Task 4 usage
- [x] `blendMode` field (default `'multiply'`) — Task 1 type + Task 4 `activeBlendMode`
- [x] Fallback to flat product image when no lifestyle mockup — `mockupSrcForView` falls back to `view.mockup.src`
- [x] Download at full resolution — Task 4 `downloadMockup`
- [x] `renderDesignOnlyCanvas` transparent bg — Task 3 `ctx.clearRect()`
- [x] 200ms debounce on overlay updates — Task 3 `useDebounceFn(..., 200)`
- [x] Old MockupPanel removed — Task 2
- [x] `activeMockups` + `activeLifestyleMockup` removed — Task 2

**Type consistency:**
- `EditorProductLifestyleMockup` defined in Task 1 with `printZone` and `blendMode`; used in Task 4 `activeMockup`, `activePrintZone`, `activeBlendMode` — all reference the same type ✓
- `mockupForView()` returns `EditorProductLifestyleMockup | null` — template uses `?.printZone`, `?.blendMode` safely ✓
- `designOverlayUrls: Record<string, string | null>` — defined in Task 3, passed as prop in Task 5, typed in Task 4 props ✓
- `allEditorMockups` (Task 3) passed as `mockups` prop (Task 5) — matches `EditorProductLifestyleMockup[]` ✓
- `DISPLAY_CANVAS_MAX_PX = 800` — constant used only in `renderDesignOnlyCanvas` ✓
