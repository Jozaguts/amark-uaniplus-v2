# Mockup Lifestyle — Subproyecto A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the customer's design onto a real lifestyle model photo in the editor's read-only Mockups tab, tinting the garment to the chosen color via a CSS alpha mask, with a matching canvas export.

**Architecture:** Pure resolution/styling helpers (framework-free, unit-tested) live in `app/utils/mockupRender.ts`. `MockupGallery.vue` consumes them to render three stacked layers (photo → masked multiply tint → design overlay) for the big preview and the thumbnail strip, and replicates the tint on `<canvas>` for download. A dev-only fixture injects one sample lifestyle mockup so the feature is testable before the backend (Subproject B) exists. Products without lifestyle mockups keep today's flat-template behavior unchanged.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup lang="ts">`, Tailwind, CSS `mask-image` + `mix-blend-mode`, Canvas 2D, Vitest (added here for pure logic).

**Spec:** `docs/superpowers/specs/2026-06-02-mockup-lifestyle-subproject-a-design.md`

---

## File Structure

- `types/editor-product.d.ts` — extend `EditorProductLifestyleMockup` (add `kind`, `maskUrl`, `printZone.rotation`). *(Task 1)*
- `vitest.config.ts` — new, minimal Vitest config. *(Task 2)*
- `package.json` — add `vitest` devDep + `test` scripts. *(Task 2)*
- `app/utils/mockupRender.ts` — new; pure helpers: `isLifestyle`, `selectMockupForView`, `resolvePrintZone`, `tintLayerStyle`, `designOverlayStyle`. *(Tasks 3-5)*
- `app/utils/mockupRender.test.ts` — new; unit tests for the helpers. *(Tasks 2-5)*
- `app/utils/devMockupFixture.ts` — new; dev-only sample lifestyle mockup injector. *(Task 8)*
- `app/components/design/MockupGallery.vue` — consume helpers, add `selectedColorHex` prop, add tint layer to preview + thumbnails, extend canvas download. *(Tasks 6-7)*
- `app/pages/design/[id].vue` — pass `selected-color-hex`, wire dev fixture into `allEditorMockups`. *(Tasks 6 & 8)*
- `public/mockups/sample/model-front.jpg` + `model-front-mask.png` — sample assets for the dev fixture. *(Task 8)*

---

## Task 1: Extend the data contract

**Files:**
- Modify: `types/editor-product.d.ts:27-36`

- [ ] **Step 1: Replace the `EditorProductLifestyleMockup` type**

Replace the existing block:

```ts
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

with:

```ts
export type EditorProductLifestyleMockup = {
  viewId: string
  kind?: 'lifestyle' | 'flat'        // 'lifestyle' = tintable model photo; default treated as 'flat'
  src: string                        // model photo (neutral/white garment, opaque background OK)
  width: number
  height: number
  // Tint: alpha = garment (1 inside, 0 outside). Presence enables CSS tint.
  maskUrl?: string | null
  // Print zone as RATIOS (0–1) plus rotation in degrees.
  printZone?: { x: number; y: number; w: number; h: number; rotation: number } | null
  blendMode?: 'multiply' | 'screen' | 'overlay' | null  // default 'multiply'
  // Optional / ignored for 'lifestyle' (photo is neutral; color comes from the Design tab)
  previewColorId?: string
  previewColorHex?: string
}
```

- [ ] **Step 2: Verify the project still type-checks**

Run: `pnpm exec nuxt typecheck` (if it fails because typecheck isn't wired, run `pnpm exec vue-tsc --noEmit -p tsconfig.json`)
Expected: No new errors from `types/editor-product.d.ts`. (Note: `MockupGallery.vue` currently reads `mockup.printZone` without rotation — it still compiles because the field is additive; it gets rewired in Task 6.)

- [ ] **Step 3: Commit**

```bash
git add types/editor-product.d.ts
git commit -m "feat(editor): extend lifestyle mockup contract with kind, maskUrl, printZone rotation"
```

---

## Task 2: Add Vitest and a smoke test

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts + devDependencies)
- Create: `app/utils/mockupRender.test.ts`

- [ ] **Step 1: Install Vitest**

Run: `pnpm add -D vitest`
Expected: `vitest` appears under `devDependencies` in `package.json`.

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['app/**/*.test.ts'],
  },
})
```

