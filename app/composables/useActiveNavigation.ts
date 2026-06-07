// Recuerda la última categoría navegada para mantener el estado activo del nav
// cuando la ruta no la refleja (p. ej. la página de producto es `/products/{slug}`
// y el backend no expone breadcrumbs de categoría).
export function useActiveNavigation() {
  const activeCategoryPath = useState<string | null>('storefront:active-category-path', () => null)

  function setActiveCategoryPath(path: string | null | undefined): void {
    activeCategoryPath.value = path
      ? path.replace(/^\/+/, '').replace(/\/+$/, '') || null
      : null
  }

  return {
    activeCategoryPath,
    setActiveCategoryPath,
  }
}
