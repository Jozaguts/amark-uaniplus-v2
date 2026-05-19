export type EditorProductLookupBy = 'slug' | 'sku'

export type EditorCoordinateSpace = 'image-px' | string

export type EditorProductColor = {
  id: string
  label: string
  hex: string
}

export type EditorProductTechnique = {
  id: string
  label: string
}

export type EditorProductMockup = {
  previewColorId: string
  previewColorHex: string
  src: string
  width: number
  height: number
}

export type EditorProductPrintArea = {
  id: string
  label: string
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
}

export type EditorProduct = {
  id: string
  slug: string
  name: string
  sku: string
  editor: EditorProductConfig
}

export type EditorProductQuery = {
  by?: EditorProductLookupBy
}

export type EditorProductResponse = {
  data: EditorProduct
}