- [ ] **Step 3: Add test scripts to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write a failing smoke test**

Create `app/utils/mockupRender.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isLifestyle } from './mockupRender'

describe('isLifestyle', () => {
  it('is true only for kind lifestyle with a maskUrl', () => {
    expect(isLifestyle({ viewId: 'front', kind: 'lifestyle', src: '/p.jpg', width: 1, height: 1, maskUrl: '/m.png' })).toBe(true)
    expect(isLifestyle({ viewId: 'front', kind: 'lifestyle', src: '/p.jpg', width: 1, height: 1 })).toBe(false)
    expect(isLifestyle({ viewId: 'front', src: '/p.jpg', width: 1, height: 1, maskUrl: '/m.png' })).toBe(false)
    expect(isLifestyle(null)).toBe(false)
  })
})
```

- [ ] **Step 5: Run it to verify it fails**

Run: `pnpm exec vitest run app/utils/mockupRender.test.ts`
Expected: FAIL — cannot resolve `./mockupRender` (file does not exist yet).

- [ ] **Step 6: Create the helper file with just `isLifestyle`**

Create `app/utils/mockupRender.ts`:

```ts
import type { EditorProductLifestyleMockup } from '~~/types/editor-product'

export function isLifestyle(mockup: EditorProductLifestyleMockup | null): boolean {
  return !!mockup && mockup.kind === 'lifestyle' && !!mockup.maskUrl
}
```

- [ ] **Step 7: Run it to verify it passes**

Run: `pnpm exec vitest run app/utils/mockupRender.test.ts`
Expected: PASS (1 test).

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts package.json pnpm-lock.yaml app/utils/mockupRender.ts app/utils/mockupRender.test.ts
git commit -m "test: add vitest and isLifestyle helper for mockup rendering"
```

---

## Task 3: `selectMockupForView`

**Files:**
- Modify: `app/utils/mockupRender.ts`
- Test: `app/utils/mockupRender.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `app/utils/mockupRender.test.ts`:

```ts
import { selectMockupForView } from './mockupRender'
import type { EditorProductLifestyleMockup, EditorProductView } from '~~/types/editor-product'

const view: EditorProductView = {
  id: 'front',
  label: 'Front',
  mockup: { previewColorId: 'white', previewColorHex: '#fff', src: '/flat.png', width: 1000, height: 1200 },
  printArea: { id: 'fa', label: 'Front', price: '$0', priceValue: 0, x: 250, y: 300, width: 500, height: 600, rotation: 0 },
}

const lifestyle: EditorProductLifestyleMockup = { viewId: 'front', kind: 'lifestyle', src: '/model.jpg', width: 560, height: 640, maskUrl: '/mask.png', printZone: { x: 0.3, y: 0.4, w: 0.3, h: 0.3, rotation: 0 } }
const flatWhite: EditorProductLifestyleMockup = { viewId: 'front', src: '/white.png', width: 1000, height: 1200, previewColorId: 'white' }
const flatBlack: EditorProductLifestyleMockup = { viewId: 'front', src: '/black.png', width: 1000, height: 1200, previewColorId: 'black' }

describe('selectMockupForView', () => {
  it('prefers a lifestyle mockup, ignoring color', () => {
    expect(selectMockupForView([flatWhite, lifestyle, flatBlack], view, 'black')).toBe(lifestyle)
  })
  it('falls back to the flat mockup matching the selected color', () => {
    expect(selectMockupForView([flatWhite, flatBlack], view, 'black')).toBe(flatBlack)
  })
  it('falls back to the first candidate when no color matches', () => {
    expect(selectMockupForView([flatWhite, flatBlack], view, 'red')).toBe(flatWhite)
  })
  it('ignores mockups for other views and returns null when none match', () => {
    expect(selectMockupForView([{ ...flatWhite, viewId: 'back' }], view, 'white')).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm exec vitest run app/utils/mockupRender.test.ts`
Expected: FAIL — `selectMockupForView` is not exported.

- [ ] **Step 3: Implement `selectMockupForView`**

Append to `app/utils/mockupRender.ts`:

```ts
import type { EditorProductView } from '~~/types/editor-product'

export function selectMockupForView(
  mockups: EditorProductLifestyleMockup[],
  view: EditorProductView,
  selectedColorId: string,
): EditorProductLifestyleMockup | null {
  const candidates = mockups.filter(mockup => mockup.viewId === view.id)
  const lifestyle = candidates.find(isLifestyle)
  if (lifestyle) return lifestyle
  return candidates.find(mockup => mockup.previewColorId === selectedColorId) ?? candidates[0] ?? null
}
```

