export interface CatalogProductsResponse {
  data?: CatalogProductsPayload | null
}

export interface CatalogProductsPayload {
  category: CatalogProductsCategory
  filters: CatalogProductsFilters
  products: CatalogProductsItem[]
  pagination: CatalogProductsPagination
  sort?: CatalogProductsSort
}

export interface CatalogProductsCategory {
  id: number | string
  name: string
  slug: string
  path: string
  url: string
  breadcrumbs?: CatalogProductsBreadcrumb[]
}

export interface CatalogProductsBreadcrumb {
  name: string
  path: string
  url: string
}

export interface CatalogProductsFilters {
  price?: CatalogProductsPriceFilter | null
  sizes?: CatalogProductsOption[]
  colors?: CatalogProductsColorOption[]
}

export interface CatalogProductsPriceFilter {
  min: number
  max: number
  selected_min?: number | null
  selected_max?: number | null
  currency?: string | null
}

export interface CatalogProductsOption {
  label: string
  value: string
  count?: number
  is_available?: boolean
  is_selected?: boolean
}

export interface CatalogProductsColorOption extends CatalogProductsOption {
  hex?: string | null
  image?: string | null
}

export interface CatalogProductsItem {
  id: number | string
  slug: string
  name: string
  brand?: string | null
  url: string
  design_url?: string | null
  image: {
    src: string
    srcset?: string | null
    alt: string
  }
  price: {
    amount?: number | null
    formatted: string
    compare_at_amount?: number | null
    compare_at_formatted?: string | null
    currency?: string | null
    is_on_sale?: boolean
  }
  badges?: string[]
  is_available?: boolean
  is_designable?: boolean
}

export interface CatalogProductsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from?: number | null
  to?: number | null
  has_more_pages: boolean
}

export interface CatalogProductsSort {
  selected?: string
  options?: {
    label: string
    value: string
  }[]
}
