import type { RouteLocationRaw } from 'vue-router'

export interface CatalogSidebarGroup {
  titleKey: string
  items: {
    labelKey?: string
    label?: string
    to?: RouteLocationRaw
    active?: boolean
    danger?: boolean
  }[]
}

export interface CatalogProduct {
  id: string
  name?: string
  nameKey?: string
  brand?: string
  brandKey?: string
  salePrice?: string
  salePriceKey?: string
  retailPrice?: string | null
  retailPriceKey?: string
  alt?: string
  altKey?: string
  image: string
  srcset?: string
  to: RouteLocationRaw
  designTo?: RouteLocationRaw
  isDesignable?: boolean
}

export interface ProductGalleryImage {
  src: string
  srcset?: string
  thumb: string
  thumbSrcset?: string
  altKey: string
}

export interface ProductSizeOption {
  label: string
  disabled?: boolean
  selected?: boolean
}
