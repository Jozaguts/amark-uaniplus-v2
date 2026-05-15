export interface CatalogNavigationResponse {
  data?: CatalogNavigationPayload | CatalogNavigationItem[]
}

export interface CatalogNavigationPayload {
  version?: string
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
  badge?: string | null
  icon?: string | null
  italic?: boolean
  children?: CatalogNavigationItem[]
  menu?: CatalogNavigationMenu | null
}

export interface CatalogNavigationMenu {
  columns?: CatalogNavigationColumn[]
  images?: CatalogNavigationPromotion[]
}

export interface CatalogNavigationColumn {
  title: string
  items?: CatalogNavigationMenuLink[]
  groups?: CatalogNavigationMenuLink[][]
}

export interface CatalogNavigationMenuLink {
  id?: number | string
  label: string
  url: string
  path?: string
  badge?: string | null
  italic?: boolean
  children?: CatalogNavigationMenuLink[]
}

export interface CatalogNavigationPromotion {
  title: string
  description?: string | null
  alt: string
  src: string
  url: string
}
