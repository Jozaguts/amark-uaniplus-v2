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