(Merge the `import type { EditorProductView }` into the existing import line if you prefer; both forms compile.)

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm exec vitest run app/utils/mockupRender.test.ts`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add app/utils/mockupRender.ts app/utils/mockupRender.test.ts
git commit -m "feat(editor): add selectMockupForView with lifestyle preference"
```

---

## Task 4: `resolvePrintZone`

**Files:**
- Modify: `app/utils/mockupRender.ts`
- Test: `app/utils/mockupRender.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `app/utils/mockupRender.test.ts`:

```ts
import { resolvePrintZone } from './mockupRender'

describe('resolvePrintZone', () => {
  it('uses the lifestyle printZone (incl. rotation) and its blendMode', () => {
    const m = { ...lifestyle, printZone: { x: 0.3, y: 0.4, w: 0.3, h: 0.25, rotation: 8 }, blendMode: 'screen' as const }
    expect(resolvePrintZone(view, m)).toEqual({
      zone: { x: 0.3, y: 0.4, w: 0.3, h: 0.25, rotation: 8 },
      blendMode: 'screen',
    })
  })
  it('derives the zone from printArea ratios with rotation 0 when no mockup', () => {
    expect(resolvePrintZone(view, null)).toEqual({
      zone: { x: 0.25, y: 0.25, w: 0.5, h: 0.5, rotation: 0 },
      blendMode: 'multiply',
    })
  })
  it('returns null when base dimensions are missing', () => {
    const broken: EditorProductView = { ...view, mockup: { ...view.mockup, width: 0 } }
    expect(resolvePrintZone(broken, null)).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm exec vitest run app/utils/mockupRender.test.ts`
Expected: FAIL — `resolvePrintZone` is not exported.

- [ ] **Step 3: Implement `resolvePrintZone`**

Append to `app/utils/mockupRender.ts`:

```ts
export type ResolvedPrintZone = {
  zone: { x: number; y: number; w: number; h: number; rotation: number }
  blendMode: NonNullable<EditorProductLifestyleMockup['blendMode']>
}

export function resolvePrintZone(
  view: EditorProductView,
  mockup: EditorProductLifestyleMockup | null,
): ResolvedPrintZone | null {
  if (mockup?.printZone) {
    return { zone: mockup.printZone, blendMode: mockup.blendMode ?? 'multiply' }
  }

  const area = view.printArea
  const base = view.mockup

  if (!area || !base?.width || !base?.height) return null

  return {
    zone: {
      x: area.x / base.width,
      y: area.y / base.height,
      w: area.width / base.width,
      h: area.height / base.height,
      rotation: 0,
    },
    blendMode: mockup?.blendMode ?? 'multiply',
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm exec vitest run app/utils/mockupRender.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/utils/mockupRender.ts app/utils/mockupRender.test.ts
git commit -m "feat(editor): add resolvePrintZone with rotation and flat fallback"
```

---

## Task 5: `tintLayerStyle` and `designOverlayStyle`

**Files:**
- Modify: `app/utils/mockupRender.ts`
- Test: `app/utils/mockupRender.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `app/utils/mockupRender.test.ts`:

```ts
import { designOverlayStyle, tintLayerStyle } from './mockupRender'

describe('tintLayerStyle', () => {
  it('builds a masked multiply color layer', () => {
    const s = tintLayerStyle('/mask.png', '#1e2a55')
    expect(s.backgroundColor).toBe('#1e2a55')
    expect(s.mixBlendMode).toBe('multiply')
    expect(s.maskImage).toBe('url("/mask.png")')
    expect(s.WebkitMaskImage).toBe('url("/mask.png")')
    expect(s.maskSize).toBe('100% 100%')
  })
})

describe('designOverlayStyle', () => {
  it('positions the overlay in the zone as percentages with blend mode', () => {
    const s = designOverlayStyle({ x: 0.3, y: 0.4, w: 0.3, h: 0.25, rotation: 0 }, 'multiply')
    expect(s.left).toBe('30%')
    expect(s.top).toBe('40%')
    expect(s.width).toBe('30%')
    expect(s.height).toBe('25%')
    expect(s.mixBlendMode).toBe('multiply')
    expect(s.transform).toBeUndefined()
  })
  it('applies a rotate transform when rotation is non-zero', () => {
    const s = designOverlayStyle({ x: 0, y: 0, w: 1, h: 1, rotation: 8 }, 'multiply')
    expect(s.transform).toBe('rotate(8deg)')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm exec vitest run app/utils/mockupRender.test.ts`
Expected: FAIL — `tintLayerStyle` / `designOverlayStyle` not exported.

- [ ] **Step 3: Implement both helpers**

Add the Vue type import at the top of `app/utils/mockupRender.ts`:

```ts
import type { CSSProperties } from 'vue'
```

Append:

```ts
export function tintLayerStyle(maskUrl: string, colorHex: string): CSSProperties {
  const mask = `url("${maskUrl}")`
  return {
    position: 'absolute',
    inset: 0,
    backgroundColor: colorHex,
    mixBlendMode: 'multiply',
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  }
}

export function designOverlayStyle(
  zone: ResolvedPrintZone['zone'],
  blendMode: NonNullable<EditorProductLifestyleMockup['blendMode']>,
): CSSProperties {
  return {
    left: `${zone.x * 100}%`,
    top: `${zone.y * 100}%`,
    width: `${zone.w * 100}%`,
    height: `${zone.h * 100}%`,
    transform: zone.rotation ? `rotate(${zone.rotation}deg)` : undefined,
    mixBlendMode: blendMode,
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm exec vitest run app/utils/mockupRender.test.ts`
Expected: PASS (all helper tests green).

- [ ] **Step 5: Commit**

```bash
git add app/utils/mockupRender.ts app/utils/mockupRender.test.ts
git commit -m "feat(editor): add tintLayerStyle and designOverlayStyle helpers"
```

---

## Task 6: Render tint + design in MockupGallery (preview + thumbnails)

**Files:**
- Modify: `app/components/design/MockupGallery.vue`
- Modify: `app/pages/design/[id].vue:2676-2684`

- [ ] **Step 1: Add the `selectedColorHex` prop and import the helpers**

In `app/components/design/MockupGallery.vue`, replace the `<script setup>` props block and the inline `ResolvedPrintZone` type + `resolvePrintZone` + `overlayStyleForView` definitions.

Update the imports and props at the top of `<script setup lang="ts">`:

```ts
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
```

- [ ] **Step 2: Replace `mockupsByView` to use `selectMockupForView`**

Replace the existing `mockupsByView` computed:

```ts
const mockupsByView = computed(() => {
  return props.views.reduce<Record<string, EditorProductLifestyleMockup | null>>((mockups, view) => {
    mockups[view.id] = selectMockupForView(props.mockups, view, props.selectedColorId)
    return mockups
  }, {})
})
```

- [ ] **Step 3: Remove the local `ResolvedPrintZone` type, `resolvePrintZone`, and `overlayStyleForView`; add view-scoped helpers**

Delete the in-file `type ResolvedPrintZone = ...`, the `const resolvePrintZone = ...`, and the `const overlayStyleForView = ...` blocks. Replace with helpers that call the utils:

```ts
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
```

- [ ] **Step 4: Update `activeOverlayStyle` and keep `resolvePrintZone` usage in download working**

Replace the existing `activeOverlayStyle` computed:

```ts
const activeOverlayStyle = computed(() => activeView.value ? overlayStyleForView(activeView.value.id) : null)
const activeTintStyle = computed(() => activeView.value ? tintStyleForView(activeView.value.id) : null)
```

In `downloadMockup`, replace the line `const resolved = resolvePrintZone(view)` with:

```ts
const resolved = resolveZoneForView(view.id)
```

(There are two such references in `downloadMockup`; update both.) The canvas tint itself is added in Task 7 — leave the rest of `downloadMockup` as-is for now.

- [ ] **Step 5: Add the tint layer to the big preview**

In the template, inside the big-preview `<div class="relative">`, insert the tint `<div>` **between** the mockup `<img>` and the design overlay `<img>`:

```vue
<div
  v-if="activeTintStyle"
  class="pointer-events-none absolute inset-0"
  :style="activeTintStyle"
/>
```

- [ ] **Step 6: Add the tint layer to each thumbnail**

In the thumbnail `<button>` loop, insert the tint `<div>` between the mockup `<img>` and the overlay `<img>`:

```vue
<div
  v-if="tintStyleForView(view.id)"
  class="pointer-events-none absolute inset-0"
  :style="tintStyleForView(view.id)!"
/>
```

- [ ] **Step 7: Pass `selected-color-hex` from the design page**

In `app/pages/design/[id].vue`, update the `<DesignMockupGallery>` usage (around line 2676) to add the prop:

```vue
<DesignMockupGallery
  v-if="activeWorkspaceTab === 'mockups'"
  class="min-h-0 flex-1"
  :mockups="allEditorMockups"
  :views="availableViews"
  :design-overlay-urls="designOverlayUrls"
  :selected-color-id="selectedColorId"
  :selected-color-hex="selectedColor?.hex ?? ''"
  :active-view-id="activeViewId"
/>
```

(`selectedColor` is the existing computed at `app/pages/design/[id].vue:567`.)

- [ ] **Step 8: Type-check**

Run: `pnpm exec vue-tsc --noEmit -p tsconfig.json`
Expected: No errors in `MockupGallery.vue` or `design/[id].vue`. (Defer full visual verification to Task 8, once the dev fixture provides a lifestyle mockup.)

- [ ] **Step 9: Commit**

```bash
git add app/components/design/MockupGallery.vue app/pages/design/[id].vue
git commit -m "feat(editor): render masked garment tint in mockup preview and thumbnails"
```

---

## Task 7: Replicate the tint on the canvas download

**Files:**
- Modify: `app/components/design/MockupGallery.vue` (`downloadMockup`)

- [ ] **Step 1: Insert the masked-tint compositing into `downloadMockup`**

In `downloadMockup`, immediately **after** `context.drawImage(backgroundImage, 0, 0, width, height)` and **before** the design-overlay block, add:

```ts
if (isLifestyle(mockup) && mockup?.maskUrl && props.selectedColorHex) {
  const maskImage = await loadImageForCanvas(mockup.maskUrl)

  // Build the color-only-where-garment layer on a scratch canvas.
  const tintCanvas = document.createElement('canvas')
  tintCanvas.width = width
  tintCanvas.height = height
  const tintContext = tintCanvas.getContext('2d')

  if (tintContext) {
    tintContext.fillStyle = props.selectedColorHex
    tintContext.fillRect(0, 0, width, height)
    tintContext.globalCompositeOperation = 'destination-in'
    tintContext.drawImage(maskImage, 0, 0, width, height)

    // Multiply the masked color onto the photo — same look as the CSS layer.
    context.globalCompositeOperation = 'multiply'
    context.drawImage(tintCanvas, 0, 0, width, height)
    context.globalCompositeOperation = 'source-over'
  }
}
```

- [ ] **Step 2: Replace the design-overlay draw with a rotation-aware version**

In `downloadMockup`, replace the existing overlay draw block:

```ts
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
```

with:

```ts
if (overlayUrl && resolved) {
  const overlayImage = await loadImageForCanvas(overlayUrl)
  const { zone, blendMode } = resolved
  const zoneX = zone.x * width
  const zoneY = zone.y * height
  const zoneW = zone.w * width
  const zoneH = zone.h * height

  context.globalCompositeOperation = blendMode

  if (zone.rotation) {
    context.save()
    context.translate(zoneX + zoneW / 2, zoneY + zoneH / 2)
    context.rotate((zone.rotation * Math.PI) / 180)
    context.drawImage(overlayImage, -zoneW / 2, -zoneH / 2, zoneW, zoneH)
    context.restore()
  }
  else {
    context.drawImage(overlayImage, zoneX, zoneY, zoneW, zoneH)
  }

  context.globalCompositeOperation = 'source-over'
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec vue-tsc --noEmit -p tsconfig.json`
Expected: No new errors. (Functional download verified end-to-end in Task 8.)

- [ ] **Step 4: Commit**

```bash
git add app/components/design/MockupGallery.vue
git commit -m "feat(editor): apply masked garment tint and rotation to mockup download"
```

---

## Task 8: Dev fixture + end-to-end verification

**Files:**
- Create: `public/mockups/sample/model-front.jpg` (copy of `references/_demo_photo.jpg`)
- Create: `public/mockups/sample/model-front-mask.png` (copy of `references/_demo_mask_alpha2.png`)
- Create: `app/utils/devMockupFixture.ts`
- Modify: `app/pages/design/[id].vue:296`

- [ ] **Step 1: Copy the sample assets into `public/`**

Run:

```bash
mkdir -p public/mockups/sample
cp references/_demo_photo.jpg public/mockups/sample/model-front.jpg
cp references/_demo_mask_alpha2.png public/mockups/sample/model-front-mask.png
```

Expected: both files exist under `public/mockups/sample/`. (These are the 560×640 demo photo and its alpha garment mask generated during brainstorming.)

- [ ] **Step 2: Create the dev fixture injector**

Create `app/utils/devMockupFixture.ts`:

```ts
import type { EditorProductLifestyleMockup, EditorProductView } from '~~/types/editor-product'

// Dev-only: inject one sample lifestyle mockup so the tint/compositing path is
// exercisable before the backend (Subproject B) produces real mockups. No-op in
// production and when the product already ships lifestyle mockups.
export function withDevLifestyleMockups(
  mockups: EditorProductLifestyleMockup[],
  views: EditorProductView[],
): EditorProductLifestyleMockup[] {
  if (!import.meta.dev) return mockups

  const front = views[0]
  if (!front) return mockups
  if (mockups.some(mockup => mockup.kind === 'lifestyle')) return mockups

  return [
    ...mockups,
    {
      viewId: front.id,
      kind: 'lifestyle',
      src: '/mockups/sample/model-front.jpg',
      width: 560,
      height: 640,
      maskUrl: '/mockups/sample/model-front-mask.png',
      printZone: { x: 0.335, y: 0.45, w: 0.33, h: 0.27, rotation: 0 },
      blendMode: 'multiply',
    },
  ]
}
```

- [ ] **Step 3: Wire the fixture into `allEditorMockups`**

In `app/pages/design/[id].vue`, replace line 296:

```ts
const allEditorMockups = computed(() => editor.value?.mockups ?? [])
```

with:

```ts
const allEditorMockups = computed(() => withDevLifestyleMockups(editor.value?.mockups ?? [], availableViews.value))
```

(`availableViews` is the existing computed at `app/pages/design/[id].vue:134`. `withDevLifestyleMockups` is auto-imported from `app/utils/`.)

- [ ] **Step 4: Run the full unit suite**

Run: `pnpm test`
Expected: PASS — all `app/utils/mockupRender.test.ts` tests green.

- [ ] **Step 5: Verify in the browser**

Run: `pnpm dev` (ensure `uandiplus.test` maps to `127.0.0.1` per CLAUDE.md "Dev Server Notes").
Then, in the browser:
1. Open a design editor page (`/design/<id>`), add a design image/text on the front view, and pick a non-white product color in the **Design** tab.
2. Switch to the **Mockups** tab.

Expected:
- The front view shows the sample model photo with the **t-shirt tinted** to the selected color (background, skin, hat, jeans unchanged) and the design composited on the chest.
- The left thumbnail for the front view shows the same tinted result.
- Other views (no lifestyle mockup) still render the flat template exactly as before.
- Clicking **Download** produces a PNG matching the preview (photo + tinted shirt + design). Open the file to confirm.

- [ ] **Step 6: Commit**

```bash
git add public/mockups/sample/model-front.jpg public/mockups/sample/model-front-mask.png app/utils/devMockupFixture.ts app/pages/design/[id].vue
git commit -m "feat(editor): add dev lifestyle mockup fixture and sample assets"
```

---

## Self-Review notes

- **Spec coverage:** contract (Task 1), selection + coexistence (Task 3 + Task 6 step 2), live CSS preview with tint + rotated design (Tasks 4-6), thumbnail strip = perspectives reusing `views` (Task 6 step 6), read-only `selectedColorHex` prop (Task 6 steps 1/7), canvas download tint (Task 7), dev fixture + assets (Task 8), i18n (no new strings — confirmed in spec). All covered.
- **Out of scope (Subproject B):** calibrator, mask pipeline, model library, multi-model selection — none appear as tasks. Correct.
- **Type consistency:** `EditorProductLifestyleMockup` (incl. `kind`, `maskUrl`, `printZone.rotation`), `ResolvedPrintZone`, and helper signatures (`isLifestyle`, `selectMockupForView`, `resolvePrintZone`, `tintLayerStyle`, `designOverlayStyle`, `withDevLifestyleMockups`) are referenced identically across tasks.
