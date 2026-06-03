# Design Editor — Color Backdrop + Mockups Loading Overlay — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In the design editor (`/design/[id]`), recolor only the product image inside the Konva canvas when a color is picked on the Design tab, and show a one-time ~3 s loading overlay the first time the user switches to the Mockups tab.

**Architecture:** A tiny pure helper builds a Konva rect config painted behind the base `<v-image>` (so the chosen color shows through the transparent garment pixels, contained to the image rectangle). A `watch` on the workspace tab toggles a once-per-mount overlay with a fixed timeout.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup lang="ts">`, vue-konva, Vitest, `@nuxtjs/i18n` (en + es). Test command: `pnpm test` (= `vitest run`); filter a file with `pnpm test <name>`.

**Repo:** `revolve`. Branch `feat/design-editor-color-and-loading` (already created; spec committed at `170c1e8`).

**Spec:** `docs/superpowers/specs/2026-06-03-design-editor-color-and-mockup-loading-design.md`

---

## File Structure

**Create:**
- `app/utils/productColorBackdrop.ts` — pure helper `buildColorBackdropConfig(layout, colorHex, hasColors)` returning a Konva rect config or `null`.
- `app/utils/productColorBackdrop.test.ts` — Vitest unit tests (mirrors `app/utils/mockupRender.test.ts`).

**Modify:**
- `app/pages/design/[id].vue` — add `productColorBackdropConfig` computed + `<v-rect>` behind the base image (Task 1); add overlay state/watch/timer + overlay markup (Task 2).
- `i18n/locales/en.json` and `i18n/locales/es.json` — add `catalog.designEditor.mockups.preparing` (Task 2).

Both visual behaviors are independent and each leaves the app working on its own.

---

## Task 1: Color backdrop behind the canvas image (Design tab)

**Files:**
- Create: `app/utils/productColorBackdrop.ts`
- Test: `app/utils/productColorBackdrop.test.ts`
- Modify: `app/pages/design/[id].vue` (computed near `mockupImageConfig` ~line 1088; `<v-rect>` before the base `<v-image>` ~line 2608)

- [ ] **Step 1: Write the failing test**

Create `app/utils/productColorBackdrop.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildColorBackdropConfig } from './productColorBackdrop'

const layout = { x: 10, y: 20, width: 240, height: 300 }

