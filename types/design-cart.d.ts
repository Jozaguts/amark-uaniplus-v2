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
  id: string
  label?: string
  quantity: number
}

export type DesignCartVariantPayload = {
  color: {
    id: string
    name?: string | null
  } | null
  sizes: DesignCartItemMutationSizePayload[]
}

export type DesignCartCustomizationPayload = {
  technique: {
    id: string
    name?: string | null
  } | null
  provider_options: Record<string, unknown>
}

export type DesignCartItemCreatePayload = {
  source: DesignCartSource
  design_id?: string | null
  product_handle: string
  product_type?: string | null
  variant: DesignCartVariantPayload
  customization: DesignCartCustomizationPayload
}

export type DesignCartItemUpdatePayload = {
  variant: {
    sizes: DesignCartItemMutationSizePayload[]
  }
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
  color?: DesignCartApiReference | null
  technique?: DesignCartApiReference | null
  placements?: string[]
  sizes?: Array<DesignCartItemMutationSizePayload & { size_id?: string | null }>
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
