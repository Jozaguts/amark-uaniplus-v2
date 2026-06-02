# Mockup Gallery (Design | Mockups Tab Switch) — Design Spec

**Date:** 2026-05-29
**Status:** Approved

---

## Overview

Replace the existing left-sidebar MockupPanel with a full "Design | Mockups" tab switch in the center workspace of the design editor. When the user activates the **Mockups** tab, the left panel hides and the center area shows a lifestyle mockup gallery: thumbnail strip of all product views on the left, large composited preview on the right, download button.

The compositing technique is **CSS `mix-blend-mode: multiply` + Canvas 2D** — entirely client-side, zero latency, zero API costs, zero CORS issues for display.

---

## What Changes vs Current State

### Removed
- `'mockup'` tool from `editorToolsTop` and `EditorToolId` in `app/pages/design/[id].vue`
- `app/components/design/panels/MockupPanel.vue` (the left-sidebar mockup panel)
- `import DesignMockupPanel` from `[id].vue`
- The `activeLifestyleMockup` and `activeMockups` computeds from `[id].vue` (replaced by new logic)

### Added
- `activeWorkspaceTab` ref (`'design' | 'mockups'`) in `[id].vue`
- "Design | Mockups" tab switch UI in the center workspace toolbar
- `app/components/design/MockupGallery.vue` — the new gallery component
- `renderDesignOnlyCanvas(view)` function in `[id].vue` — renders design objects only (transparent background, display resolution)
- `designOverlayUrls` ref (`Record<string, string | null>`) — one data URL per viewId
- `printZone` field in `EditorProductLifestyleMockup` type
- Optional `blendMode` field in `EditorProductLifestyleMockup` type

---

## API Contract Extension

`editor.mockups[]` gains two new optional fields:

```json
{
  "viewId": "front",
  "src": "https://cdn.example.com/mockups/hoodie-white-front.png",
  "width": 3000,
  "height": 3000,
  "previewColorId": "color-white",
  "previewColorHex": "#ffffff",
  "printZone": { "x": 0.30, "y": 0.22, "w": 0.38, "h": 0.42 },
  "blendMode": "multiply"
}
```

| Field | Type | Description |
|---|---|---|
| `printZone` | `{ x, y, w, h: number } \| null` | Position of the design overlay as 0–1 ratio of photo dimensions |
| `blendMode` | `"multiply" \| "screen" \| "overlay" \| null` | CSS `mix-blend-mode` value. Default: `"multiply"`. Use `"screen"` for dark garments. |

---

## TypeScript Types

```typescript
// Extend in types/editor-product.d.ts:
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

---

## New State in `[id].vue`

```typescript
const activeWorkspaceTab = ref<'design' | 'mockups'>('design')

// One composited design PNG per viewId (transparent bg, display resolution ~800px)
const designOverlayUrls = ref<Record<string, string | null>>({})
```

---

## `renderDesignOnlyCanvas(view)` Function

Added to `[id].vue`. Renders design objects for a given view onto a transparent canvas at display resolution (max 800px on longest side). Returns the canvas or null if no objects.

```typescript
const DISPLAY_CANVAS_MAX_PX = 800

