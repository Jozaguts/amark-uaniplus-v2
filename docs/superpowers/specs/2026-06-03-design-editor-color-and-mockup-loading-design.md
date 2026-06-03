# Design Editor — Color in Design tab + Mockups loading overlay — Design

Date: 2026-06-03
Status: Approved (brainstorm)
Repo: `revolve` (Nuxt 4). File: `app/pages/design/[id].vue` (+ a small pure helper in `app/utils/`).

## Problem

Three focused UX fixes on the design editor (`/design/[id]`), which has a shared top toolbar (color swatches + Design|Mockups tabs) above a workspace that switches between the Konva design canvas (`activeWorkspaceTab === 'design'`) and `DesignMockupGallery` (`'mockups'`).

1. **Mockups loading overlay (first switch only).** Switching Design → Mockups currently swaps the component instantly. The first time per session, show a loading overlay (~3 s) over the Mockups area before revealing it. Subsequent switches stay instant.
2. **Color also works in the Design tab.** The shared color picker (`previewColors` → `selectColor`) only visibly affects the Mockups tab today. In the Design tab, changing color must recolor **only the product image inside the canvas** — not the `<canvas>` element background, not the container `<div>`, not the rest of the stage.
3. **Gating by available colors.** Color only applies when the product actually has colors; with no colors, nothing changes (and no swatches show — already the case).

### Why a backdrop rect (not a CSS canvas background)

The garment templates are PNGs whose garment silhouette is transparent (surround is opaque white). Setting a background on the `<canvas>` element bled the color across the entire stage and container (see `references/img_8.png` — red filled everything, not just the garment). The fix is a Konva `<v-rect>` sized to the image bounds, drawn behind the base image: the color shows only through the transparent garment pixels, contained to the image rectangle.

## Current structure (relevant anchors in `app/pages/design/[id].vue`)

- `activeWorkspaceTab = shallowRef<'design' | 'mockups'>('design')` (~line 233).
- Toolbar tab buttons (~2512–2527) set `activeWorkspaceTab` directly on click.
- Color swatches (~2497–2509) loop `previewColors` (= `availableColors`, ~402) and call `selectColor(colorId)` (~1544) which sets `selectedColorId`.
- `selectedColor` computed (~567) → `{ hex, label, ... } | null`.
- `availableColors = computed(() => editor.value?.colors ?? [])` (~133).
- Konva stage layer (~2600–2653): base image `<v-image v-if="canvasImage" :config="mockupImageConfig" />` (~2608), then design objects, print area, transformer.
- `mockupImageConfig` (~1083) spreads `imageLayout.value` (x/y/width/height) + `image: canvasImage`.
- `DesignMockupGallery` rendered with `v-if="activeWorkspaceTab === 'mockups'"` inside the workspace `<section>` (~2676).
- `renderDesignOnlyCanvas` / `updateDesignOverlays` (~305/366) render ONLY design objects for mockup overlays — they do not touch the base image, so the backdrop rect won't leak into mockup overlays.

## Design

### Item A — Mockups loading overlay (first switch only)

State in `[id].vue`:
- `const hasShownMockupsLoading = ref(false)`
- `const mockupsLoadingVisible = ref(false)`
- `let mockupsLoadingTimer: ReturnType<typeof setTimeout> | null = null`

Behavior: a `watch(activeWorkspaceTab, (tab) => { ... })` (client-only) — when `tab === 'mockups' && !hasShownMockupsLoading.value`, set `hasShownMockupsLoading.value = true`, `mockupsLoadingVisible.value = true`, and `mockupsLoadingTimer = setTimeout(() => { mockupsLoadingVisible.value = false }, 3000)`. Clear the timer in `onBeforeUnmount` (and guard re-entry). The duration is a named constant `MOCKUPS_LOADING_MS = 3000`.

Markup: inside the workspace `<section>` (the one holding the canvas + gallery), add an absolutely-positioned overlay shown with `v-if="mockupsLoadingVisible"` (`absolute inset-0 z-10`, white/80 backdrop, `flex items-center justify-center`), containing the existing spinner pattern + `{{ t('catalog.designEditor.mockups.preparing') }}`. The gallery mounts behind it; the overlay covers it for the duration.

i18n: add `catalog.designEditor.mockups.preparing` to BOTH `i18n/locales/en.json` and `i18n/locales/es.json` (e.g. EN "Preparing mockups…", ES "Generando mockups…").

"First time" = per component mount (a page reload resets it).

### Item B — Color backdrop behind the canvas image (Design tab)

New pure helper `app/utils/productColorBackdrop.ts`:
```ts
export interface ImageLayoutBox { x: number, y: number, width: number, height: number }
export interface ColorBackdropConfig extends ImageLayoutBox {
  fill: string
  listening: false
  name: 'product-color-backdrop'
}
/** Returns a Konva rect config to paint behind the base image, or null when no color applies. */
export function buildColorBackdropConfig(
  layout: ImageLayoutBox | null | undefined,
  colorHex: string | null | undefined,
  hasColors: boolean,
): ColorBackdropConfig | null {
  if (!layout || !hasColors || !colorHex) return null
  return { x: layout.x, y: layout.y, width: layout.width, height: layout.height, fill: colorHex, listening: false, name: 'product-color-backdrop' }
}
```

In `[id].vue`:
- `const productColorBackdropConfig = computed(() => buildColorBackdropConfig(imageLayout.value, selectedColor.value?.hex ?? null, availableColors.value.length > 0))`.
- In the stage layer, immediately BEFORE the base `<v-image :config="mockupImageConfig">`, add:
  `<v-rect v-if="productColorBackdropConfig" :config="productColorBackdropConfig" />`
  Konva paints in document order, so the rect sits behind the image. The image's opaque pixels hide the rect; transparent garment pixels reveal the color. Only the image rectangle is affected.

### Item C — Gating

Already satisfied: `previewColors = availableColors` (no colors ⇒ no swatches), and `buildColorBackdropConfig` returns `null` when `hasColors` is false or no color/hex. No extra code.

## Testing

- Vitest unit test `app/utils/productColorBackdrop.test.ts` (mirrors the existing `mockupRender` test style): returns `null` when layout missing / `hasColors` false / hex empty; returns the correct config (coords copied, fill set, `listening:false`, `name`) when all present.
- Overlay timing and the Konva render are verified manually in the running editor (no JS/Konva render test infra for the page component).

## Out of scope (YAGNI)

- Recoloring via per-garment alpha masks in the Design tab (the Mockups tab keeps its lifestyle tint; Design uses the simple backdrop).
- Changing the Mockups-tab color behavior (already correct).
- Tying the overlay duration to actual overlay-generation completion (fixed 3 s by request).
