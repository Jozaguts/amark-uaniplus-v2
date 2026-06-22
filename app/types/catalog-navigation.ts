// --- API contract (GET /api/catalog/navigation) ---
// La navegación se construye desde la tabla `categories`: las categorías reales
// viven en `children[]` (máximo 3 niveles) y la organización visual del
// mega-menú se expone aparte en `menu_groups[]`. Ya no existe el bloque `menu`
// (columns/images) ni los campos `badge`/`icon`/`italic`. `name` es string plano.

export interface CatalogNavigationResponse {
  // El endpoint devuelve la forma plana; conservamos `data` por compatibilidad
  // con envoltorios previos del cliente storefront.
  data?: CatalogNavigationPayload | CatalogNavigationItem[]
  version?: string | null
  max_depth?: number
  items?: CatalogNavigationItem[]
}

export interface CatalogNavigationPayload {
  version?: string | null
  max_depth?: number
  items?: CatalogNavigationItem[]
}

export interface CatalogNavigationItem {
  id: number | string
  type?: string
  name: string
  slug: string
  path: string
  url: string
  level: number
  sort_order?: number
  is_active?: boolean
  is_clickable?: boolean
  children?: CatalogNavigationItem[]

  // Presentación del mega-menú (columnas visuales). Sólo cuando existe.
  menu_groups?: CatalogNavigationMenuGroup[]

  // Opcionales — sólo presentes si tienen valor.
  description?: string | null
  seo_title?: string | null
  seo_description?: string | null
}

// Grupo visual del mega-menú. `title` es sólo un encabezado de columna, NO una
// categoría navegable; cada `items[]` sí es una categoría real.
export interface CatalogNavigationMenuGroup {
  id?: number | string
  title: string
  sort_order?: number
  items: CatalogNavigationItem[]
}

// --- Modelos de vista (derivados del árbol para render del mega-menú) ---
// No vienen de la API: los construye `useCatalogNavigationTree` a partir de
// `children[]` para alimentar el Header y el MegaMenu.

export interface CatalogNavigationMenu {
  columns: CatalogNavigationColumn[]
}

export interface CatalogNavigationColumn {
  id?: number | string
  title: string
  url?: string
  isClickable: boolean
  items: CatalogNavigationMenuLink[]
}

export interface CatalogNavigationMenuLink {
  id?: number | string
  label: string
  url: string
  path?: string
  isClickable: boolean
  children?: CatalogNavigationMenuLink[]
}
