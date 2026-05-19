export type DesignCartSummary = {
  productPrice: number
  customizationPrice: number
  totalPrice: number
  productPriceLabel: string
  customizationPriceLabel: string
  totalPriceLabel: string
}

export type DesignCartSource = 'design' | 'blank' | 'product'

export type DesignCartSizeAllocation = {
  id: string
  label: string
  quantity: number
}

export type DesignCartItem = {
  id: string
  source: DesignCartSource
  designId?: string | null
  productId?: string | number | null
  variantId?: string | number | null
  productHandle: string
  productType?: string | null
  productName: string
  productSku: string
  designName?: string | null
  colorId: string
  colorName?: string | null
  techniqueId?: string | null
  techniqueName?: string | null
  previewImage?: string | null
  placementLabels: string[]
  artworkCount: number
  sizes: DesignCartSizeAllocation[]
  quantity: number
  summary: DesignCartSummary
  addedAt: string
  updatedAt: string
}

export type DesignCartItemMutationSizePayload = {
  size_id: string
  label?: string
  quantity: number
}

export type DesignCartItemCreatePayload = {
  source: DesignCartSource
  design_id?: string | null
  product_handle: string
  product_type?: string | null
  color_id?: string | null
  color_name?: string | null
  technique_id?: string | null
  technique_name?: string | null
  sizes: DesignCartItemMutationSizePayload[]
  quantity_total?: number
}

export type DesignCartItemUpdatePayload = {
  sizes: DesignCartItemMutationSizePayload[]
}

export type DesignCartMergePayload = {
  items: DesignCartItemCreatePayload[]
}

export type DesignCartApiReference = {
  id?: string | null
  name?: string | null
}

export type DesignCartApiPricing = {
  product_subtotal: string
  customization_subtotal: string
  total: string
}

export type DesignCartApiItem = {
  id: string
  source: DesignCartSource
  design_id?: string | null
  product_id?: string | number | null
  variant_id?: string | number | null
  product_handle: string
  product_type?: string | null
  product_name: string
  product_sku: string
  preview_image?: string | null
  color: DesignCartApiReference
  technique?: DesignCartApiReference | null
  placements?: string[]
  sizes: DesignCartItemMutationSizePayload[]
  quantity_total: number
  pricing: DesignCartApiPricing
  created_at: string
  updated_at: string
}

export type DesignCartApiSummary = {
  items_count: number
  units_count: number
  product_subtotal: string
  customization_subtotal: string
  shipping: string
  total: string
}

export type DesignCartResponse = {
  data: {
    items: DesignCartApiItem[]
    summary: DesignCartApiSummary
  }
}

export type DesignCartDeleteResponse = {
  message: string
}
