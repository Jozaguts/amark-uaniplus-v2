<script setup lang="ts">
import DesignPriceSummaryPopover from '~/components/design/PriceSummaryPopover.vue'
import DesignImageManagementDialog from '~/components/design/panels/ImageManagementDialog.vue'
import DesignImagePanel from '~/components/design/panels/ImagePanel.vue'
import DesignProductPanel from '~/components/design/panels/ProductPanel.vue'
import DesignSaveSuccessDialog from '~/components/design/SaveSuccessDialog.vue'
import DesignSavedPanel from '~/components/design/panels/SavedPanel.vue'
import DesignTextPanel from '~/components/design/panels/TextPanel.vue'
import DesignUploadPanel from '~/components/design/panels/UploadPanel.vue'
import { useDesignCart } from '~/composables/useDesignCart'
import {
  attachDesignProductionFiles,
  buildDesignDraftUpsertPayload,
  hydrateDesignObjectsByView,
  useDesignDrafts,
} from '~/composables/useDesignDrafts'
import type {
  DesignEditorAsset,
  DesignEditorAssetCategory,
  DesignEditorDialogTab,
  DesignEditorUploadAsset,
  DesignEditorWordArtOption,
} from '~/data/design-editor'
import type { DesignCartItem } from '~~/types/design-cart'
import type {
  DesignDraftCanvasObject,
  DesignDraftPreviewFile,
  DesignDraftProductionFile,
} from '~~/types/design-draft'
import type {
  EditorProductMockup,
  EditorProductView,
  EditorWordArtOption as ApiEditorWordArtOption,
} from '~~/types/editor-product'
import type { ProductDetail, ProductDetailSelectableOption, ProductType } from '~~/types/product'
import type { StorefrontFetchError } from '~~/types/storefront'
import type {
  StorefrontUploadArtwork,
  StorefrontUploadArtworkCategoryListResponse,
  StorefrontUploadArtworkCreateResponse,
  StorefrontUploadArtworkListQuery,
  StorefrontUploadArtworkListResponse,
} from '~~/types/storefront-upload-artwork'

type EditorToolId = 'upload' | 'image' | 'text' | 'product' | 'saved' | 'issues' | 'guide'

