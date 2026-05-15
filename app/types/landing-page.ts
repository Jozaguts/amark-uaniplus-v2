export interface LandingPageResponse {
  data?: LandingPage | null
}

export interface LandingPage {
  id: number | string
  scope: string
  title: string
  is_active: boolean
  version?: string
  seo?: LandingSeo | null
  sections: LandingSection[]
}

export interface LandingSeo {
  title?: string | null
  description?: string | null
  image?: string | null
}

export interface LandingSection {
  id: number | string
  type: LandingSectionType | string
  sort_order?: number
  is_active: boolean
  heading?: string | null
  description?: string | null
  cta?: LandingCta | null
  layout?: LandingLayout | null
  items: LandingItem[]
}

export type LandingSectionType =
  | 'hero_banner'
  | 'two_tile_grid'
  | 'text_kicker_grid'
  | 'image_tile_grid'
  | 'promo_banner'

export interface LandingLayout {
  max_width?: string | null
  aspect_ratio?: string | null
  columns_desktop?: number | null
}

export interface LandingItem {
  id: number | string
  title?: string | null
  subtitle?: string | null
  cta_label?: string | null
  aria_label?: string | null
  url: string
  image: LandingImage
  overlay?: LandingOverlay | null
  sort_order?: number
}

export interface LandingImage {
  src: string
  srcset?: string | null
  alt: string
}

export interface LandingOverlay {
  count?: string | null
  text?: string | null
}

export interface LandingCta {
  label: string
  url: string
}
