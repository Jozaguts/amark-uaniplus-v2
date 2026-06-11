export type EditorProductLookupBy = 'slug' | 'sku'

export type EditorCoordinateSpace = 'image-px' | string

export type EditorProductColor = {
  id: string
  label: string
  hex: string
}

export type EditorProductTechnique = {
  id: string
  label?: string
  name?: string
  price?: string
  priceValue?: number
}

export type EditorProductMockup = {
  previewColorId: string
  previewColorHex: string
  src: string
  width: number
  height: number
}

export type EditorProductLifestyleMockup = {
  viewId: string
  kind?: 'lifestyle' | 'flat'        // 'lifestyle' = tintable model photo; default treated as 'flat'
  src: string                        // model photo (neutral/white garment, opaque background OK)
  width: number
  height: number
  // Tint: alpha = garment (1 inside, 0 outside). Presence enables CSS tint.
  maskUrl?: string | null
  // Print zone as RATIOS (0–1) plus rotation in degrees.
  printZone?: { x: number; y: number; w: number; h: number; rotation: number } | null
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | null  // default 'normal' (el diseño se imprime en su color real; 'multiply' oscurece y oculta tinta clara sobre prendas oscuras)
  // Optional / ignored for 'lifestyle' (photo is neutral; color comes from the Design tab)
  previewColorId?: string
  previewColorHex?: string
}

export type EditorProductPrintArea = {
  id: string
  label: string
  placement?: string | null
  placementId?: string | null
  printfileId?: string | number | null
  printfile?: {
    width: number
    height: number
    dpi?: number | null
    fillMode?: 'fit' | 'cover' | string | null
    canRotate?: boolean | null
  } | null
  price: string
  priceValue: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export type EditorProductView = {
  id: string
  label: string
  placement?: string | null
  supportedTechniques?: string[]
  mockup: EditorProductMockup
  printArea: EditorProductPrintArea
}

export type EditorWordArtOption = {
  id: string
  label: string
  fallback_text: string
  font_family: string
  font_url: string
  font_weight: number | string
  font_style: 'normal' | 'italic'
  font_size: number
  text_transform: 'uppercase' | 'lowercase' | null
  letter_spacing: number
  line_height: number | null
  default_color: string
  preview_class_name: string | null
  enabled: boolean
  sort_order: number
}

export type EditorWordArt = {
  text: EditorWordArtOption[]
  numbers: EditorWordArtOption[]
}

export type EditorProductConfig = {
  enabled: boolean
  coordinateSpace: EditorCoordinateSpace
  defaultViewId: string | null
  selectedColorId: string | null
  selectedTechniqueId: string | null
  colors: EditorProductColor[]
  techniques: EditorProductTechnique[]
  views: EditorProductView[]
  word_art: EditorWordArt
  mockups?: EditorProductLifestyleMockup[]
}

export type EditorProductProvider = 'printful' | 'apliiq' | 'cj' | 'manual' | 'digital' | string

export type EditorProduct = {
  id: string
  slug: string
  name: string
  sku: string
  provider: EditorProductProvider
  price: string                          // formatted, e.g. "$13.75" (default technique)
  priceValue: number                     // dollars, default technique
  techniquePrices: Record<string, number> // dollars per technique key, e.g. { dtg: 13.75, embroidery: 15.25 }
  editor: EditorProductConfig
}

export type EditorProductQuery = {
  by?: EditorProductLookupBy
}

export type EditorProductResponse = {
  data: EditorProduct
}