type DesignPlacement = {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

type DesignTextArtSelection = {
  text: string
  color: string
  option: DesignEditorWordArtOption
}

type DesignTextStyle = {
  fontFamily: string
  fontSize: number
  fontStyle: string
  letterSpacing: number
  textTransform: 'uppercase' | 'lowercase' | null
}

definePageMeta({
  layout: false,
})

const route = useRoute()
const productIdentifier = computed(() => String(route.params.id ?? ''))
const productType = computed(() => {
  const type = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type
  return typeof type === 'string' ? type : undefined
})
const lookupBy = computed(() => {
  const by = Array.isArray(route.query.by) ? route.query.by[0] : route.query.by
  return typeof by === 'string' ? by : undefined
})
const draftDesignId = computed(() => {
  const candidate = route.query.designId ?? route.query.design ?? route.query.draft

  if (Array.isArray(candidate)) {
    return typeof candidate[0] === 'string' ? candidate[0] : undefined
  }

  return typeof candidate === 'string' ? candidate : undefined
})
const queryTechniqueId = computed(() => {
  const t = Array.isArray(route.query.technique) ? route.query.technique[0] : route.query.technique
  return typeof t === 'string' ? t : undefined
})
const queryColorId = computed(() => {
  const color = Array.isArray(route.query.color) ? route.query.color[0] : route.query.color
  return typeof color === 'string' ? color : undefined
})
const querySizeId = computed(() => {
  const size = Array.isArray(route.query.size) ? route.query.size[0] : route.query.size
  return typeof size === 'string' ? size : undefined
})
const { $storefront } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const {
  createDesignDraft,
  getDesignDraft,
  updateDesignDraft,
  uploadDesignProductionFile,
} = useDesignDrafts()
const { addCartItem } = useDesignCart()

const {
  data: product,
  pending: productPending,
  status: productStatus,
  refresh: refreshProduct,
} = await useEditorProductData({
  identifier: productIdentifier,
  type: productType,
  by: lookupBy,
  keyPrefix: 'editor-product',
  server: false,
})

const productName = computed(() => {
  return product.value?.name ?? 'Design Now'
})
const editor = computed(() => product.value?.editor ?? null)
const availableColors = computed(() => editor.value?.colors ?? [])
const availableViews = computed(() => editor.value?.views ?? [])
const isEditorReady = computed(() => Boolean(product.value?.editor?.enabled))
const isEditorLoading = computed(() => productStatus.value === 'idle' || productStatus.value === 'pending')
const isEditorUnavailable = computed(() => !isEditorLoading.value && !isEditorReady.value)

const priceSummary = computed(() => {
  const baseAmount = product.value?.techniquePrices?.[selectedTechniqueId.value]
    ?? product.value?.priceValue
    ?? 0
  const baseFormatted = currencyFormatter.format(baseAmount)

  const decorated = availableViews.value.filter(
    view => (designObjectsByView.value[view.id] ?? []).length > 0,
  )

  if (!decorated.length) {
    return {
      totalLabel: 'Total Price:',
      totalPrice: baseFormatted,
      lineItems: [] as { label: string, value: string }[],
      footnote: '*Excluding shipping and taxes',
    }
  }

  // priceValue per view is the EXTRA cost in dollars (0 = included, >0 = charged on top)
  const extra = decorated.reduce((sum, view) => sum + (view.printArea.priceValue ?? 0), 0)
  const total = baseAmount + extra

  return {
    totalLabel: 'Total Price:',
    totalPrice: currencyFormatter.format(total),
    lineItems: decorated.map(view => ({
      label: view.label,
      value: view.printArea.priceValue === 0
        ? 'Included'
        : `+${view.printArea.price}`,
    })),
    footnote: '*Excluding shipping and taxes',
  }
})

const editorToolsTop = [
  { id: 'upload', label: 'Upload', icon: 'ph:upload-simple' },
  { id: 'image', label: 'Image', icon: 'ph:image-square' },
  { id: 'text', label: 'Text', icon: 'ph:text-t' },
  { id: 'product', label: 'Product', icon: 'ph:package' },
  { id: 'saved', label: 'Saved', icon: 'ph:bookmark-simple' },
] satisfies { id: EditorToolId, label: string, icon: string }[]

const editorToolsBottom = [
  { id: 'issues', label: 'Issues', icon: 'ph:warning-circle' },
  { id: 'guide', label: 'Guide', icon: 'ph:question' },
] satisfies { id: EditorToolId, label: string, icon: string }[]

const activeTool = ref<EditorToolId>('upload')
const activeViewId = ref('')
const selectedColorId = ref('')
const selectedTechniqueId = ref('')
const isAdjustedMockup = ref(false)
const imageManagementVisible = ref(false)
const imageManagementInitialTab = ref<DesignEditorDialogTab>('mine')
const localUploadedAssets = ref<DesignEditorUploadAsset[]>([])
const activeUploadedAssetId = ref<string | null>(null)
const activePlatformAssetId = ref<string | null>(null)
const hasLoadedUploadArtworks = ref(false)
const selectedPlatformCategory = ref('')
const hasLoadedPlatformArtworks = ref(false)
const hasLoadedPlatformArtworkCategories = ref(false)

const workspaceRef = ref<HTMLElement | null>(null)
const { width: workspaceWidth, height: workspaceHeight } = useElementSize(workspaceRef)
const stageRef = ref<{
  getNode: () => {
    batchDraw: () => void
    toDataURL: (config?: { pixelRatio?: number, mimeType?: string, quality?: number }) => string
  }
} | null>(null)
const transformerRef = ref<{ getNode: () => any } | null>(null)
const canvasImage = shallowRef<HTMLImageElement | null>(null)
const designImageNodeRefs = new Map<string, { getNode: () => any }>()
const artworkImageElements = shallowRef<Record<string, HTMLImageElement>>({})
const designObjectsByView = ref<Record<string, DesignDraftCanvasObject[]>>({})
const activeDesignObjectId = ref<string | null>(null)
const uploadRequests = new Map<string, XMLHttpRequest>()
const activeDesignDraftId = ref<string | null>(null)
const hydratedDraftDesignId = ref<string | null>(null)
const cartProductDetail = ref<ProductDetail | null>(null)
const cartProductDetailPending = ref(false)
const designSavePending = ref(false)
const designSaveErrorMessage = ref<string | null>(null)
const designSaveSuccessMessage = ref<string | null>(null)
const saveSuccessToastVisible = ref(false)
const saveSuccessToastMessage = ref('Design saved successfully.')
const saveSuccessDialogVisible = ref(false)
const latestSavedDesignPreviewImage = ref<string | null>(null)
const toastTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const successDialogTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const savedDraftsRefreshKey = ref(0)
const zoomScaleFactor = ref(1)

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const createCartItemId = () => `cart-item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const initializeEditorSelections = () => {
  const currentEditor = editor.value

  if (!currentEditor) {
    activeViewId.value = ''
    selectedColorId.value = ''
    selectedTechniqueId.value = ''
    return
  }

  activeViewId.value = currentEditor.defaultViewId ?? currentEditor.views[0]?.id ?? ''
  selectedColorId.value = currentEditor.colors.some(color => color.id === queryColorId.value)
    ? queryColorId.value ?? ''
    : currentEditor.selectedColorId ?? currentEditor.colors[0]?.id ?? ''
  selectedTechniqueId.value = queryTechniqueId.value
    ?? currentEditor.selectedTechniqueId
    ?? currentEditor.techniques[0]?.id
    ?? ''
}

watch(() => product.value?.id, initializeEditorSelections, { immediate: true })
watch(() => product.value?.id, () => {
  designObjectsByView.value = {}
  activeDesignObjectId.value = null
  hydratedDraftDesignId.value = null
  cartProductDetail.value = null
}, { immediate: true })

const activeToolMeta = computed(() => [...editorToolsTop, ...editorToolsBottom].find(tool => tool.id === activeTool.value))
const editorBackHref = computed(() => {
  const query = new URLSearchParams()

  if (productType.value) {
    query.set('type', productType.value)
  }

  if (lookupBy.value === 'sku') {
    query.set('by', 'sku')
  }

  const queryString = query.toString()

  return `/products/${product.value?.slug ?? productIdentifier.value}${queryString ? `?${queryString}` : ''}`
})
const activeView = computed(() => {
  return availableViews.value.find(view => view.id === activeViewId.value) ?? availableViews.value[0] ?? null
})
const activePrintArea = computed(() => {
  return activeView.value?.printArea ?? null
})
const activeMockup = computed<EditorProductMockup | null>(() => {
  return activeView.value?.mockup ?? null
})
const activeDesignObjects = computed(() => {
  if (!activeViewId.value) {
    return []
  }

  return designObjectsByView.value[activeViewId.value] ?? []
})
const activeDesignObject = computed(() => {
  return activeDesignObjects.value.find(object => object.id === activeDesignObjectId.value) ?? null
})
const previewColors = computed(() => {
  return availableColors.value
})
const mapEditorWordArtOption = (option: ApiEditorWordArtOption): DesignEditorWordArtOption => ({
  id: option.id,
  label: option.label,
  className: option.preview_class_name || 'text-center',
  fallbackText: option.fallback_text,
  fontFamily: option.font_family,
  fontUrl: option.font_url,
  fontWeight: option.font_weight,
  fontStyle: option.font_style,
  fontSize: option.font_size,
  textTransform: option.text_transform,
  letterSpacing: option.letter_spacing,
  lineHeight: option.line_height,
  defaultColor: option.default_color,
  enabled: option.enabled,
  sortOrder: option.sort_order,
})
const getEnabledWordArtOptions = (options: ApiEditorWordArtOption[] = []) => {
  return [...options]
    .filter(option => option.enabled !== false)
    .sort((left, right) => left.sort_order - right.sort_order)
    .map(mapEditorWordArtOption)
}
const editorTextWordArtOptions = computed(() => getEnabledWordArtOptions(editor.value?.word_art?.text ?? []))
const editorNumberWordArtOptions = computed(() => getEnabledWordArtOptions(editor.value?.word_art?.numbers ?? []))
const usesFallbackWordArtOptions = computed(() => !editorTextWordArtOptions.value.length || !editorNumberWordArtOptions.value.length)
const loadedEditorFontKeys = new Set<string>()

const loadEditorWordArtFonts = async (options: DesignEditorWordArtOption[]) => {
  if (!import.meta.client || !('FontFace' in window) || !document.fonts) {
    return
  }

  await Promise.allSettled(
    options.flatMap((option) => {
      if (!option.fontFamily || !option.fontUrl) {
        return []
      }

      const key = `${option.fontFamily}:${option.fontUrl}:${option.fontWeight ?? 'normal'}:${option.fontStyle ?? 'normal'}`

      if (loadedEditorFontKeys.has(key)) {
        return []
      }

      loadedEditorFontKeys.add(key)
      const font = new FontFace(option.fontFamily, `url(${option.fontUrl})`, {
        weight: String(option.fontWeight ?? 'normal'),
        style: option.fontStyle ?? 'normal',
      })

      return font.load().then((loadedFont) => {
        document.fonts.add(loadedFont)
      })
    }),
  )
}

const uploadArtworksQuery = reactive<StorefrontUploadArtworkListQuery>({
  scope: 'user',
  page: 1,
  per_page: 24,
})
const uploadArtworksResponse = ref<StorefrontUploadArtworkListResponse>({ data: [] })
const uploadArtworksPending = ref(false)
const uploadArtworksError = ref<StorefrontFetchError | null>(null)
const uploadArtworkErrorMessage = ref<string | null>(null)
const platformArtworkCategoriesResponse = ref<StorefrontUploadArtworkCategoryListResponse>({ data: [] })
const platformArtworksResponse = ref<StorefrontUploadArtworkListResponse>({ data: [] })
const platformArtworkCategoriesPending = ref(false)
const platformArtworksPending = ref(false)
const platformArtworkCategoriesError = ref<StorefrontFetchError | null>(null)
const platformArtworksError = ref<StorefrontFetchError | null>(null)
const platformArtworkCategoriesQuery = reactive({
  scope: 'platform' as const,
})
const platformArtworksQuery = reactive<StorefrontUploadArtworkListQuery>({
  scope: 'platform',
  page: 1,
  per_page: 24,
  category: undefined,
})
const mapArtworkToUploadAsset = (artwork: StorefrontUploadArtwork): DesignEditorUploadAsset => ({
  id: String(artwork.id),
  name: artwork.name || artwork.original_name || artwork.filename,
  src: artwork.url,
  status: 'ready',
  progress: 100,
  speedLabel: '',
  source: 'remote',
  canRemove: false,
  scope: artwork.scope,
  categoryLabel: artwork.category?.name ?? null,
  categorySlug: artwork.category?.slug ?? null,
  uploadedAt: artwork.uploaded_at,
})
const mapUploadAssetToHistoryAsset = (asset: DesignEditorUploadAsset): DesignEditorAsset => ({
  id: asset.id,
  name: asset.name,
  src: asset.src,
  category: asset.categorySlug ?? 'uploads',
})
const mapArtworkCategoryToAssetCategory = (category: { name: string, slug: string }): DesignEditorAssetCategory => ({
  label: category.name,
  value: category.slug,
})
const mapPlatformArtworkToAsset = (artwork: StorefrontUploadArtwork): DesignEditorAsset => ({
  id: `platform-${artwork.id}`,
  name: artwork.name || artwork.original_name || artwork.filename,
  src: artwork.url,
  category: artwork.category?.slug ?? '',
})
const remoteUploadedAssets = computed(() => (uploadArtworksResponse.value?.data ?? []).map(mapArtworkToUploadAsset))
const uploadedAssets = computed<DesignEditorUploadAsset[]>(() => {
  const seen = new Set<string>()

  return [...localUploadedAssets.value, ...remoteUploadedAssets.value].filter((asset) => {
    if (seen.has(asset.id)) {
      return false
    }

    seen.add(asset.id)
    return true
  })
})
const uploadHistoryAssets = computed<DesignEditorAsset[]>(() => {
  return uploadedAssets.value
    .filter(asset => asset.status === 'ready')
    .map(mapUploadAssetToHistoryAsset)
})
const platformAssetCategories = computed<DesignEditorAssetCategory[]>(() => {
  return (platformArtworkCategoriesResponse.value?.data ?? []).map(mapArtworkCategoryToAssetCategory)
})
const platformAssets = computed<DesignEditorAsset[]>(() => {
  return (platformArtworksResponse.value?.data ?? []).map(mapPlatformArtworkToAsset)
})
const combinedUploadErrorMessage = computed(() => uploadArtworkErrorMessage.value ?? uploadArtworksError.value?.data?.message ?? null)
const combinedPlatformArtworkErrorMessage = computed(() => {
  return platformArtworksError.value?.data?.message
    ?? platformArtworkCategoriesError.value?.data?.message
    ?? null
})
const hasDesignContent = computed(() => {
  return Object.values(designObjectsByView.value).some(objects => objects.length > 0)
})
const designDraftPayload = computed(() => {
  if (!product.value || !selectedColorId.value) {
    return null
  }

  // Only require a technique when the product actually defines selectable techniques
  if (editor.value?.techniques.length && !selectedTechniqueId.value) {
    return null
  }

  return buildDesignDraftUpsertPayload({
    product: product.value,
    selectedColorId: selectedColorId.value,
    selectedTechniqueId: selectedTechniqueId.value,
    designObjectsByView: designObjectsByView.value,
  })
})
const selectedColor = computed(() => {
  return availableColors.value.find(color => color.id === selectedColorId.value) ?? null
})
const selectedTechnique = computed(() => {
  return editor.value?.techniques.find(technique => technique.id === selectedTechniqueId.value) ?? null
})
const createAnotherDesignHref = '/fashion/all?pageNum=1'

const stageConfig = computed(() => ({
  width: Math.max(Math.round(workspaceWidth.value || 720), 320),
  height: Math.max(Math.round(workspaceHeight.value || 560), 360),
}))
const zoomScaleBounds = computed(() => {
  return {
    min: 0.5,
    max: 2,
  }
})
const zoomPercentage = computed(() => Math.round(zoomScaleFactor.value * 100))
const canZoomIn = computed(() => zoomScaleFactor.value < zoomScaleBounds.value.max)
const canZoomOut = computed(() => zoomScaleFactor.value > zoomScaleBounds.value.min)

const clampZoomScale = (value: number) => {
  return Math.min(Math.max(value, zoomScaleBounds.value.min), zoomScaleBounds.value.max)
}

const zoomCanvasIn = () => {
  zoomScaleFactor.value = clampZoomScale(Number((zoomScaleFactor.value + 0.1).toFixed(2)))
}

const zoomCanvasOut = () => {
  zoomScaleFactor.value = clampZoomScale(Number((zoomScaleFactor.value - 0.1).toFixed(2)))
}

const zoomCanvasToMax = () => {
  zoomScaleFactor.value = zoomScaleBounds.value.max
}

watch(zoomScaleBounds, (bounds) => {
  zoomScaleFactor.value = clampZoomScale(zoomScaleFactor.value || 1)

  if (!Number.isFinite(bounds.max) || bounds.max <= 0) {
    zoomScaleFactor.value = 1
  }
}, { immediate: true })

const clearPostSaveFeedbackTimers = () => {
  if (toastTimer.value) {
    clearTimeout(toastTimer.value)
    toastTimer.value = null
  }

  if (successDialogTimer.value) {
    clearTimeout(successDialogTimer.value)
    successDialogTimer.value = null
  }
}

const showSaveSuccessFeedback = (message = 'Design saved successfully.') => {
  if (!import.meta.client) {
    return
  }

  clearPostSaveFeedbackTimers()
  saveSuccessToastMessage.value = message
  saveSuccessToastVisible.value = true
  saveSuccessDialogVisible.value = false

  successDialogTimer.value = window.setTimeout(() => {
    saveSuccessDialogVisible.value = true
  }, 480)

  toastTimer.value = window.setTimeout(() => {
    saveSuccessToastVisible.value = false
  }, 2600)
}

const dismissSaveSuccessDialog = () => {
  saveSuccessDialogVisible.value = false
}

const parsePriceLabel = (value?: string | null) => {
  const numericValue = Number.parseFloat(String(value ?? '').replace(/[^0-9.]+/g, ''))
  return Number.isFinite(numericValue) ? numericValue : 0
}

const exportDesignPreviewImage = () => {
  const stage = stageRef.value?.getNode()

  if (!stage?.toDataURL) {
    return activeMockup.value?.src ?? null
  }

  try {
    return stage.toDataURL({
      mimeType: 'image/jpeg',
      quality: 0.86,
      pixelRatio: 0.75,
    })
  } catch {
    return activeMockup.value?.src ?? null
  }
}

const dataUrlToBlob = async (dataUrl: string) => {
  const response = await fetch(dataUrl)
  return response.blob()
}

const canvasToBlob = (canvas: HTMLCanvasElement, mimeType = 'image/png', quality?: number) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }

      reject(new Error('Could not export the production file.'))
    }, mimeType, quality)
  })
}

const loadCanvasImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load artwork for production export.'))
    image.src = src
  })
}

const getProductionPlacement = (view: EditorProductView) => {
  const printArea = view.printArea as EditorProductView['printArea'] & {
    placement_id?: string | null
  }

  return printArea.placement ?? printArea.placementId ?? printArea.placement_id ?? ''
}

const getProductionPrintfile = (view: EditorProductView) => {
  const printArea = view.printArea as EditorProductView['printArea'] & {
    printfile?: {
      width?: number
      height?: number
      dpi?: number | null
    } | null
    printfile_width?: number | null
    printfile_height?: number | null
    dpi?: number | null
  }
  const printfile = printArea.printfile
  const width = printfile?.width ?? printArea.printfile_width
  const height = printfile?.height ?? printArea.printfile_height

  if (!width || !height) {
    return null
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
    dpi: printfile?.dpi ?? printArea.dpi ?? null,
  }
}

const renderTextObjectToProductionCanvas = (
  context: CanvasRenderingContext2D,
  object: DesignDraftCanvasObject,
  scaleX: number,
  scaleY: number,
) => {
  const fontSize = Math.max(1, Math.round((object.fontSize ?? 28) * scaleY))
  const fontStyle = object.fontStyle ?? 'normal'
  const fontFamily = object.fontFamily ?? 'Arial'
  const text = object.text ?? ''
  const x = object.x * scaleX
  const y = object.y * scaleY
  const width = object.width * scaleX
  const height = object.height * scaleY

  context.save()
  context.translate(x, y)
  context.rotate((object.rotation * Math.PI) / 180)
  context.fillStyle = object.fill ?? '#111314'
  context.font = `${fontStyle} ${fontSize}px ${fontFamily}`
  context.textBaseline = 'middle'
  context.textAlign = 'center'
  context.fillText(text, width / 2, height / 2, width)
  context.restore()
}

const renderImageObjectToProductionCanvas = async (
  context: CanvasRenderingContext2D,
  object: DesignDraftCanvasObject,
  scaleX: number,
  scaleY: number,
) => {
  if (!object.src) {
    return
  }

  const image = await loadCanvasImage(object.src)
  const x = object.x * scaleX
  const y = object.y * scaleY
  const width = object.width * scaleX
  const height = object.height * scaleY

  context.save()
  context.translate(x + width / 2, y + height / 2)
  context.rotate((object.rotation * Math.PI) / 180)
  context.drawImage(image, -width / 2, -height / 2, width, height)
  context.restore()
}

const renderProductionCanvasForView = async (view: EditorProductView) => {
  const objects = designObjectsByView.value[view.id] ?? []
  const printfile = getProductionPrintfile(view)
  const area = view.printArea

  if (!objects.length || !printfile) {
    return null
  }

  const scaleX = printfile.width / area.width
  const scaleY = printfile.height / area.height
  const normalizedObjects = objects.map(object => ({
    ...object,
    x: object.x - area.x,
    y: object.y - area.y,
  }))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Could not prepare the production canvas.')
  }

  canvas.width = printfile.width
  canvas.height = printfile.height

  for (const object of normalizedObjects) {
    if (object.type === 'image') {
      await renderImageObjectToProductionCanvas(context, object, scaleX, scaleY)
      continue
    }

    renderTextObjectToProductionCanvas(context, object, scaleX, scaleY)
  }

  return canvas
}

const buildProductionFilePosition = (width: number, height: number) => ({
  area_width: width,
  area_height: height,
  width,
  height,
  top: 0,
  left: 0,
  limit_to_print_area: true,
})

const getProductionTechnique = (view: EditorProductView): string => {
  return view.supportedTechniques?.[0] ?? selectedTechniqueId.value
}

const uploadPreviewFile = async (basePayload = designDraftPayload.value): Promise<DesignDraftPreviewFile | null> => {
  if (!product.value || !basePayload) {
    return null
  }

  const previewDataUrl = exportDesignPreviewImage()

  if (!previewDataUrl?.startsWith('data:')) {
    return null
  }

  const blob = await dataUrlToBlob(previewDataUrl)
  const response = await uploadDesignProductionFile({
    file: blob,
    filename: `${product.value.slug}-preview.jpg`,
    kind: 'preview',
    productHandle: basePayload.product_handle,
    designId: activeDesignDraftId.value,
  })

  return {
    url: response.data.url,
    mime_type: response.data.mime_type,
    width: response.data.width,
    height: response.data.height,
  }
}

const uploadProductionFiles = async (basePayload = designDraftPayload.value): Promise<DesignDraftProductionFile[]> => {
  if (!import.meta.client || !product.value || !basePayload) {
    return []
  }

  // Use the payload's view list as the source of truth — it already reflects
  // exactly which views have artwork at the moment the draft was built.
  const payloadViewIds = new Set(basePayload.editor_payload.views.map(v => v.view_id))
  const decoratedViews = availableViews.value.filter(view => payloadViewIds.has(view.id))

  const files: DesignDraftProductionFile[] = []

  for (const view of decoratedViews) {
    const placement = getProductionPlacement(view)
    const printfile = getProductionPrintfile(view)

    if (!placement) {
      throw new Error(`Missing Printful placement for view "${view.label}".`)
    }

    if (!printfile) {
      throw new Error(`Missing printfile dimensions for view "${view.label}". Check that the product editor returns printfile width/height for this placement.`)
    }

    const canvas = await renderProductionCanvasForView(view)

    if (!canvas) {
      throw new Error(`Could not render production canvas for view "${view.label}".`)
    }

    const blob = await canvasToBlob(canvas)
    const response = await uploadDesignProductionFile({
      file: blob,
      filename: `${product.value.slug}-${placement}.png`,
      kind: 'production',
      productHandle: basePayload.product_handle,
      viewId: view.id,
      placement,
      designId: activeDesignDraftId.value,
    })

    files.push({
      view_id: view.id,
      placement,
      technique: getProductionTechnique(view),
      url: response.data.url,
      mime_type: response.data.mime_type,
      width: response.data.width || printfile.width,
      height: response.data.height || printfile.height,
      dpi: printfile.dpi,
      position: buildProductionFilePosition(printfile.width, printfile.height),
    })
  }

  return files
}

const fetchProductDetailForCartType = async (type: ProductType) => {
  const query = lookupBy.value === 'sku' ? { by: 'sku' as const } : {}
  const response = await $storefront<{ data: ProductDetail }>(`/products/${type}/${productIdentifier.value}`, {
    query,
  })

  return response.data
}

const ensureCartProductDetail = async () => {
  if (cartProductDetail.value || cartProductDetailPending.value) {
    return cartProductDetail.value
  }

  cartProductDetailPending.value = true

  try {
    if (productType.value) {
      cartProductDetail.value = await fetchProductDetailForCartType(productType.value)
      return cartProductDetail.value
    }

    try {
      cartProductDetail.value = await fetchProductDetailForCartType('fashion')
      return cartProductDetail.value
    } catch (fashionError) {
      const storefrontError = fashionError as StorefrontFetchError

      if (storefrontError?.data?.statusCode && storefrontError.data.statusCode !== 404) {
        throw fashionError
      }
    }

    cartProductDetail.value = await fetchProductDetailForCartType('accessories')
    return cartProductDetail.value
  } finally {
    cartProductDetailPending.value = false
  }
}

const buildCartSizeAllocations = () => {
  const sizes = (cartProductDetail.value?.options?.sizes ?? [])
    .filter(size => size.is_available !== false)
    .map<ProductDetailSelectableOption>(size => ({
      id: size.value,
      label: size.label,
      selected: size.is_selected,
    }))

  if (!sizes.length && cartProductDetail.value?.sizes?.length) {
    sizes.push(
      ...cartProductDetail.value.sizes.map(size => ({
        id: size.id,
        label: size.label,
        selected: size.selected,
      })),
    )
  }

  if (!sizes.length) {
    return [{
      id: 'default',
      label: 'One Size',
      quantity: 1,
    }]
  }

  const selectedSizeId = sizes.find(size => size.id === querySizeId.value)?.id
    ?? sizes.find(size => size.selected)?.id
    ?? sizes[0]?.id

  return sizes.map(size => ({
    id: size.id,
    label: size.label,
    quantity: size.id === selectedSizeId ? 1 : 0,
  }))
}

const buildDesignCartItem = (): DesignCartItem | null => {
  if (!product.value || !activeDesignDraftId.value) {
    return null
  }

  const decoratedViews = availableViews.value.filter((view) => {
    return (designObjectsByView.value[view.id] ?? []).length > 0
  })

  if (!decoratedViews.length) {
    return null
  }

  // productPrice = base for selected technique (dollars). Falls back to product default.
  // customizationPrice = sum of extra placement costs in dollars (0 = included).
  const productPrice = product.value.techniquePrices?.[selectedTechniqueId.value]
    ?? product.value.priceValue
  const customizationPrice = decoratedViews
    .reduce((sum, view) => sum + (view.printArea.priceValue ?? 0), 0)
  const totalPrice = productPrice + customizationPrice
  const now = new Date().toISOString()

  return {
    id: createCartItemId(),
    source: 'design',
    designId: activeDesignDraftId.value,
    productId: product.value.id,
    variantId: cartProductDetail.value?.variants.find(variant => variant.colorId === selectedColorId.value)?.id ?? null,
    productHandle: product.value.slug,
    productType: productType.value ?? null,
    productName: product.value.name,
    productSku: product.value.sku,
    designName: product.value.name,
    colorId: selectedColorId.value,
    colorName: selectedColor.value?.label ?? null,
    techniqueId: selectedTechniqueId.value,
    techniqueName: selectedTechnique.value?.name ?? selectedTechnique.value?.label ?? null,
    previewImage: latestSavedDesignPreviewImage.value ?? exportDesignPreviewImage(),
    placementLabels: decoratedViews.map(view => view.label),
    artworkCount: Object.values(designObjectsByView.value).reduce((total, objects) => total + objects.length, 0),
    sizes: buildCartSizeAllocations(),
    quantity: 1,
    summary: {
      productPrice,
      customizationPrice,
      totalPrice,
      productPriceLabel: currencyFormatter.format(productPrice),
      customizationPriceLabel: currencyFormatter.format(customizationPrice),
      totalPriceLabel: currencyFormatter.format(totalPrice),
    },
    addedAt: now,
    updatedAt: now,
  }
}

const imageLayout = computed(() => {
  const mockup = activeMockup.value
  const naturalWidth = mockup?.width ?? canvasImage.value?.width
  const naturalHeight = mockup?.height ?? canvasImage.value?.height
  const { width, height } = stageConfig.value

  if (!naturalWidth || !naturalHeight) {
    return {
      x: width / 2 - 120,
      y: height / 2 - 150,
      width: 240,
      height: 300,
    }
  }

  const maxWidth = width * 0.72
  const maxHeight = height * 0.84
  const baseScale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight)
  const scale = baseScale * zoomScaleFactor.value
  const scaledWidth = naturalWidth * scale
  const scaledHeight = naturalHeight * scale

  return {
    x: (width - scaledWidth) / 2,
    y: (height - scaledHeight) / 2,
    width: scaledWidth,
    height: scaledHeight,
  }
})

const mockupImageConfig = computed(() => ({
  ...imageLayout.value,
  image: canvasImage.value ?? undefined,
  name: 'product-mockup',
  listening: false,
}))

const canvasScale = computed(() => {
  const mockup = activeMockup.value

  if (!mockup?.width || !mockup?.height) {
    return {
      x: 1,
      y: 1,
    }
  }

  return {
    x: imageLayout.value.width / mockup.width,
    y: imageLayout.value.height / mockup.height,
  }
})

const printAreaConfig = computed(() => {
  const area = activePrintArea.value

  if (!area || area.width <= 0 || area.height <= 0) {
    return null
  }

  return {
    x: imageLayout.value.x + area.x * canvasScale.value.x,
    y: imageLayout.value.y + area.y * canvasScale.value.y,
    width: area.width * canvasScale.value.x,
    height: area.height * canvasScale.value.y,
    rotation: area.rotation,
    name: 'print-area',
    stroke: '#a9afb8',
    dash: [8, 6],
    strokeWidth: 2,
    cornerRadius: 2,
    listening: false,
  }
})

const clampPlacementToPrintArea = (placement: DesignPlacement, area = activePrintArea.value) => {
  if (!area) {
    return placement
  }

  const maxX = area.x + Math.max(area.width - placement.width, 0)
  const maxY = area.y + Math.max(area.height - placement.height, 0)

  return {
    ...placement,
    x: Math.min(Math.max(placement.x, area.x), maxX),
    y: Math.min(Math.max(placement.y, area.y), maxY),
  }
}

const createPlacementForPrintArea = (image: { width: number, height: number }, area = activePrintArea.value) => {
  if (!area || area.width <= 0 || area.height <= 0 || !image) {
    return null
  }

  const maxWidth = area.width * 0.82
  const maxHeight = area.height * 0.82
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height)
  const width = image.width * scale
  const height = image.height * scale

  return clampPlacementToPrintArea({
    x: area.x + (area.width - width) / 2,
    y: area.y + (area.height - height) / 2,
    width,
    height,
    rotation: 0,
  }, area)
}

const getTextArtStyle = (option: DesignEditorWordArtOption): DesignTextStyle => {
  const fontSizeMatch = option.className.match(/text-\[(\d+)px\]/)
  const trackingMatch = option.className.match(/tracking-\[(\d*\.?\d+)em\]/)
  const fontSize = option.fontSize ?? (fontSizeMatch ? Number.parseInt(fontSizeMatch[1] ?? '', 10) : 28)
  const fontWeight = option.className.includes('font-black') || option.className.includes('font-bold')
    ? 'bold'
    : option.className.includes('font-semibold')
      ? '600'
      : option.className.includes('font-medium')
        ? '500'
        : 'normal'
  const fontSlant = option.className.includes('italic') ? 'italic' : ''
  const fontStyle = [fontSlant, fontWeight].filter(Boolean).join(' ')

  return {
    fontFamily: option.fontFamily ?? (option.className.includes('font-mono') ? 'NewGroteskMono' : 'NewGrotesk'),
    fontSize,
    fontStyle: [option.fontStyle === 'italic' ? 'italic' : '', option.fontWeight ?? fontWeight].filter(Boolean).join(' '),
    letterSpacing: option.letterSpacing ?? (trackingMatch ? fontSize * Number.parseFloat(trackingMatch[1] ?? '0') : 0),
    textTransform: option.textTransform ?? (option.className.includes('uppercase')
      ? 'uppercase'
      : option.className.includes('lowercase')
        ? 'lowercase'
        : null),
  }
}

const transformDesignText = (text: string, transform?: DesignTextStyle['textTransform']) => {
  if (transform === 'uppercase') {
    return text.toUpperCase()
  }

  if (transform === 'lowercase') {
    return text.toLowerCase()
  }

  return text
}

const createPlacementForTextArt = (selection: DesignTextArtSelection, style: DesignTextStyle, area = activePrintArea.value) => {
  if (!area || area.width <= 0 || area.height <= 0) {
    return null
  }

  const displayText = transformDesignText(selection.text, style.textTransform)
  const estimatedWidth = Math.max(
    80,
    displayText.length * (style.fontSize * 0.62 + style.letterSpacing) + 32,
  )
  const width = Math.min(estimatedWidth, area.width * 0.82)
  const height = Math.min(Math.max(style.fontSize * 1.45, 40), area.height * 0.82)

  return clampPlacementToPrintArea({
    x: area.x + (area.width - width) / 2,
    y: area.y + (area.height - height) / 2,
    width,
    height,
    rotation: 0,
  }, area)
}

const setDesignObjectsForView = (viewId: string, objects: DesignDraftCanvasObject[]) => {
  designObjectsByView.value = {
    ...designObjectsByView.value,
    [viewId]: objects,
  }
}

const updateDesignObject = (
  viewId: string,
  objectId: string,
  updater: (object: DesignDraftCanvasObject) => DesignDraftCanvasObject,
) => {
  const objects = designObjectsByView.value[viewId] ?? []
  let hasUpdated = false
  const nextObjects = objects.map((object) => {
    if (object.id !== objectId) {
      return object
    }

    hasUpdated = true
    return updater(object)
  })

  if (!hasUpdated) {
    return
  }

  setDesignObjectsForView(viewId, nextObjects)
}

const syncDesignPlacementFromStage = (
  objectId: string,
  stageX: number,
  stageY: number,
) => {
  if (!activeViewId.value) {
    return
  }

  updateDesignObject(activeViewId.value, objectId, object => clampPlacementToPrintArea({
    ...object,
    x: (stageX - imageLayout.value.x) / canvasScale.value.x,
    y: (stageY - imageLayout.value.y) / canvasScale.value.y,
  }))
}

const handleDesignDragMove = (
  objectId: string,
  event: { target: { x: () => number, y: () => number } },
) => {
  syncDesignPlacementFromStage(objectId, event.target.x(), event.target.y())
}

const activeDesignImageConfigs = computed(() => {
  return activeDesignObjects.value.flatMap((object) => {
    if (object.type !== 'image' || !object.src) {
      return []
    }

    const image = artworkImageElements.value[object.assetId]

    if (!image) {
      return []
    }

    return [{
      id: object.id,
      config: {
        id: object.id,
        x: imageLayout.value.x + object.x * canvasScale.value.x,
        y: imageLayout.value.y + object.y * canvasScale.value.y,
        width: object.width * canvasScale.value.x,
        height: object.height * canvasScale.value.y,
        rotation: object.rotation,
        image,
        name: 'design-image',
        draggable: true,
        dragBoundFunc: (pos: { x: number, y: number }) => {
          const nextPlacement = clampPlacementToPrintArea({
            ...object,
            x: (pos.x - imageLayout.value.x) / canvasScale.value.x,
            y: (pos.y - imageLayout.value.y) / canvasScale.value.y,
          })

          return {
            x: imageLayout.value.x + nextPlacement.x * canvasScale.value.x,
            y: imageLayout.value.y + nextPlacement.y * canvasScale.value.y,
          }
        },
      },
    }]
  })
})

const activeDesignTextConfigs = computed(() => {
  return activeDesignObjects.value.flatMap((object) => {
    if (object.type !== 'text' || !object.text) {
      return []
    }

    return [{
      id: object.id,
      config: {
        id: object.id,
        x: imageLayout.value.x + object.x * canvasScale.value.x,
        y: imageLayout.value.y + object.y * canvasScale.value.y,
        width: object.width * canvasScale.value.x,
        height: object.height * canvasScale.value.y,
        rotation: object.rotation,
        text: transformDesignText(object.text, object.textTransform),
        fill: object.fill ?? '#c53232',
        fontFamily: object.fontFamily ?? 'NewGrotesk',
        fontSize: (object.fontSize ?? 28) * canvasScale.value.y,
        fontStyle: object.fontStyle ?? 'normal',
        letterSpacing: (object.letterSpacing ?? 0) * canvasScale.value.x,
        align: 'center',
        verticalAlign: 'middle',
        name: 'design-text',
        draggable: true,
        dragBoundFunc: (pos: { x: number, y: number }) => {
          const nextPlacement = clampPlacementToPrintArea({
            ...object,
            x: (pos.x - imageLayout.value.x) / canvasScale.value.x,
            y: (pos.y - imageLayout.value.y) / canvasScale.value.y,
          })

          return {
            x: imageLayout.value.x + nextPlacement.x * canvasScale.value.x,
            y: imageLayout.value.y + nextPlacement.y * canvasScale.value.y,
          }
        },
      },
    }]
  })
})

const transformerConfig = computed(() => {
  if (!activeDesignObject.value || !printAreaConfig.value) {
    return null
  }

  const minWidth = Math.max(24 * canvasScale.value.x, 12)
  const minHeight = Math.max(24 * canvasScale.value.y, 12)
  const areaBounds = {
    x: printAreaConfig.value.x,
    y: printAreaConfig.value.y,
    width: printAreaConfig.value.width,
    height: printAreaConfig.value.height,
  }

  return {
    rotateEnabled: false,
    enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'],
    keepRatio: false,
    borderStroke: '#111314',
    borderStrokeWidth: 1.5,
    anchorSize: 10,
    anchorFill: '#ffffff',
    anchorStroke: '#111314',
    anchorStrokeWidth: 1.5,
    boundBoxFunc: (_oldBox: { x: number, y: number, width: number, height: number }, newBox: { x: number, y: number, width: number, height: number }) => {
      const nextRight = newBox.x + newBox.width
      const nextBottom = newBox.y + newBox.height

      if (newBox.width < minWidth || newBox.height < minHeight) {
        return _oldBox
      }

      if (
        newBox.x < areaBounds.x
        || newBox.y < areaBounds.y
        || nextRight > areaBounds.x + areaBounds.width
        || nextBottom > areaBounds.y + areaBounds.height
      ) {
        return _oldBox
      }

      return newBox
    },
  }
})

const deleteControlConfig = computed(() => {
  if (!activeDesignObject.value) {
    return null
  }

  const size = 24
  const radius = size / 2
  const stageX = imageLayout.value.x + activeDesignObject.value.x * canvasScale.value.x
  const stageY = imageLayout.value.y + activeDesignObject.value.y * canvasScale.value.y
  const stageWidth = activeDesignObject.value.width * canvasScale.value.x

  return {
    group: {
      x: stageX + stageWidth - radius - 8,
      y: stageY + radius + 8,
      name: 'delete-control',
    },
    circle: {
      x: 0,
      y: 0,
      radius,
      fill: '#ffffff',
      stroke: '#111314',
      strokeWidth: 1.5,
      shadowColor: 'rgba(17, 19, 20, 0.18)',
      shadowBlur: 10,
      shadowOffsetY: 2,
      name: 'delete-control',
    },
    text: {
      x: -radius,
      y: -radius + 1,
      width: size,
      height: size,
      text: '×',
      fontSize: 18,
      fontStyle: '700',
      fontFamily: 'sans-serif',
      fill: '#111314',
      align: 'center',
      verticalAlign: 'middle',
      listening: false,
    },
  }
})

const designImageMetrics = computed(() => {
  if (!activeDesignObject.value) {
    return {
      width: 0,
      height: 0,
      rotation: 0,
      scale: 0,
    }
  }

  return {
    width: Math.round(activeDesignObject.value.width),
    height: Math.round(activeDesignObject.value.height),
    rotation: Number(activeDesignObject.value.rotation.toFixed(1)),
    scale: Number(((activeDesignObject.value.width / activeDesignObject.value.naturalWidth) * 100).toFixed(2)),
  }
})
const activeTextObject = computed(() => {
  return activeDesignObject.value?.type === 'text' ? activeDesignObject.value : null
})
const activeTextFontSize = computed(() => Math.round(activeTextObject.value?.fontSize ?? 0))
const activeTextColor = computed(() => activeTextObject.value?.fill ?? '#c53232')

const updateActiveTextFontSize = (value: number | undefined) => {
  const object = activeTextObject.value
  const viewId = activeViewId.value

  if (!object || !viewId || typeof value !== 'number' || !Number.isFinite(value)) {
    return
  }

  const nextFontSize = Math.min(Math.max(value, 8), 220)
  const nextHeight = Math.max(object.height, nextFontSize * 1.45)

  updateDesignObject(viewId, object.id, current => clampPlacementToPrintArea({
    ...current,
    fontSize: nextFontSize,
    height: nextHeight,
  }))
}

const updateActiveTextColor = (value: string | null) => {
  const object = activeTextObject.value
  const viewId = activeViewId.value

  if (!object || !viewId || !value) {
    return
  }

  updateDesignObject(viewId, object.id, current => ({
    ...current,
    fill: value,
  }))
}

const setDesignImageNodeRef = (objectId: string) => {
  return (node: { getNode: () => any } | null) => {
    if (node) {
      designImageNodeRefs.set(objectId, node)
      return
    }

    designImageNodeRefs.delete(objectId)
  }
}

const syncTransformer = async () => {
  await nextTick()

  const transformerNode = transformerRef.value?.getNode()
  const imageNode = activeDesignObjectId.value
    ? designImageNodeRefs.get(activeDesignObjectId.value)?.getNode()
    : null

  if (!transformerNode) {
    return
  }

  transformerNode.nodes(imageNode ? [imageNode] : [])
  transformerNode.getLayer()?.batchDraw()
  stageRef.value?.getNode().batchDraw()
}

const setActiveTool = (toolId: EditorToolId) => {
  activeTool.value = toolId
}

const selectView = (viewId: string) => {
  activeViewId.value = viewId
  activeDesignObjectId.value = null
}

const selectColor = (colorId: string) => {
  selectedColorId.value = colorId
}

const selectDesignObject = (objectId: string) => {
  activeDesignObjectId.value = objectId
}

const removeDesignObject = (objectId: string) => {
  if (!activeViewId.value) {
    return
  }

  const currentObjects = designObjectsByView.value[activeViewId.value] ?? []
  const nextObjects = currentObjects.filter(object => object.id !== objectId)

  setDesignObjectsForView(activeViewId.value, nextObjects)

  if (activeDesignObjectId.value === objectId) {
    activeDesignObjectId.value = null
  }
}

const handleStagePointerDown = (event: { target: any }) => {
  const target = event.target

  if (target?.name?.() === 'delete-control') {
    return
  }

  if (target?.name?.() === 'design-image' || target?.name?.() === 'design-text') {
    const objectId = target?.id?.() || target?.attrs?.id

    if (objectId) {
      selectDesignObject(String(objectId))
    }

    return
  }

  if (target?.getParent?.()?.getClassName?.() === 'Transformer') {
    return
  }

  activeDesignObjectId.value = null
}

const syncPlacementFromNodeTransform = (objectId: string) => {
  const node = designImageNodeRefs.get(objectId)?.getNode()
  const object = activeDesignObjects.value.find(item => item.id === objectId)

  if (!node || !object || !activeViewId.value) {
    return
  }

  const width = (node.width() * node.scaleX()) / canvasScale.value.x
  const height = (node.height() * node.scaleY()) / canvasScale.value.y
  const transformedScaleY = node.scaleY()
  const nextPlacement = clampPlacementToPrintArea({
    ...object,
    x: (node.x() - imageLayout.value.x) / canvasScale.value.x,
    y: (node.y() - imageLayout.value.y) / canvasScale.value.y,
    width,
    height,
    rotation: node.rotation(),
    fontSize: object.type === 'text'
      ? Math.max(8, (object.fontSize ?? 28) * transformedScaleY)
      : object.fontSize,
  })

  node.scaleX(1)
  node.scaleY(1)
  updateDesignObject(activeViewId.value, objectId, () => nextPlacement)
}

const handleDesignTransform = (objectId: string) => {
  syncPlacementFromNodeTransform(objectId)
}

const openImageManagement = (tab: DesignEditorDialogTab) => {
  imageManagementInitialTab.value = tab
  imageManagementVisible.value = true
}

const loadUploadArtworks = async (force = false) => {
  if (uploadArtworksPending.value) {
    return
  }

  if (hasLoadedUploadArtworks.value && !uploadArtworksError.value && !force) {
    return
  }

  hasLoadedUploadArtworks.value = true

  uploadArtworksPending.value = true
  uploadArtworksError.value = null

  try {
    uploadArtworksResponse.value = await $storefront<StorefrontUploadArtworkListResponse>('/uploads/artworks', {
      query: uploadArtworksQuery,
    })
  } catch (error) {
    uploadArtworksError.value = error as StorefrontFetchError
    uploadArtworksResponse.value = { data: [] }
  } finally {
    uploadArtworksPending.value = false
  }
}

const loadPlatformArtworkCategories = async (force = false) => {
  if (platformArtworkCategoriesPending.value) {
    return
  }

  if (hasLoadedPlatformArtworkCategories.value && !platformArtworkCategoriesError.value && !force) {
    return
  }

  hasLoadedPlatformArtworkCategories.value = true
  platformArtworkCategoriesPending.value = true
  platformArtworkCategoriesError.value = null

  try {
    platformArtworkCategoriesResponse.value = await $storefront<StorefrontUploadArtworkCategoryListResponse>('/uploads/artworks/categories', {
      query: platformArtworkCategoriesQuery,
    })
  } catch (error) {
    platformArtworkCategoriesError.value = error as StorefrontFetchError
    platformArtworkCategoriesResponse.value = { data: [] }
  } finally {
    platformArtworkCategoriesPending.value = false
  }
}

const loadPlatformArtworks = async (force = false) => {
  if (platformArtworksPending.value) {
    return
  }

  const requestedCategory = selectedPlatformCategory.value || ''
  const alreadyLoadedSameCategory = hasLoadedPlatformArtworks.value
    && !platformArtworksError.value
    && (platformArtworksQuery.category ?? '') === requestedCategory

  if (alreadyLoadedSameCategory && !force) {
    return
  }

  hasLoadedPlatformArtworks.value = true
  platformArtworksPending.value = true
  platformArtworksError.value = null
  platformArtworksQuery.category = requestedCategory || undefined

  try {
    platformArtworksResponse.value = await $storefront<StorefrontUploadArtworkListResponse>('/uploads/artworks', {
      query: platformArtworksQuery,
    })
  } catch (error) {
    platformArtworksError.value = error as StorefrontFetchError
    platformArtworksResponse.value = { data: [] }
  } finally {
    platformArtworksPending.value = false
  }
}

const selectPlatformCategory = (categorySlug: string) => {
  selectedPlatformCategory.value = categorySlug
  void loadPlatformArtworks(true)
}

const retryPlatformArtworkCatalogLoad = () => {
  void loadPlatformArtworkCategories(true)
  void loadPlatformArtworks(true)
}

const createUploadId = () => `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
const createDesignObjectId = () => `design-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const clearUploadRequest = (id: string) => {
  const request = uploadRequests.get(id)

  if (request) {
    request.abort()
  }

  uploadRequests.delete(id)
}

const loadArtworkImage = (asset: Pick<DesignEditorUploadAsset, 'id' | 'src'>) => {
  const cachedImage = artworkImageElements.value[asset.id]

  if (cachedImage?.src === asset.src) {
    return Promise.resolve(cachedImage)
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (!import.meta.client) {
      reject(new Error('Artwork images can only be loaded in the browser.'))
      return
    }

    const image = new window.Image()
    image.onload = () => {
      artworkImageElements.value = {
        ...artworkImageElements.value,
        [asset.id]: image,
      }
      resolve(image)
    }
    image.onerror = () => {
      reject(new Error('Could not load the selected artwork.'))
    }
    image.src = asset.src
  })
}

const hydrateArtworkImages = async (objectsByView: Record<string, DesignDraftCanvasObject[]>) => {
  const objects = Object.values(objectsByView)
    .flat()
    .filter(object => object.type === 'image' && object.src)

  await Promise.allSettled(
    objects.map(object => loadArtworkImage({ id: object.assetId, src: object.src as string })),
  )
}

const addDesignAssetToActiveView = async (asset: Pick<DesignEditorAsset, 'id' | 'name' | 'src'>, options?: {
  uploadArtworkId?: string | number | null
}) => {
  const area = activePrintArea.value
  const viewId = activeViewId.value

  if (!area || !viewId) {
    return
  }

  const image = await loadArtworkImage(asset)
  const placement = createPlacementForPrintArea(image, area)

  if (!placement) {
    return
  }

  const nextObject: DesignDraftCanvasObject = {
    id: createDesignObjectId(),
    type: 'image',
    assetId: asset.id,
    wordArtId: null,
    uploadArtworkId: options?.uploadArtworkId ?? null,
    name: asset.name,
    viewId,
    src: asset.src,
    naturalWidth: image.width,
    naturalHeight: image.height,
    ...placement,
  }

  setDesignObjectsForView(viewId, [...(designObjectsByView.value[viewId] ?? []), nextObject])
  activeDesignObjectId.value = nextObject.id
}

const addDesignTextToActiveView = (selection: DesignTextArtSelection) => {
  const area = activePrintArea.value
  const viewId = activeViewId.value

  if (!area || !viewId) {
    return
  }

  const style = getTextArtStyle(selection.option)
  const placement = createPlacementForTextArt(selection, style, area)

  if (!placement) {
    return
  }

  const text = transformDesignText(selection.text, style.textTransform)
  const nextObject: DesignDraftCanvasObject = {
    id: createDesignObjectId(),
    type: 'text',
    assetId: selection.option.id,
    wordArtId: selection.option.id,
    uploadArtworkId: null,
    name: text,
    viewId,
    src: null,
    text,
    fill: selection.color,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontStyle: style.fontStyle,
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform,
    naturalWidth: placement.width,
    naturalHeight: placement.height,
    ...placement,
  }

  setDesignObjectsForView(viewId, [...(designObjectsByView.value[viewId] ?? []), nextObject])
  activeDesignObjectId.value = nextObject.id
}

const loadExistingDesignDraft = async (designId: string) => {
  if (!product.value || !designId || hydratedDraftDesignId.value === designId) {
    return
  }

  try {
    const response = await getDesignDraft(designId)
    const draft = response.data
    const hydratedObjects = hydrateDesignObjectsByView(draft.editor_payload)

    activeDesignDraftId.value = String(draft.id)
    hydratedDraftDesignId.value = designId
    selectedColorId.value = draft.editor_payload.color.id || selectedColorId.value
    selectedTechniqueId.value = draft.editor_payload.technique.id || selectedTechniqueId.value
    activeViewId.value = draft.editor_payload.views[0]?.view_id ?? activeViewId.value
    designObjectsByView.value = hydratedObjects
    latestSavedDesignPreviewImage.value = draft.preview_image ?? null
    await hydrateArtworkImages(hydratedObjects)
  } catch {
    hydratedDraftDesignId.value = null
  }
}

const addUploadedAssetToActiveView = async (assetId: string) => {
  const asset = uploadedAssets.value.find(item => item.id === assetId && item.status === 'ready')

  if (!asset) {
    return
  }

  await addDesignAssetToActiveView(asset, {
    uploadArtworkId: asset.id,
  })
}

const addPlatformAssetToActiveView = async (assetId: string) => {
  const asset = platformAssets.value.find(item => item.id === assetId)

  if (!asset) {
    return
  }

  await addDesignAssetToActiveView(asset)
}

const selectUploadedAsset = async (id: string) => {
  activeUploadedAssetId.value = id

  try {
    await addUploadedAssetToActiveView(id)
  } catch (error) {
    uploadArtworkErrorMessage.value = error instanceof Error
      ? error.message
      : 'Could not place the selected artwork.'
  }
}

const selectPlatformAsset = async (id: string) => {
  activePlatformAssetId.value = id

  try {
    await addPlatformAssetToActiveView(id)
  } catch (error) {
    uploadArtworkErrorMessage.value = error instanceof Error
      ? error.message
      : 'Could not place the selected artwork.'
  }
}

const saveDesignDraft = async () => {
  if (!designDraftPayload.value) {
    designSaveErrorMessage.value = 'The design is not ready to be saved yet.'
    designSaveSuccessMessage.value = null
    return
  }

  if (!designDraftPayload.value.editor_payload.views.length) {
    designSaveErrorMessage.value = 'Add at least one artwork to save this design.'
    designSaveSuccessMessage.value = null
    return
  }

  designSavePending.value = true
  designSaveErrorMessage.value = null
  designSaveSuccessMessage.value = null

  try {
    const productionFiles = await uploadProductionFiles(designDraftPayload.value)
    const previewFile = await uploadPreviewFile(designDraftPayload.value)
    const payload = attachDesignProductionFiles(designDraftPayload.value, {
      productionFiles,
      previewFile,
    })

    const response = activeDesignDraftId.value
      ? await updateDesignDraft(activeDesignDraftId.value, payload)
      : await createDesignDraft(payload)

    activeDesignDraftId.value = String(response.data.id)
    latestSavedDesignPreviewImage.value = response.data.preview_image ?? exportDesignPreviewImage()
    designSaveSuccessMessage.value = 'Design saved.'
    savedDraftsRefreshKey.value += 1
    showSaveSuccessFeedback()
  } catch (error) {
    const storefrontError = error as StorefrontFetchError
    designSaveErrorMessage.value = storefrontError?.data?.message
      || (error instanceof Error ? error.message : null)
      || 'Could not save the design.'
  } finally {
    designSavePending.value = false
  }
}

const addSavedDesignToCart = async () => {
  try {
    await ensureCartProductDetail()
  } catch (error) {
    const storefrontError = error as StorefrontFetchError
    designSaveErrorMessage.value = storefrontError?.data?.message || 'Could not load product sizes for the cart.'
    dismissSaveSuccessDialog()
    return
  }

  const cartItem = buildDesignCartItem()

  if (!cartItem) {
    designSaveErrorMessage.value = 'Save the design before adding it to cart.'
    dismissSaveSuccessDialog()
    return
  }

  try {
    await addCartItem(cartItem)
    dismissSaveSuccessDialog()
    await navigateTo('/account/cart')
  } catch (error) {
    const storefrontError = error as StorefrontFetchError
    designSaveErrorMessage.value = storefrontError?.data?.message || 'Could not add the design to cart.'
  }
}

const createAnotherDesign = async () => {
  dismissSaveSuccessDialog()
  await navigateTo(createAnotherDesignHref)
}

const handleDeletedSavedDesign = (designId: string) => {
  if (activeDesignDraftId.value === designId) {
    activeDesignDraftId.value = null
    hydratedDraftDesignId.value = null
    designSaveSuccessMessage.value = null
  }
}

const removeUploadedAsset = (id: string) => {
  const assetToRemove = localUploadedAssets.value.find(asset => asset.id === id)

  if (!assetToRemove) {
    return
  }

  clearUploadRequest(id)

  if (import.meta.client && assetToRemove.src.startsWith('blob:')) {
    URL.revokeObjectURL(assetToRemove.src)
  }

  localUploadedAssets.value = localUploadedAssets.value.filter(asset => asset.id !== id)

  if (activeUploadedAssetId.value === id) {
    activeUploadedAssetId.value = null
  }
}

const createArtworkName = (file: File) => {
  return file.name.replace(/\.[^.]+$/, '') || file.name
}

const createUploadEndpoint = () => {
  return `${runtimeConfig.public.apiBase.replace(/\/+$/, '')}/uploads/artworks`
}

const uploadArtwork = (file: File, assetId: string) => {
  return new Promise<StorefrontUploadArtwork>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const startedAt = Date.now()
    const formData = new FormData()

    formData.append('artwork', file)
    formData.append('name', createArtworkName(file))

    xhr.open('POST', createUploadEndpoint(), true)
    xhr.withCredentials = true
    xhr.responseType = 'json'
    xhr.setRequestHeader('Accept', 'application/json')

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return
      }

      const currentAsset = localUploadedAssets.value.find(item => item.id === assetId)

      if (!currentAsset || currentAsset.status !== 'uploading') {
        return
      }

      const elapsedSeconds = Math.max((Date.now() - startedAt) / 1000, 0.1)
      const speedInMbps = ((event.loaded / elapsedSeconds) / (1024 * 1024)).toFixed(1)

      currentAsset.progress = Math.min(Math.round((event.loaded / event.total) * 100), 99)
      currentAsset.speedLabel = `${speedInMbps}MB/s`
    }

    xhr.onload = () => {
      uploadRequests.delete(assetId)

      const response = xhr.response as StorefrontUploadArtworkCreateResponse | null

      if (xhr.status >= 200 && xhr.status < 300 && response?.data) {
        resolve(response.data)
        return
      }

      reject(new Error(response?.message || 'Artwork upload failed.'))
    }

    xhr.onerror = () => {
      uploadRequests.delete(assetId)
      reject(new Error('Artwork upload failed.'))
    }

    xhr.onabort = () => {
      uploadRequests.delete(assetId)
      reject(new Error('Artwork upload canceled.'))
    }

    uploadRequests.set(assetId, xhr)
    xhr.send(formData)
  })
}

const uploadFile = async (file: File) => {
  if (!import.meta.client) {
    return
  }

  uploadArtworkErrorMessage.value = null

  const asset: DesignEditorUploadAsset = {
    id: createUploadId(),
    name: file.name,
    src: URL.createObjectURL(file),
    status: 'uploading',
    progress: 0,
    speedLabel: '0Mb/s',
    source: 'local',
    canRemove: true,
  }

  localUploadedAssets.value = [asset, ...localUploadedAssets.value]
  activeUploadedAssetId.value = asset.id

  try {
    const uploadedArtwork = await uploadArtwork(file, asset.id)
    const completedAsset = mapArtworkToUploadAsset(uploadedArtwork)
    const currentAsset = localUploadedAssets.value.find(item => item.id === asset.id)

    if (!currentAsset) {
      return
    }

    currentAsset.id = completedAsset.id
    currentAsset.name = completedAsset.name
    currentAsset.src = completedAsset.src
    currentAsset.status = 'ready'
    currentAsset.progress = 100
    currentAsset.speedLabel = ''
    currentAsset.source = 'remote'
    currentAsset.canRemove = false
    currentAsset.scope = completedAsset.scope
    currentAsset.categoryLabel = completedAsset.categoryLabel
    currentAsset.categorySlug = completedAsset.categorySlug
    currentAsset.uploadedAt = completedAsset.uploadedAt
    activeUploadedAssetId.value = String(completedAsset.id)
    await loadUploadArtworks(true)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Artwork upload failed.'
    const wasCanceled = message === 'Artwork upload canceled.'
    const failedAsset = localUploadedAssets.value.find(item => item.id === asset.id)

    if (!wasCanceled) {
      uploadArtworkErrorMessage.value = message
    }

    if (failedAsset?.src.startsWith('blob:')) {
      URL.revokeObjectURL(failedAsset.src)
    }

    localUploadedAssets.value = localUploadedAssets.value.filter(item => item.id !== asset.id)

    if (activeUploadedAssetId.value === asset.id) {
      activeUploadedAssetId.value = null
    }
  }
}

if (import.meta.client) {
  watch(activeTool, (toolId) => {
    if (toolId === 'upload') {
      void loadUploadArtworks()
    }

    if (toolId === 'image') {
      void loadPlatformArtworkCategories()
      void loadPlatformArtworks()
    }
  }, { immediate: true })

  watch(imageManagementVisible, (visible) => {
    if (visible) {
      void loadUploadArtworks()
      void loadPlatformArtworkCategories()
      void loadPlatformArtworks()
    }
  })

  watch(uploadedAssets, (assets) => {
    if (!activeUploadedAssetId.value) {
      return
    }

    const hasSelectedAsset = assets.some(asset => asset.id === activeUploadedAssetId.value)

    if (!hasSelectedAsset) {
      activeUploadedAssetId.value = null
    }
  })

  watch(platformAssets, (assets) => {
    if (!activePlatformAssetId.value) {
      return
    }

    const hasSelectedAsset = assets.some(asset => asset.id === activePlatformAssetId.value)

    if (!hasSelectedAsset) {
      activePlatformAssetId.value = null
    }
  })

  watch(activeMockup, (mockup) => {
    canvasImage.value = null

    if (!mockup?.src) {
      return
    }

    const image = new window.Image()
    image.src = mockup.src
    image.onload = () => {
      canvasImage.value = image
    }
  }, { immediate: true })

  watch([
    editorTextWordArtOptions,
    editorNumberWordArtOptions,
  ], ([textOptions, numberOptions]) => {
    void loadEditorWordArtFonts([...textOptions, ...numberOptions])
  }, { immediate: true })

  watch(
    () => [
      activeViewId.value,
      activeDesignObjectId.value,
      zoomScaleFactor.value,
      activeDesignObjects.value.map(object => `${object.id}:${object.x}:${object.y}:${object.width}:${object.height}:${object.rotation}`).join('|'),
    ],
    () => {
      void syncTransformer()
    },
    { immediate: true },
  )

  watch(
    () => [
      selectedColorId.value,
      selectedTechniqueId.value,
      Object.entries(designObjectsByView.value)
        .map(([viewId, objects]) => `${viewId}:${objects.map(object => `${object.id}:${object.x}:${object.y}:${object.width}:${object.height}:${object.rotation}`).join('|')}`)
        .join(';'),
    ],
    () => {
      if (!designSavePending.value) {
        designSaveErrorMessage.value = null
        designSaveSuccessMessage.value = null
      }
    },
  )

  watch(productIdentifier, (identifier) => {
    if (identifier) {
      void refreshProduct()
    }
  })

  watch(
    () => [product.value?.id ?? '', draftDesignId.value ?? ''],
    ([productId, designId]) => {
      if (productId && designId) {
        void loadExistingDesignDraft(designId)
      }
    },
    { immediate: true },
  )
}

onBeforeUnmount(() => {
  clearPostSaveFeedbackTimers()
  uploadRequests.forEach((request) => {
    request.abort()
  })
  uploadRequests.clear()

  localUploadedAssets.value.forEach((asset) => {
    if (import.meta.client && asset.src.startsWith('blob:')) {
      URL.revokeObjectURL(asset.src)
    }
  })
})

useHead(() => ({
  title: `${productName.value} Design | Tapstitch`,
}))
</script>

<template>
  <main
    v-if="isEditorReady"
    class="h-screen overflow-hidden bg-cotton-grey-2 p-1"
  >
    <div class="flex h-full flex-col gap-1">
      <header class="flex items-center gap-2 rounded-[10px] bg-black p-1 text-white">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <NuxtLink
            :to="editorBackHref"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-transparent transition hover:border-white/30 hover:bg-white/5"
            aria-label="Back to product"
          >
            <Icon
              name="ph:arrow-left"
              size="18px"
              class="text-white"
            />
          </NuxtLink>

          <div class="min-w-0">
            <div class="hidden items-center gap-2 lg:flex">
              <h1 class="truncate text-sm font-medium text-white lg:max-w-[180px] xl:max-w-[280px] 2xl:max-w-[360px]">
                {{ productName }}
              </h1>
              <Icon
                name="ruuul:switch"
                size="20px"
                class="cursor-pointer p-1 text-white"
              />
            </div>

            <p class="text-[11px] uppercase tracking-[0.12em] text-white/45 lg:hidden">
              Design editor
            </p>
            <h1 class="truncate text-sm font-medium text-white lg:hidden">
              {{ productName }}
            </h1>
          </div>
        </div>

        <div class="hidden min-w-0 flex-[2] items-center justify-center px-4 lg:flex" />

        <div class="ml-auto flex items-center gap-2.5">
          <DesignPriceSummaryPopover
            :total-label="priceSummary.totalLabel"
            :total-price="priceSummary.totalPrice"
            :line-items="priceSummary.lineItems"
            :footnote="priceSummary.footnote"
          />

          <div class="flex flex-col items-end gap-1">
            <button
              type="button"
              class="flex h-11 items-center justify-center rounded-[10px] border border-white/20 bg-white px-4 text-sm font-semibold text-primary transition hover:bg-[#f5f5f3] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/70 disabled:text-primary/40"
              :disabled="designSavePending || !hasDesignContent"
              @click="saveDesignDraft"
            >
              {{ designSavePending ? 'Saving...' : 'Save Design' }}
            </button>

            <p
              v-if="designSaveErrorMessage"
              class="text-[11px] text-[#ff9f9f]"
            >
              {{ designSaveErrorMessage }}
            </p>
          </div>
        </div>
      </header>

      <div class="flex min-h-0 flex-1 flex-col gap-1 lg:flex-row">
        <aside class="order-2 flex w-full shrink-0 lg:order-1 lg:w-[334px]">
          <div class="hidden w-16 shrink-0 flex-col justify-between bg-cotton-grey-2 lg:flex">
            <menu class="flex flex-col gap-1">
              <button
                v-for="tool in editorToolsTop"
                :key="tool.id"
                type="button"
                class="group relative flex h-16 flex-col items-center justify-center gap-1 rounded-l-lg py-2 text-primary transition"
                :class="tool.id === activeTool ? 'bg-white' : 'hover:bg-white/70'"
                @click="setActiveTool(tool.id)"
              >
                <Icon
                  :name="tool.icon"
                  size="22px"
                  :class="tool.id === activeTool ? 'text-primary' : 'text-[#4d545b] group-hover:text-primary'"
                />
                <span
                  class="text-[11px] leading-none"
                  :class="tool.id === activeTool ? 'text-primary' : 'text-[#4d545b] group-hover:text-primary'"
                >
                  {{ tool.label }}
                </span>
              </button>
            </menu>

            <menu class="flex flex-col gap-1">
              <button
                v-for="tool in editorToolsBottom"
                :key="tool.id"
                type="button"
                class="group relative flex h-16 flex-col items-center justify-center gap-1 rounded-l-lg py-2 text-primary transition"
                :class="tool.id === activeTool ? 'bg-white' : 'hover:bg-white/70'"
                @click="setActiveTool(tool.id)"
              >
                <Icon
                  :name="tool.icon"
                  size="22px"
                  :class="tool.id === activeTool ? 'text-primary' : 'text-[#4d545b] group-hover:text-primary'"
                />
                <span
                  class="text-[11px] leading-none"
                  :class="tool.id === activeTool ? 'text-primary' : 'text-[#4d545b] group-hover:text-primary'"
                >
                  {{ tool.label }}
                </span>
              </button>
            </menu>
          </div>

          <section class="flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-lg bg-white">
            <div class="border-b border-borderSecondary px-3 py-3 lg:hidden">
              <div class="flex gap-2 overflow-x-auto scroll-hide">
                <button
                  v-for="tool in editorToolsTop"
                  :key="`mobile-${tool.id}`"
                  type="button"
                  class="flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition"
                  :class="tool.id === activeTool ? 'border-primary bg-primary text-white' : 'border-borderSecondary bg-white text-primary'"
                  @click="setActiveTool(tool.id)"
                >
                  <Icon :name="tool.icon" size="18px" />
                  <span>{{ tool.label }}</span>
                </button>
              </div>
            </div>

            <div class="min-h-0 flex-1">
              <DesignUploadPanel
                v-if="activeTool === 'upload'"
                :history-assets="uploadHistoryAssets"
                :uploaded-assets="uploadedAssets"
                :active-uploaded-asset-id="activeUploadedAssetId"
                :loading="uploadArtworksPending"
                :error-message="combinedUploadErrorMessage"
                @open-image-management="openImageManagement"
                @retry-load="loadUploadArtworks(true)"
                @upload-file="uploadFile"
                @select-uploaded-asset="selectUploadedAsset"
                @remove-uploaded-asset="removeUploadedAsset"
              />
              <DesignImagePanel
                v-else-if="activeTool === 'image'"
                :categories="platformAssetCategories"
                :assets="platformAssets"
                :selected-category="selectedPlatformCategory"
                :active-asset-id="activePlatformAssetId"
                :loading="platformArtworksPending || platformArtworkCategoriesPending"
                :error-message="combinedPlatformArtworkErrorMessage"
                @open-image-management="openImageManagement"
                @update:selected-category="selectPlatformCategory"
                @select-asset="selectPlatformAsset"
                @retry-load="retryPlatformArtworkCatalogLoad"
              />
              <DesignTextPanel
                v-else-if="activeTool === 'text'"
                :text-options="editorTextWordArtOptions"
                :number-options="editorNumberWordArtOptions"
                :show-fallback-notice="usesFallbackWordArtOptions"
                @add-text-word-art="addDesignTextToActiveView"
                @add-number-word-art="addDesignTextToActiveView"
              />
              <DesignProductPanel
                v-else-if="activeTool === 'product' && product"
                :product="product"
                :selected-color-id="selectedColorId"
                :selected-technique-id="selectedTechniqueId"
                :active-view-id="activeViewId"
              />
              <DesignSavedPanel
                v-else-if="activeTool === 'saved'"
                :current-design-id="activeDesignDraftId"
                :refresh-key="savedDraftsRefreshKey"
                @deleted-design="handleDeletedSavedDesign"
              />

              <div
                v-else
                class="flex h-full min-h-[320px] flex-col items-center justify-center p-6 text-center"
              >
                <span class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cotton-grey-1 text-primary">
                  <Icon
                    :name="activeToolMeta?.icon ?? 'ph:package'"
                    size="24px"
                  />
                </span>
                <p class="text-sm font-medium text-primary">
                  {{ activeToolMeta?.label ?? 'Panel' }}
                </p>
                <p class="mt-2 max-w-[220px] text-xs leading-5 text-[#8b8f94]">
                  This panel will be connected next.
                </p>
              </div>
            </div>
          </section>
        </aside>

        <section class="order-1 flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-lg bg-white lg:order-2">
          <div class="flex items-center justify-between border-b border-borderSecondary px-3 py-2 lg:px-4">
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="color in previewColors"
                :key="color.id"
                type="button"
                class="flex h-6 w-6 items-center justify-center rounded-full shadow-[0_0_0_1px_#11131433_inset] transition"
                :class="selectedColorId === color.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-white' : ''"
                :style="{ backgroundColor: color.hex }"
                @click="selectColor(color.id)"
              >
                <span class="sr-only">{{ color.label }}</span>
              </button>
            </div>

            <div class="flex items-center gap-1 lg:gap-2">
<!--              <span class="hidden h-2 w-2 rounded-full bg-[#ff4d4f] lg:inline-flex" />-->
<!--              <div class="flex items-center gap-2 rounded-md p-2 text-xs hover:bg-cotton-grey-1">-->
<!--                <span class="hidden sm:inline text-primary">Adjusted mockup</span>-->
<!--                <ElSwitch-->
<!--                  v-model="isAdjustedMockup"-->
<!--                  :active-color="'#111314'"-->
<!--                  :inactive-color="'#e6e6e6'"-->
<!--                />-->
<!--              </div>-->

              <div class="flex items-center border-l border-borderSecondary pl-2">
<!--                <button-->
<!--                  type="button"-->
<!--                  class="rounded-md p-2 text-primary transition hover:bg-cotton-grey-1"-->
<!--                >-->
<!--                  <Icon name="ph:arrow-counter-clockwise" size="20px" />-->
<!--                </button>-->
<!--                <button-->
<!--                  type="button"-->
<!--                  class="rounded-md p-2 text-[#b9bdbf]"-->
<!--                >-->
<!--                  <Icon name="ph:arrow-clockwise" size="20px" />-->
<!--                </button>-->
<!--                <button-->
<!--                  type="button"-->
<!--                  class="rounded-md p-2 text-primary transition hover:bg-cotton-grey-1"-->
<!--                >-->
<!--                  <Icon name="ph:grid-four" size="20px" />-->
<!--                </button>-->
                <button
                  type="button"
                  class="rounded-md p-2 text-primary transition hover:bg-cotton-grey-1 disabled:cursor-not-allowed disabled:text-[#b9bdbf] disabled:hover:bg-transparent"
                  :disabled="!canZoomIn"
                  aria-label="Zoom to max"
                  @click="zoomCanvasToMax"
                >
                  <Icon name="ph:corners-out" size="20px" />
                </button>
                <button
                  type="button"
                  class="rounded-md p-2 text-primary transition hover:bg-cotton-grey-1 disabled:cursor-not-allowed disabled:text-[#b9bdbf] disabled:hover:bg-transparent"
                  :disabled="!canZoomOut"
                  aria-label="Zoom out"
                  @click="zoomCanvasOut"
                >
                  <Icon name="ph:magnifying-glass-minus" size="20px" />
                </button>
                <button
                  type="button"
                  class="rounded-md p-2 text-primary transition hover:bg-cotton-grey-1 disabled:cursor-not-allowed disabled:text-[#b9bdbf] disabled:hover:bg-transparent"
                  :disabled="!canZoomIn"
                  aria-label="Zoom in"
                  @click="zoomCanvasIn"
                >
                  <Icon name="ph:magnifying-glass-plus" size="20px" />
                </button>
                <div class="ml-1 hidden min-w-[52px] items-center justify-center rounded-md bg-cotton-grey-1 px-2 py-1 text-xs font-semibold text-primary sm:flex">
                  {{ zoomPercentage }}%
                </div>
              </div>
            </div>
          </div>

          <div
            ref="workspaceRef"
            class="relative flex-1 bg-white"
          >
            <ClientOnly>
              <v-stage
                ref="stageRef"
                class="block h-full w-full"
                :config="stageConfig"
                @mousedown="handleStagePointerDown"
                @touchstart="handleStagePointerDown"
              >
                <v-layer>
                  <v-image
                    v-if="canvasImage"
                    :config="mockupImageConfig"
                  />
                  <v-image
                    v-for="designObject in activeDesignImageConfigs"
                    :key="designObject.id"
                    :ref="setDesignImageNodeRef(designObject.id)"
                    :config="designObject.config"
                    @click="selectDesignObject(designObject.id)"
                    @tap="selectDesignObject(designObject.id)"
                    @dragmove="handleDesignDragMove(designObject.id, $event)"
                    @dragend="handleDesignDragMove(designObject.id, $event)"
                    @transformend="handleDesignTransform(designObject.id)"
                  />
                  <v-text
                    v-for="designObject in activeDesignTextConfigs"
                    :key="designObject.id"
                    :ref="setDesignImageNodeRef(designObject.id)"
                    :config="designObject.config"
                    @click="selectDesignObject(designObject.id)"
                    @tap="selectDesignObject(designObject.id)"
                    @dragmove="handleDesignDragMove(designObject.id, $event)"
                    @dragend="handleDesignDragMove(designObject.id, $event)"
                    @transformend="handleDesignTransform(designObject.id)"
                  />
                  <v-rect
                    v-if="printAreaConfig"
                    :config="printAreaConfig"
                  />
                  <v-transformer
                    v-if="transformerConfig"
                    ref="transformerRef"
                    :config="transformerConfig"
                  />
                  <v-group
                    v-if="deleteControlConfig && activeDesignObject"
                    :config="deleteControlConfig.group"
                    @click="removeDesignObject(activeDesignObject.id)"
                    @tap="removeDesignObject(activeDesignObject.id)"
                  >
                    <v-circle :config="deleteControlConfig.circle" />
                    <v-text :config="deleteControlConfig.text" />
                  </v-group>
                </v-layer>
              </v-stage>

              <template #fallback>
                <div class="h-full w-full bg-white" />
              </template>
            </ClientOnly>

            <div class="pointer-events-none absolute inset-0" />

            <div class="absolute bottom-8 left-1/2 z-[5] flex max-w-[calc(100%-32px)] -translate-x-1/2 select-none flex-wrap items-center justify-center gap-2.5 p-2">
              <button
                v-for="view in availableViews"
                :key="view.id"
                type="button"
                class="flex h-[36px] items-center justify-center gap-2.5 rounded-md border px-4 py-2 text-sm transition"
                :class="activeViewId === view.id ? 'border-white/30 bg-primary text-white hover:bg-primary' : 'border-transparent bg-[#e8e8e5] text-primary hover:bg-line-grey'"
                @click="selectView(view.id)"
              >
                <span>{{ view.label }}</span>
              </button>
            </div>
          </div>
        </section>

        <aside class="order-3 flex w-full shrink-0 flex-col gap-1 lg:w-[327px]">
          <div class="relative flex flex-1 flex-col space-y-6 overflow-hidden rounded-lg bg-white px-3 py-4">
            <div>
              <h2 class="mb-2 font-semibold tracking-[0.32px]">
                Attributes
              </h2>

              <div class="space-y-4">
                <div class="grid grid-cols-2 items-end gap-2">
                  <div class="flex flex-col">
                    <div class="mb-1.5 flex items-center justify-between">
                      <span class="text-sm leading-6">Width</span>
                    </div>
                    <div class="flex h-10 items-center justify-between rounded-lg border border-borderSecondary bg-white px-3 text-sm text-[#b4b7ba]">
                      <span>{{ designImageMetrics.width }}</span>
                      <span class="text-xs">px</span>
                    </div>
                  </div>

                  <div class="flex flex-col">
                    <div class="mb-1.5 flex items-center justify-between">
                      <span class="text-sm leading-6">Height</span>
                      <button
                        type="button"
                        class="hidden rounded p-1 text-[#8b8f94] transition hover:bg-cotton-grey-1 lg:flex"
                      >
                        <Icon name="ph:link-simple" size="16px" />
                      </button>
                    </div>
                    <div class="flex h-10 items-center justify-between rounded-lg border border-borderSecondary bg-white px-3 text-sm text-[#b4b7ba]">
                      <span>{{ designImageMetrics.height }}</span>
                      <span class="text-xs">px</span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div class="flex flex-col">
                    <span class="mb-1.5 text-sm">Rotate</span>
                    <div class="flex h-10 items-center justify-between rounded-lg border border-borderSecondary bg-white px-3 text-sm text-[#b4b7ba]">
                      <span>{{ designImageMetrics.rotation }}</span>
                      <span class="text-xs">°</span>
                    </div>
                  </div>

                  <div class="flex flex-col">
                    <span class="mb-1.5 text-sm">Scale</span>
                    <div class="flex h-10 items-center justify-between rounded-lg border border-borderSecondary bg-white px-3 text-sm text-[#b4b7ba]">
                      <span>{{ designImageMetrics.scale }}</span>
                      <span class="text-xs">%</span>
                    </div>
                  </div>
                </div>

                <div
                  v-if="activeTextObject"
                  class="grid grid-cols-2 gap-2"
                >
                  <div class="flex flex-col">
                    <span class="mb-1.5 text-sm">Font size</span>
                    <ElInputNumber
                      :model-value="activeTextFontSize"
                      :min="8"
                      :max="220"
                      :step="1"
                      :controls="true"
                      inputmode="numeric"
                      class="design-attribute-number-input"
                      @change="updateActiveTextFontSize"
                    />
                  </div>

                  <div class="flex flex-col">
                    <span class="mb-1.5 text-sm">Color</span>
                    <div class="flex h-10 items-center justify-between rounded-lg border border-borderSecondary bg-white px-3">
                      <span
                        class="h-5 w-5 rounded border border-borderSecondary"
                        :style="{ backgroundColor: activeTextColor }"
                      />
                      <ElColorPicker
                        :model-value="activeTextColor"
                        color-format="hex"
                        size="small"
                        @change="updateActiveTextColor"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <DesignImageManagementDialog
      v-model="imageManagementVisible"
      :initial-tab="imageManagementInitialTab"
      :categories="platformAssetCategories"
      :history-assets="uploadHistoryAssets"
      :recommend-assets="platformAssets"
      :selected-recommend-category="selectedPlatformCategory"
      :mine-assets="uploadedAssets"
      :active-uploaded-asset-id="activeUploadedAssetId"
      :active-recommend-asset-id="activePlatformAssetId"
      :loading="uploadArtworksPending"
      :recommend-loading="platformArtworksPending || platformArtworkCategoriesPending"
      :error-message="combinedUploadErrorMessage"
      :recommend-error-message="combinedPlatformArtworkErrorMessage"
      @retry-load="loadUploadArtworks(true)"
      @retry-recommend-load="retryPlatformArtworkCatalogLoad"
      @update:selected-recommend-category="selectPlatformCategory"
      @select-uploaded-asset="selectUploadedAsset"
      @select-history-asset="selectUploadedAsset"
      @select-recommend-asset="selectPlatformAsset"
      @remove-uploaded-asset="removeUploadedAsset"
      @upload-file="uploadFile"
    />

    <transition name="save-toast">
      <div
        v-if="saveSuccessToastVisible"
        class="pointer-events-none fixed left-1/2 top-5 z-[95] -translate-x-1/2 rounded-full border border-[#d8ece0] bg-white px-4 py-2 text-sm font-medium text-primary shadow-[0_18px_45px_rgba(17,19,20,0.12)]"
      >
        {{ saveSuccessToastMessage }}
      </div>
    </transition>

    <DesignSaveSuccessDialog
      v-model="saveSuccessDialogVisible"
      @add-to-cart="addSavedDesignToCart"
      @create-another="createAnotherDesign"
    />
  </main>

  <main
    v-else-if="isEditorLoading"
    class="flex h-screen items-center justify-center bg-cotton-grey-2 p-6"
  >
    <div class="flex w-full max-w-md flex-col items-center rounded-[18px] bg-white px-6 py-10 text-center shadow-[0_20px_80px_rgba(17,19,20,0.08)]">
      <span class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cotton-grey-1 text-primary">
        <Icon
          :name="productPending ? 'ph:spinner-gap' : 'ph:package'"
          size="24px"
          :class="productPending ? 'animate-spin' : ''"
        />
      </span>
      <h1 class="text-base font-semibold text-primary">
        Loading design editor
      </h1>
      <p class="mt-2 max-w-[260px] text-sm leading-6 text-[#686f72]">
        We are preparing the product configuration for the editor.
      </p>
    </div>
  </main>

  <main
    v-else-if="isEditorUnavailable"
    class="flex h-screen items-center justify-center bg-cotton-grey-2 p-6"
  >
    <div class="flex w-full max-w-md flex-col items-center rounded-[18px] bg-white px-6 py-10 text-center shadow-[0_20px_80px_rgba(17,19,20,0.08)]">
      <span class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cotton-grey-1 text-primary">
        <Icon
          name="ph:package"
          size="24px"
        />
      </span>
      <h1 class="text-base font-semibold text-primary">
        Editor unavailable
      </h1>
      <p class="mt-2 max-w-[280px] text-sm leading-6 text-[#686f72]">
        We could not load the product configuration for this design session.
      </p>
      <button
        type="button"
        class="mt-5 inline-flex h-11 items-center justify-center rounded-[10px] border border-borderSecondary px-4 text-sm font-semibold text-primary transition hover:bg-cotton-grey-1"
        @click="refreshProduct()"
      >
        Retry
      </button>
    </div>
  </main>
</template>

<style scoped>
.save-toast-enter-active,
.save-toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.save-toast-enter-from,
.save-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.design-attribute-number-input {
  width: 100%;
}

.design-attribute-number-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--color-line-grey) inset;
}
</style>
