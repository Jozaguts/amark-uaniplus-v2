export interface ProductDetailResponse {
  data?: ProductDetail | null
}

export interface ProductTechnique {
  id: string
  label: string
  price: string      // formatted, e.g. "$13.75"
  priceValue: number // dollars
}

export interface ProductDetail {
  id: number | string
  slug: string
  name: string
  brand?: string | null
  sku?: string | null
  product_type?: ProductCatalogType | string | null
  catalog_type?: ProductCatalogType | string | null
  provider?: string | null
  is_available: boolean
  is_designable: boolean
  url: string
  design_url?: string | null
  breadcrumbs?: ProductBreadcrumb[]
  price: ProductPrice
  techniques?: ProductTechnique[] | null
  techniquePrices?: Record<string, number> | null
  gallery: ProductGalleryItem[]
  options?: ProductOptions | null
  inventory?: ProductInventory | null
  content?: ProductContent | null
  shipping?: ProductShipping | null
  seo?: ProductSeo | null
}

export type ProductCatalogType = 'fashion' | 'accessories' | 'digital-products'

export interface ProductBreadcrumb {
  label: string
  url: string
}

export interface ProductPrice {
  amount?: number | null
  formatted: string
  compare_at_amount?: number | null
  compare_at_formatted?: string | null
  currency?: string | null
  is_on_sale?: boolean
}

export interface ProductGalleryItem {
  src: string
  srcset?: string | null
  thumb: string
  thumb_srcset?: string | null
  alt: string
}

export interface ProductOption {
  label: string
  value: string
  hex?: string | null
  image?: string | null
  is_available?: boolean
  is_selected?: boolean
}

export interface ProductOptions {
  sizes?: ProductOption[]
  colors?: ProductOption[]
}

export interface ProductInventory {
  status?: string | null
  label?: string | null
}

export interface ProductContent {
  description?: string[]
  size_fit?: string | null
  about_brand?: string | null
}

export interface ProductShipping {
  delivery_label?: string | null
  shipping_label?: string | null
  duties_label?: string | null
}

export interface ProductSeo {
  title?: string | null
  description?: string | null
  image?: string | null
}
