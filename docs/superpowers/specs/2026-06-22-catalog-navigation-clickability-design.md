# Catalog navigation clickability

## Goal

Render each catalog navigation node according to the backend `is_clickable`
field. The frontend must not infer navigation from `url`, `path`, node level,
name, or child count.

## API contract

`GET /api/catalog/navigation` keeps its response inside `data`. Every category
node may contain:

```ts
interface CatalogNavigationItem {
  is_clickable?: boolean
  children?: CatalogNavigationItem[]
}
```

The frontend treats only `is_clickable === true` as navigable. A missing,
`false`, or invalid value is non-clickable. `url` remains structural data and
doesn't grant navigation permission.

The frontend derives two independent properties for every node:

```ts
const canNavigate = node.is_clickable === true
const hasDropdown = (node.children?.length ?? 0) > 0
```

This permits a clickable node to have children and prevents the frontend from
using `hasDropdown` as a substitute for `canNavigate`.

## View models

`useCatalogNavigationTree` will preserve clickability while converting API
nodes into header columns and menu links:

- `CatalogNavigationColumn.isClickable` controls whether a column title links.
- `CatalogNavigationMenuLink.isClickable` controls whether a menu item links.
- Child presence controls whether a node opens another panel.

The API model keeps the backend field name `is_clickable`. Derived frontend
models use `isClickable` to follow TypeScript conventions.

## Desktop behavior

- Women and Men render as buttons because they are non-clickable and have
  children. Hover or activation opens their mega menu.
- Fashion and Accessories render as column headings because they are
  non-clickable.
- Collection renders as text because it is non-clickable and has no children.
- A future T-Shirts node renders as `NuxtLink` only when
  `is_clickable === true`.

No non-clickable node receives a router destination.

## Mobile behavior

- A non-clickable node with children renders as a button that opens the next
  navigation panel.
- A clickable node renders as `NuxtLink`.
- A non-clickable leaf renders as text and performs no action.
- Main section tabs follow the same rules. Selecting a non-clickable section
  with children changes the visible section; a non-clickable leaf does not
  navigate.

## Component boundaries

- `useCatalogNavigationTree`: filters and maps the API tree while preserving
  clickability.
- `Header.vue`: coordinates active desktop and mobile navigation state.
- `MegaMenu.vue`: renders headings, triggers, and links from typed props.

No new global state or dependency is needed.

## Tests

Unit tests will cover the pure navigation mapping rules:

1. `is_clickable: true` produces a navigable view model.
2. `is_clickable: false` produces a non-navigable view model even when `url`
   exists.
3. A missing `is_clickable` value produces a non-navigable view model.
4. Child presence remains independent from clickability.

The production build will verify Vue templates and TypeScript contracts.