describe('buildColorBackdropConfig', () => {
  it('returns a konva rect config when a color applies', () => {
    expect(buildColorBackdropConfig(layout, '#ff0000', true)).toEqual({
      x: 10,
      y: 20,
      width: 240,
      height: 300,
      fill: '#ff0000',
      listening: false,
      name: 'product-color-backdrop',
    })
  })

  it('returns null when the product has no colors', () => {
    expect(buildColorBackdropConfig(layout, '#ff0000', false)).toBeNull()
  })

  it('returns null when no color hex is provided', () => {
    expect(buildColorBackdropConfig(layout, '', true)).toBeNull()
    expect(buildColorBackdropConfig(layout, null, true)).toBeNull()
  })

  it('returns null when layout is missing', () => {
    expect(buildColorBackdropConfig(null, '#ff0000', true)).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test productColorBackdrop`
Expected: FAIL — cannot resolve `./productColorBackdrop` (module not found).

- [ ] **Step 3: Write the helper**

Create `app/utils/productColorBackdrop.ts`:

```ts
export interface ImageLayoutBox {
  x: number
  y: number
  width: number
  height: number
}

export interface ColorBackdropConfig extends ImageLayoutBox {
  fill: string
  listening: false
  name: 'product-color-backdrop'
}

/**
 * Konva rect config painted behind the base product image so the selected
 * color shows through the transparent garment pixels, contained to the image
 * rectangle. Returns null when no color should be applied.
 */
export function buildColorBackdropConfig(
  layout: ImageLayoutBox | null | undefined,
  colorHex: string | null | undefined,
  hasColors: boolean,
): ColorBackdropConfig | null {
  if (!layout || !hasColors || !colorHex) {
    return null
  }

  return {
    x: layout.x,
    y: layout.y,
    width: layout.width,
    height: layout.height,
    fill: colorHex,
    listening: false,
    name: 'product-color-backdrop',
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test productColorBackdrop`
Expected: PASS (4 tests).

- [ ] **Step 5: Wire the computed into the page**

In `app/pages/design/[id].vue`, the helper is auto-imported (Nuxt auto-imports `app/utils`). Add a computed immediately AFTER the `mockupImageConfig` computed block (which ends at ~line 1088 with `}))`):

```ts
const productColorBackdropConfig = computed(() =>
  buildColorBackdropConfig(
    imageLayout.value,
    selectedColor.value?.hex ?? null,
    availableColors.value.length > 0,
  ),
)
```

(`imageLayout` is the computed at ~line 1053; `selectedColor` at ~line 567; `availableColors` at ~line 133 — all already defined.)

- [ ] **Step 6: Add the rect behind the base image**

In the same file, find the base image node inside `<v-layer>` (~line 2608):

```vue
                  <v-image
                    v-if="canvasImage"
                    :config="mockupImageConfig"
                  />
```

Insert the backdrop rect IMMEDIATELY BEFORE it (Konva paints in document order, so an earlier node renders behind):

```vue
                  <v-rect
                    v-if="productColorBackdropConfig"
                    :config="productColorBackdropConfig"
                  />
                  <v-image
                    v-if="canvasImage"
                    :config="mockupImageConfig"
                  />
```

- [ ] **Step 7: Manually verify in the browser**

Run the dev server, open a product with colors in the editor, stay on the Design tab, click a color swatch. Expected: the garment recolors (color shows through the transparent garment area of the PNG); the white card, the `<canvas>` background, and the container are unchanged. Open a product with NO colors: no swatches, no backdrop. (No automated Konva/render test for the page; the pure helper is covered in Steps 1–4.)

- [ ] **Step 8: Commit**

```bash
git add app/utils/productColorBackdrop.ts app/utils/productColorBackdrop.test.ts app/pages/design/[id].vue
git commit -m "feat(design-editor): recolor only the canvas product image on the Design tab"
```

---

## Task 2: One-time Mockups loading overlay

**Files:**
- Modify: `app/pages/design/[id].vue` (state + watch near `activeWorkspaceTab` ~line 233; timer cleanup in the existing `onBeforeUnmount` ~line 2265; overlay markup inside the workspace `<section>` ~line 2676)
- Modify: `i18n/locales/en.json` (~line 590) and `i18n/locales/es.json` (~line 590)

- [ ] **Step 1: Add the i18n key (en)**

In `i18n/locales/en.json`, the `catalog.designEditor.mockups` object ends with `"downloadError"` (~line 590). Add a `preparing` key — change:

```json
        "downloadError": "Download requires CORS headers on the media server."
      }
```
to:
```json
        "downloadError": "Download requires CORS headers on the media server.",
        "preparing": "Preparing mockups…"
      }
```

- [ ] **Step 2: Add the i18n key (es)**

In `i18n/locales/es.json`, the same `catalog.designEditor.mockups` object — change:

```json
        "downloadError": "La descarga requiere encabezados CORS en el servidor de medios."
      }
```
to:
```json
        "downloadError": "La descarga requiere encabezados CORS en el servidor de medios.",
        "preparing": "Generando mockups…"
      }
```

- [ ] **Step 3: Add overlay state + watch**

In `app/pages/design/[id].vue`, immediately AFTER the `activeWorkspaceTab` declaration (~line 233: `const activeWorkspaceTab = shallowRef<'design' | 'mockups'>('design')`), add:

```ts
const MOCKUPS_LOADING_MS = 3000
const hasShownMockupsLoading = ref(false)
const mockupsLoadingVisible = ref(false)
let mockupsLoadingTimer: ReturnType<typeof setTimeout> | null = null

