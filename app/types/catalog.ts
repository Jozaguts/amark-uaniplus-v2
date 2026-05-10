import type { RouteLocationRaw } from 'vue-router'

export interface CatalogSidebarGroup {
  titleKey: string
  items: {
    labelKey: string
    active?: boolean
    danger?: boolean
  }[]
}

export interface CatalogProduct {
  id: string
  nameKey: string
  brandKey: string
  salePriceKey: string
  retailPriceKey: string
  altKey: string
  image: string
  srcset?: string
  to: RouteLocationRaw
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
