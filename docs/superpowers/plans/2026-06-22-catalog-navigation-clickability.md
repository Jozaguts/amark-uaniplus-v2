# Catalog Navigation Clickability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make `is_clickable === true` the only condition that allows catalog navigation nodes to render as links on desktop and mobile.

**Architecture:** A pure utility will derive `canNavigate` and `hasChildren` from API nodes so the behavior can be unit tested without mounting Nuxt. `useCatalogNavigationTree` will preserve clickability in its column and link view models. `Header.vue` will coordinate root mega menus and mobile panels, while `MegaMenu.vue` will choose links or text from typed props.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, TypeScript, Vitest, Tailwind CSS

---

### Task 1: Add strict navigation-state rules

**Files:**
- Create: `app/utils/catalogNavigationState.ts`
- Create: `app/utils/catalogNavigationState.test.ts`
- Modify: `app/types/catalog-navigation.ts`
- Modify: `app/composables/useCatalogNavigationTree.ts`

- [x] **Step 1: Write failing tests for strict clickability and child detection**

Create `app/utils/catalogNavigationState.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { catalogNavigationState } from './catalogNavigationState'

describe('catalogNavigationState', () => {
  it('allows navigation only when is_clickable is exactly true', () => {
    expect(catalogNavigationState({ is_clickable: true, children: [] }).canNavigate).toBe(true)
    expect(catalogNavigationState({ is_clickable: false, children: [] }).canNavigate).toBe(false)
    expect(catalogNavigationState({ children: [] }).canNavigate).toBe(false)
  })

  it('detects dropdown content independently from clickability', () => {
    const child = { is_clickable: true, children: [] }

    expect(catalogNavigationState({ is_clickable: false, children: [child] })).toEqual({
      canNavigate: false,
      hasChildren: true,
    })
    expect(catalogNavigationState({ is_clickable: true, children: [] })).toEqual({
      canNavigate: true,
      hasChildren: false,
    })
  })
})
```

- [x] **Step 2: Run the focused test and verify RED**

Run: `pnpm test app/utils/catalogNavigationState.test.ts`

Expected: FAIL because `./catalogNavigationState` does not exist.

- [x] **Step 3: Implement the pure state utility**

Create `app/utils/catalogNavigationState.ts`:

```ts
export interface CatalogNavigationStateInput {
  is_clickable?: boolean
  children?: unknown[]
}

export function catalogNavigationState(node: CatalogNavigationStateInput) {
  return {
    canNavigate: node.is_clickable === true,
    hasChildren: (node.children?.length ?? 0) > 0,
  }
}
```

Add `is_clickable?: boolean` to `CatalogNavigationItem`. Add required `isClickable: boolean` to `CatalogNavigationColumn` and `CatalogNavigationMenuLink`.

Update `itemToMenuLink` and `itemToColumn` in `useCatalogNavigationTree.ts`:

```ts
function itemToMenuLink(item: CatalogNavigationItem): CatalogNavigationMenuLink {
  return {
    id: item.id,
    label: item.name,
    url: item.url,
    path: item.path,
    isClickable: item.is_clickable === true,
    children: item.children?.map(itemToMenuLink) ?? [],
  }
}

function itemToColumn(item: CatalogNavigationItem): CatalogNavigationColumn {
  return {
    id: item.id,
    title: item.name,
    url: item.url,
    isClickable: item.is_clickable === true,
    items: item.children?.map(itemToMenuLink) ?? [],
  }
}
```

Set `isClickable: false` in `groupToColumn`, because menu group headings are presentation-only.

- [x] **Step 4: Run the focused test and verify GREEN**

Run: `pnpm test app/utils/catalogNavigationState.test.ts`

Expected: 2 tests pass.

- [x] **Step 5: Commit the state contract**

```bash
git add app/utils/catalogNavigationState.ts app/utils/catalogNavigationState.test.ts app/types/catalog-navigation.ts app/composables/useCatalogNavigationTree.ts
git commit -m "Add strict catalog navigation state"
```

### Task 2: Apply clickability to the desktop header and mega menu

**Files:**
- Modify: `app/components/Header.vue`
- Modify: `app/components/header/MegaMenu.vue`

- [x] **Step 1: Make root nodes control the desktop mega menu**

In `Header.vue`, store the root item id in `activeMegaMenuKey`. Replace the column-only open logic with item-based helpers:

```ts
function itemHasDropdown(item: CatalogNavigationItem): boolean {
  return catalogNavigationState(item).hasChildren
}

function openMegaMenuForItem(item: CatalogNavigationItem): void {
  cancelMegaMenuClose()
  activeMegaMenuKey.value = itemHasDropdown(item) ? itemKey(item) : null
}

const activeMegaMenu = computed(() => {
  if (!activeMegaMenuKey.value) return null
  const item = navItems.value.find(item => itemKey(item) === activeMegaMenuKey.value)
  return item ? menuForItem(item) : null
})
```

Render each desktop root as:

- `NuxtLink` when `catalogNavigationState(item).canNavigate` is true.
- `button` when it is non-clickable and has children.
- `span` when it is non-clickable and has no children.

The button opens its mega menu on hover, focus, and click. Remove the level-two sub-navigation strip because Fashion and Accessories now render as columns inside the root mega menu.

- [x] **Step 2: Make mega-menu column titles and items respect `isClickable`**

In `MegaMenu.vue`, render a column title with `NuxtLink` only when both `column.isClickable` and `column.url` are present. Otherwise render `<h3>`.

Render each menu item with `NuxtLink` only when `item.isClickable` is true. Use `<span>` for a non-clickable leaf and `<button>` only when a future nested desktop interaction needs its children. Apply the same rule to nested children.

- [x] **Step 3: Run unit tests**

Run: `pnpm test`

Expected: all Vitest files pass.

- [x] **Step 4: Commit desktop behavior**

```bash
git add app/components/Header.vue app/components/header/MegaMenu.vue
git commit -m "Respect clickability in desktop navigation"
```

### Task 3: Apply clickability to mobile navigation

**Files:**
- Modify: `app/components/Header.vue`

- [x] **Step 1: Preserve clickability in mobile view models**

Extend `MobileNavLink`:

```ts
interface MobileNavLink {
  label: string
  url: string
  isClickable: boolean
  children: MobileNavLink[]
}
```

Map it in `menuLinkToNavLink`:

```ts
function menuLinkToNavLink(link: CatalogNavigationMenuLink): MobileNavLink {
  return {
    label: link.label,
    url: link.url,
    isClickable: link.isClickable,
    children: (link.children ?? []).map(menuLinkToNavLink),
  }
}
```

- [x] **Step 2: Render all three mobile states**

For root tabs, columns, and panel links:

- Render a button when the node has children; it opens or selects the panel.
- Render `NuxtLink` only when `isClickable === true` and the node has no child panel to open.
- Render a span when the node is a non-clickable leaf.

If a future clickable node also has children, the visible row opens the child panel and exposes its own category link as a separate "view all" action inside that panel. Do not discard either capability.

- [x] **Step 3: Run all tests and production build**

Run: `pnpm test`

Expected: all tests pass.

Run: `pnpm build`

Expected: Nuxt exits with code 0 and reports a completed client and server build.

- [x] **Step 4: Review the final diff against the contract**

Run:

```bash
git diff --check
git status --short
```

Confirm that `is_clickable === true` is the only link permission, non-clickable nodes never receive router destinations, and `docs/img.png` remains untracked.

- [x] **Step 5: Commit mobile behavior**

```bash
git add app/components/Header.vue
git commit -m "Respect clickability in mobile navigation"
```