const renderDesignOnlyCanvas = async (view: EditorProductView): Promise<HTMLCanvasElement | null> => {
  const objects = designObjectsByView.value[view.id] ?? []
  const area = view.printArea

  if (!objects.length) return null

  // Scale to display resolution
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

  // Transparent background — required for mix-blend-mode: multiply
  ctx.clearRect(0, 0, canvasW, canvasH)

  const normalizedObjects = objects.map(object => ({
    ...object,
    x: object.x - area.x,
    y: object.y - area.y,
  }))

  for (const object of normalizedObjects) {
    if (object.type === 'image' && object.src) {
      const img = artworkImageElements.value[object.assetId]
      if (!img) continue  // skip if not cached — avoids CORS issues

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
    } else if (object.type === 'text' && object.text) {
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

**Debounced update watcher** (only runs when Mockups tab is active or when switching to it):

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

watch(
  [activeWorkspaceTab, designObjectsByView, artworkImageElements],
  () => updateDesignOverlays(),
  { deep: true },
)
```

---

## `MockupGallery.vue` Component

**Location:** `app/components/design/MockupGallery.vue`

**Props:**

| Prop | Type | Description |
|---|---|---|
| `mockups` | `EditorProductLifestyleMockup[]` | All lifestyle mockups for the product (all views, filtered by selected color) |
| `views` | `EditorProductView[]` | All available views (for labels and printArea fallback) |
| `designOverlayUrls` | `Record<string, string \| null>` | Design-only PNG per viewId |
| `selectedColorId` | `string` | For color-aware mockup selection |
| `activeViewId` | `string` | Currently selected view in the Design tab — determines initial thumbnail selection |

**Internal state:**
- `selectedMockupViewId` — which thumbnail is selected (defaults to `activeViewId`)
- `isDownloading` — download pending state

**Template layout:**

```
┌─────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────┐  │
│ │Thumbnails│ │         Large view                │  │
│ │          │ │                                   │  │
│ │ [front]  │ │   <img> modelo (base layer)       │  │
│ │ [back]   │ │   <img> design (multiply overlay) │  │
│ │ [sleeve] │ │                                   │  │
│ │          │ │        [↓ Download]               │  │
│ └──────────┘ └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Thumbnail**: shows the lifestyle photo for the view. If `designOverlayUrls[viewId]` exists AND the mockup has `printZone`, shows the design composited via CSS overlay.

**Large view** (the MockupPreview sub-component or inline):

```html
<div class="relative overflow-hidden">
  <!-- Layer 1: lifestyle photo -->
  <img :src="activeMockupSrc" class="w-full block" />

  <!-- Layer 2: design overlay (only if printZone exists) -->
  <img
    v-if="designOverlayUrl && activePrintZone"
    :src="designOverlayUrl"
    class="absolute pointer-events-none"
    :style="{
      left: `${activePrintZone.x * 100}%`,
      top: `${activePrintZone.y * 100}%`,
      width: `${activePrintZone.w * 100}%`,
      height: `${activePrintZone.h * 100}%`,
      mixBlendMode: activeBlendMode,
    }"
  />
</div>
```

**Fallback when no lifestyle mockup** for a view: show `view.mockup.src` (flat product image) without overlay.

---

## Download

```typescript
const downloadMockup = async () => {
  const mockup = activeMockup.value
  const view = activeView.value
  const objects = designObjectsByView.value[view.id] ?? []

  if (!mockup?.src) return

  isDownloading.value = true

  try {
    const canvas = document.createElement('canvas')
    canvas.width = mockup.width
    canvas.height = mockup.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw lifestyle photo as base
    const bgImg = await loadImage(mockup.src)  // crossOrigin: 'anonymous' — CORS headers required
    ctx.drawImage(bgImg, 0, 0, mockup.width, mockup.height)

    // Draw design objects scaled to printZone absolute coordinates
    if (mockup.printZone && objects.length) {
      const pz = mockup.printZone
      const zoneX = pz.x * mockup.width
      const zoneY = pz.y * mockup.height
      const zoneW = pz.w * mockup.width
      const zoneH = pz.h * mockup.height
      const area = view.printArea
      const scaleX = zoneW / area.width
      const scaleY = zoneH / area.height

      // Set globalCompositeOperation to match blend mode
      ctx.globalCompositeOperation = 'multiply'

      for (const object of objects) {
        // ... same rendering logic as renderDesignOnlyCanvas but at full resolution
      }

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
  } finally {
    isDownloading.value = false
  }
}
```

---

## Editor UI Changes

### Tab switch (center workspace toolbar)

Added between the color pickers and the zoom controls in the center section header:

```html
<div class="flex rounded-lg border border-borderSecondary overflow-hidden">
  <button
    type="button"
    class="px-4 py-1.5 text-sm font-semibold transition"
    :class="activeWorkspaceTab === 'design' ? 'bg-primary text-white' : 'bg-white text-[#6d6d6d] hover:bg-cotton-grey-1'"
    @click="activeWorkspaceTab = 'design'"
  >
    Design
  </button>
  <button
    type="button"
    class="px-4 py-1.5 text-sm font-semibold transition border-l border-borderSecondary"
    :class="activeWorkspaceTab === 'mockups' ? 'bg-primary text-white' : 'bg-white text-[#6d6d6d] hover:bg-cotton-grey-1'"
    @click="activeWorkspaceTab = 'mockups'; updateDesignOverlays()"
  >
    Mockups
  </button>
</div>
```

### Left panel and attributes panel visibility

```html
<!-- Left panel: v-show="activeWorkspaceTab === 'design'" -->
<!-- Right attributes panel: v-show="activeWorkspaceTab === 'design'" -->
<!-- Center canvas: v-show="activeWorkspaceTab === 'design'" -->
<!-- MockupGallery: v-if="activeWorkspaceTab === 'mockups'" -->
```

---[Sagit-Mockup-Solution-Note.html](../../../../../../Downloads/Sagit-Mockup-Solution-Note.html)

## File Map

| Action | File | Change |
|---|---|---|
| Modify | `types/editor-product.d.ts` | Add `printZone` and `blendMode` to `EditorProductLifestyleMockup` |
| Delete | `app/components/design/panels/MockupPanel.vue` | Replaced entirely |
| Modify | `app/pages/design/[id].vue` | Remove mockup tool, add tab switch state, add `renderDesignOnlyCanvas`, add `designOverlayUrls`, add `updateDesignOverlays` watcher, update template |
| Create | `app/components/design/MockupGallery.vue` | New gallery component |

---

## What is NOT Included

- Video mockups (out of scope for this sprint)
- Server-side compositing (purely client-side)
- Admin panel for uploading mockup photos (managed via backend separately)
- Displacement map texture warping (CSS `mix-blend-mode: multiply` achieves the visual effect without a true displacement map)
