export type StorefrontUploadArtworkScope = 'user' | 'platform' | 'all'

export type StorefrontUploadArtworkCategory = {
  name: string
  slug: string
}

export type StorefrontUploadArtwork = {
  id: string | number
  scope: StorefrontUploadArtworkScope
  name: string
  category: StorefrontUploadArtworkCategory | null
  original_name: string
  filename: string
  extension: string
  mime_type: string
  size: number
  disk: string
  path: string
  url: string
  uploaded_at: string
}

export type StorefrontUploadArtworkPaginationMeta = Record<string, unknown> & {
  current_page?: number
  per_page?: number
  total?: number
  last_page?: number
}

export type StorefrontUploadArtworkPaginationLink = {
  url: string | null
  label: string
  active: boolean
}

export type StorefrontUploadArtworkListResponse = {
  data: StorefrontUploadArtwork[]
  meta?: StorefrontUploadArtworkPaginationMeta
  links?: StorefrontUploadArtworkPaginationLink[]
}

export type StorefrontUploadArtworkListQuery = {
  scope?: StorefrontUploadArtworkScope
  category?: string
  page?: number
  per_page?: number
}

export type StorefrontUploadArtworkCategoryListQuery = {
  scope?: StorefrontUploadArtworkScope
}

export type StorefrontUploadArtworkCategoryListResponse = {
  data: StorefrontUploadArtworkCategory[]
}

export type StorefrontUploadArtworkCreateResponse = {
  message: string
  data: StorefrontUploadArtwork
}
