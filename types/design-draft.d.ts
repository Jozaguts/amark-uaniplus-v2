import type { EditorCoordinateSpace } from '~~/types/editor-product'

export type DesignDraftObjectType = 'image' | 'text'

export type DesignDraftCanvasObject = {
  id: string
  type: DesignDraftObjectType
  assetId: string
  wordArtId?: string | null
  uploadArtworkId?: string | number | null
  name?: string | null
  viewId: string
  src?: string | null
  text?: string
  fill?: string
  fontFamily?: string
  fontSize?: number
  fontStyle?: string
  letterSpacing?: number
  textTransform?: 'uppercase' | 'lowercase' | null
  naturalWidth: number
  naturalHeight: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export type DesignDraftColorPayload = {
  id: string
  name?: string | null
}

export type DesignDraftTechniquePayload = {
  id: string
  name?: string | null
}

export type DesignDraftMockupSnapshot = {
  src: string
  width: number
  height: number
}

export type DesignDraftPrintAreaSnapshot = {
  id: string
  placement?: string | null
  placementId?: string | null
  printfileId?: string | number | null
  printfile_id?: string | number | null
  x: number
  y: number
  width: number
  height: number
  rotation: number
  production_width?: number | null
  production_height?: number | null
  dpi?: number | null
}

export type DesignDraftProductionFilePosition = {
  area_width: number
  area_height: number
  width: number
  height: number
  top: number
  left: number
  limit_to_print_area: boolean
}

export type DesignDraftProductionFile = {
  view_id: string
  placement: string
  technique: string
  url: string
  mime_type: string
  width: number
  height: number
  dpi: number | null
  position: DesignDraftProductionFilePosition
}

export type DesignDraftPreviewFile = {
  url: string
  width: number
  height: number
  mime_type?: string | null
}

export type DesignDraftEditorObjectPayload = {
  id: string
  type: DesignDraftObjectType
  upload_artwork_id?: string | number | null
  word_art_id?: string | null
  name?: string | null
  src?: string | null
  text?: string | null
  fill?: string | null
  font_family?: string | null
  font_size?: number | null
  font_style?: string | null
  letter_spacing?: number | null
  text_transform?: 'uppercase' | 'lowercase' | null
  natural_width: number
  natural_height: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  z_index: number
}

export type DesignDraftEditorViewPayload = {
  view_id: string
  view_label: string
  placement_id?: string | null
  print_area_id: string
  snapshot: {
    mockup: DesignDraftMockupSnapshot
    print_area: DesignDraftPrintAreaSnapshot
  }
  objects: DesignDraftEditorObjectPayload[]
}

export type DesignDraftEditorPayload = {
  schema_version: number
  provider: string
  coordinate_space: EditorCoordinateSpace
  color: DesignDraftColorPayload
  technique: DesignDraftTechniquePayload
  views: DesignDraftEditorViewPayload[]
  production_files?: DesignDraftProductionFile[]
  preview_file?: DesignDraftPreviewFile | null
}

export type DesignDraftUpsertPayload = {
  product_handle: string
  name?: string | null
  description?: string | null
  editor_payload: DesignDraftEditorPayload
}

export type DesignDraft = {
  id: string
  status: string
  product_handle: string
  product_type?: string | null
  product_name?: string | null
  name?: string | null
  description?: string | null
  preview_image?: string | null
  editor_payload: DesignDraftEditorPayload
  created_at: string
  updated_at: string
}

export type DesignDraftResponse = {
  data: DesignDraft
}

export type DesignDraftListItem = {
  id: string
  status: string
  product_handle: string
  product_type?: string | null
  product_name?: string | null
  name?: string | null
  preview_image?: string | null
  updated_at: string
}

export type DesignDraftListQuery = {
  product_handle?: string
  status?: string
  page?: number
  per_page?: number
}

export type DesignDraftListResponse = {
  data: DesignDraftListItem[]
  meta?: Record<string, unknown>
}

export type DesignDraftDeleteResponse = {
  message: string
}
