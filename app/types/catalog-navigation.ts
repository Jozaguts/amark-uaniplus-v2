// --- API contract (GET /api/catalog/navigation) ---
// La navegación se construye desde la tabla `categories`: un árbol jerárquico
// uniforme expuesto en `children[]` recursivo. Ya no existe el bloque `menu`
// (mega-menú) ni los campos `badge`/`icon`/`italic`. `name` es string plano.

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
  children?: CatalogNavigationItem[]

  // Opcionales — sólo presentes si tienen valor.
  description?: string | null
  seo_title?: string | null
  seo_description?: string | null
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
  items: CatalogNavigationMenuLink[]
}

export interface CatalogNavigationMenuLink {
  id?: number | string
  label: string
  url: string
  path?: string
  children?: CatalogNavigationMenuLink[]
}