if (import.meta.client) {
  watch(activeWorkspaceTab, (tab) => {
    if (tab !== 'mockups' || hasShownMockupsLoading.value) {
      return
    }

    hasShownMockupsLoading.value = true
    mockupsLoadingVisible.value = true
    mockupsLoadingTimer = setTimeout(() => {
      mockupsLoadingVisible.value = false
      mockupsLoadingTimer = null
    }, MOCKUPS_LOADING_MS)
  })
}
```

(`ref`, `shallowRef`, `watch`, `computed` are Nuxt auto-imported, as used throughout this file.)

- [ ] **Step 4: Clear the timer on unmount**

In the existing `onBeforeUnmount` block (~line 2265), add a guard at the top of the callback (before `clearPostSaveFeedbackTimers()`):

```ts
onBeforeUnmount(() => {
  if (mockupsLoadingTimer) {
    clearTimeout(mockupsLoadingTimer)
    mockupsLoadingTimer = null
  }
  clearPostSaveFeedbackTimers()
```

(Leave the rest of the existing `onBeforeUnmount` body unchanged.)

- [ ] **Step 5: Add the overlay markup**

In the workspace `<section>` (the element at ~line 2495 that contains the toolbar, the Design canvas, and `<DesignMockupGallery>`), add the overlay as the LAST child of that `<section>`, immediately AFTER the closing `</DesignMockupGallery ... />` tag block (~line 2685, the self-closing `/>`), and BEFORE the section's closing `</section>` (~line 2686):

```vue
          <div
            v-if="mockupsLoadingVisible"
            class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm"
          >
            <Icon name="icon:spinner-gap" size="32px" class="animate-spin text-primary" />
            <span class="text-sm font-medium text-primary">
              {{ t('catalog.designEditor.mockups.preparing') }}
            </span>
          </div>
```

For the absolute overlay to be positioned against the section, ensure that `<section>` has `relative`. Find its opening tag (~line 2495):

```vue
        <section class="order-1 flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-lg bg-white lg:order-2">
```
and add `relative` to the class list:
```vue
        <section class="relative order-1 flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-lg bg-white lg:order-2">
```

(`Icon` with `icon:spinner-gap` + `animate-spin` is the spinner pattern already used in `app/components/design/panels/SavedPanel.vue:124`. `t` is the i18n function already used throughout this template.)

- [ ] **Step 6: Manually verify in the browser**

Run the dev server, open the editor (Design tab active). Switch to Mockups: expected a centered spinner + "Preparing mockups…/Generando mockups…" overlay covering the Mockups area for ~3 s, then it disappears and the gallery shows. Switch back to Design and again to Mockups: no overlay (instant). Reload the page: the overlay shows again on the first switch. Toggle locale to confirm the ES string.

- [ ] **Step 7: Commit**

```bash
git add app/pages/design/[id].vue i18n/locales/en.json i18n/locales/es.json
git commit -m "feat(design-editor): one-time loading overlay on first Mockups switch"
```

---

## Final verification

- [ ] **Run the unit suite:** `pnpm test` — expected: all green (existing `mockupRender` tests + the 4 new `productColorBackdrop` tests).
- [ ] **Manual smoke:** color recolors only the garment image on the Design tab (not the canvas/container); first Design→Mockups switch shows the ~3 s overlay, later switches are instant; a product with no colors shows no swatches and no backdrop.

---

## Self-Review (completed during planning)

- **Spec coverage:** Item A (overlay) → Task 2 (state/watch/timer/markup/i18n). Item B (color backdrop) → Task 1 (helper + computed + `<v-rect>`). Item C (gating) → built into `buildColorBackdropConfig`'s `hasColors`/`colorHex` guards and the existing `previewColors` swatch loop; no extra code, verified in Task 1 Step 7. Testing → Task 1 Steps 1–4 (helper unit tests) + manual steps. Out-of-scope items (masks, mockup-tab behavior, dynamic duration) are not implemented.
- **Placeholder scan:** none — every step has concrete code/commands.
- **Type consistency:** `buildColorBackdropConfig(layout, colorHex, hasColors)` signature matches between the helper, the test, and the `productColorBackdropConfig` computed. `ImageLayoutBox` matches the shape returned by `imageLayout` (x/y/width/height). i18n key `catalog.designEditor.mockups.preparing` is identical in the en/es edits and the template `t(...)` call. Overlay refs (`mockupsLoadingVisible`, `hasShownMockupsLoading`, `mockupsLoadingTimer`, `MOCKUPS_LOADING_MS`) are named consistently across state, watch, cleanup, and markup.
