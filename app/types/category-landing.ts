export interface LandingImage {
  altKey: string
  src: string
  srcset?: string
}

export interface HeroSlide extends LandingImage {
  ctaLabelKey: string
  categorySlug?: string
  href?: string
}

export interface CategoryTile extends LandingImage {
  titleKey: string
  ctaLabelKey: string
  categorySlug?: string
  href?: string
}

export interface ProductCard extends LandingImage {
  nameKey: string
  categoryKey: string
  priceKey: string
  ctaLabelKey: string
  slug?: string
  categorySlug?: string
  href?: string
  categoryHref?: string
}
