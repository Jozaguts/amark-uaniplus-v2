export type SearchResultType = 'product' | 'category'

export interface SearchResult {
  type: SearchResultType
  name: string
  slug?: string
  path?: string
  image?: string | null
  price?: string | null
}

export interface SearchResponse {
  data: SearchResult[]
}
