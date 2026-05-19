import type { EditorProduct } from '~~/types/editor-product'
import type {
  DesignDraftCanvasObject,
  DesignDraftDeleteResponse,
  DesignDraftEditorPayload,
  DesignDraftListQuery,
  DesignDraftListResponse,
  DesignDraftResponse,
  DesignDraftUpsertPayload,
} from '~~/types/design-draft'
import {useStorefront} from "~/composables/useStorefront";

const DESIGN_DRAFT_SCHEMA_VERSION = 1

export const buildDesignDraftEditorPayload = (options: {
  product: EditorProduct
  selectedColorId: string
  selectedTechniqueId: string
  designObjectsByView: Record<string, DesignDraftCanvasObject[]>
}): DesignDraftEditorPayload => {
  const { product, selectedColorId, selectedTechniqueId, designObjectsByView } = options
  const editor = product.editor
  const selectedColor = editor.colors.find(color => color.id === selectedColorId) ?? null
  const selectedTechnique = editor.techniques.find(technique => technique.id === selectedTechniqueId) ?? null
  const views = editor.views.flatMap((view) => {
    const objects = [...(designObjectsByView[view.id] ?? [])]

    if (!objects.length) {
      return []
    }

    return [{
      view_id: view.id,
      view_label: view.label,
      placement_id: view.id,
      print_area_id: view.printArea.id,
      snapshot: {
        mockup: {
          src: view.mockup.src,
          width: view.mockup.width,
          height: view.mockup.height,
        },
        print_area: {
          id: view.printArea.id,
          x: view.printArea.x,
          y: view.printArea.y,
          width: view.printArea.width,
          height: view.printArea.height,
          rotation: view.printArea.rotation,
        },
      },
      objects: objects.map((object, index) => ({
        id: object.id,
        type: object.type,
        upload_artwork_id: object.uploadArtworkId ?? null,
        word_art_id: object.wordArtId ?? null,
        name: object.name ?? null,
        src: object.src ?? null,
        text: object.text ?? null,
        fill: object.fill ?? null,
        font_family: object.fontFamily ?? null,
        font_size: object.fontSize ?? null,
        font_style: object.fontStyle ?? null,
        letter_spacing: object.letterSpacing ?? null,
        text_transform: object.textTransform ?? null,
        natural_width: object.naturalWidth,
        natural_height: object.naturalHeight,
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height,
        rotation: object.rotation,
        z_index: index,
      })),
    }]
  })

  return {
    schema_version: DESIGN_DRAFT_SCHEMA_VERSION,
    coordinate_space: editor.coordinateSpace,
    color: {
      id: selectedColorId,
      name: selectedColor?.label ?? null,
    },
    technique: {
      id: selectedTechniqueId,
      name: selectedTechnique?.label ?? null,
    },
    views,
  }
}

export const buildDesignDraftUpsertPayload = (options: {
  product: EditorProduct
  selectedColorId: string
  selectedTechniqueId: string
  designObjectsByView: Record<string, DesignDraftCanvasObject[]>
  name?: string | null
  description?: string | null
}): DesignDraftUpsertPayload => {
  return {
    product_handle: options.product.slug,
    name: options.name ?? null,
    description: options.description ?? null,
    editor_payload: buildDesignDraftEditorPayload(options),
  }
}

export const hydrateDesignObjectsByView = (
  editorPayload: DesignDraftEditorPayload,
) => {
  return Object.fromEntries(
    editorPayload.views.map(view => [
      view.view_id,
      [...view.objects]
        .sort((left, right) => left.z_index - right.z_index)
        .map(object => ({
          id: object.id,
          type: object.type,
          assetId: object.upload_artwork_id != null ? String(object.upload_artwork_id) : object.word_art_id ?? object.id,
          wordArtId: object.word_art_id ?? null,
          uploadArtworkId: object.upload_artwork_id ?? null,
          name: object.name ?? null,
          viewId: view.view_id,
          src: object.src ?? null,
          text: object.text ?? undefined,
          fill: object.fill ?? undefined,
          fontFamily: object.font_family ?? undefined,
          fontSize: object.font_size ?? undefined,
          fontStyle: object.font_style ?? undefined,
          letterSpacing: object.letter_spacing ?? undefined,
          textTransform: object.text_transform ?? null,
          naturalWidth: object.natural_width,
          naturalHeight: object.natural_height,
          x: object.x,
          y: object.y,
          width: object.width,
          height: object.height,
          rotation: object.rotation,
        })),
    ]),
  ) as Record<string, DesignDraftCanvasObject[]>
}

export const useDesignDrafts = () => {
  const storefront = useStorefront()

  return {
    createDesignDraft(payload: DesignDraftUpsertPayload) {
      return storefront<DesignDraftResponse>('/designs', {
        method: 'POST',
        body: payload,
      })
    },
    updateDesignDraft(designId: string, payload: DesignDraftUpsertPayload) {
      return storefront<DesignDraftResponse>(`/designs/${designId}`, {
        method: 'PATCH',
        body: payload,
      })
    },
    getDesignDraft(designId: string) {
      return storefront<DesignDraftResponse>(`/designs/${designId}`)
    },
    deleteDesignDraft(designId: string) {
      return storefront<DesignDraftDeleteResponse>(`/designs/${designId}`, {
        method: 'DELETE',
      })
    },
    listDesignDrafts(query: DesignDraftListQuery = {}) {
      return storefront<DesignDraftListResponse>('/designs', {
        query,
      })
    },
  }
}
