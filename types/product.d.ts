/**
 * Canonical API contract
 *
 * List:
 * GET /api/products/{type}
 * Example:
 * /api/products/fashion?audience=women&productType=t-shirts&color[]=black&size[]=m
 *
 * Detail:
 * GET /api/products/{type}/{identifier}
 * Example:
 * /api/products/fashion/women-essential-tee
 * /api/products/fashion/WM-TEE-001?by=sku
 *
 * Notes:
 * - `type` is reserved for the catalog root: fashion | accessories.
 * - `productType` is the filter for the product family/subcategory: t-shirts, hoodies, collars, beds, etc.
 * - The API must return presentation-ready values. The frontend should render directly without mappers.
 */


export type ProductType = 'fashion' | 'accessories' | 'digital-products'

export type ProductAudience = 'women' | 'men' | 'kids' | 'cats' | 'dogs'

export type ProductLookupBy = 'slug' | 'sku'

export type ProductSort =
    | 'newest'
    | 'oldest'
    | 'price-low-to-high'
    | 'price-high-to-low'
    | 'a-to-z'
    | 'z-to-a'

export type ProductImage = {
    id: string,
    src: string,
    alt: string,
    colorId?: string,
}

export type ProductColor = {
    id: string,
    label: string,
    hex: string,
    selected?: boolean,
}

export type ProductBreadcrumb = {
    label: string,
    href: string,
}

export type ProductGalleryLayout = 'one-one' | 'two-one' | 'two-two' | 'two-three' | 'two-four'

export type ProductGallerySlide = {
    id: string,
    layout: ProductGalleryLayout,
    images: ProductImage[],
}

export type ProductDetailAction = {
    label: string,
    href?: string | null,
    action?: string,
    variant: 'primary' | 'secondary',
}

export type ProductDetailTabKey = 'customize' | 'product-details'

export type ProductDetailTab = {
    key: ProductDetailTabKey,
    label: string,
}

export type ProductDetailSelectableOption = {
    id: string,
    label: string,
    color?: string,
    selected?: boolean,
}

export type ProductDetailPriceTier = {
    id: string,
    label: string,
    price: string,
    selected?: boolean,
}

export type ProductDetailTechniqueOption = {
    id: string,
    title: string,
    description: string,
    selected?: boolean,
}

export type ProductDetailPrintAreaOption = {
    id: string,
    title: string,
    price: string,
    subtitle?: string,
    selected?: boolean,
}

export type ProductDetailGuideLink = {
    label: string,
    href: string,
}

export type ProductDetailSizeGuideTab = {
    key: string,
    label: string,
    columns: string[],
    rows: string[][],
}

export type ProductDetailSizeGuideMeasure = {
    index: number,
    title: string,
    description: string,
}

export type ProductDetailSizeGuide = {
    title: string,
    label: string,
    note: string,
    tabs: ProductDetailSizeGuideTab[],
    measurementTitle: string,
    measurements: ProductDetailSizeGuideMeasure[],
    image: string,
    imageAlt: string,
}

export type ProductDetailSummaryEntry = {
    label: string,
    value: string,
}

export type ProductDetailTextBlock = {
    text: string,
    italic?: boolean,
}

export type ProductCustomizeSection = {
    colorTitle: string,
    sizeTitle: string,
    unitPriceTitle: string,
    customizationTitle: string,
    techniqueTitle: string,
    printAreaTitle: string,
    sizeGuide?: ProductDetailSizeGuide,
    printGuide?: ProductDetailGuideLink,
    colorOptions: ProductDetailSelectableOption[],
    sizeOptions: ProductDetailSelectableOption[],
    unitPriceOptions: ProductDetailPriceTier[],
    techniqueOptions: ProductDetailTechniqueOption[],
    printAreaOptions: ProductDetailPrintAreaOption[],
}

export type ProductDetailAccordionSection = {
    id: string,
    title: string,
    openByDefault?: boolean,
    paragraphs?: ProductDetailTextBlock[],
    items?: ProductDetailSummaryEntry[],
    bullets?: string[],
    image?: string,
}

export type ProductDetailStickySummary = {
    thumbnail: string,
    title: string,
    fulfillmentTitle: string,
    fulfillmentSubtitle: string,
    price: string,
    priceBreakdown: ProductDetailSummaryEntry[],
    actions: ProductDetailAction[],
    footnote?: string,
}

export type ProductSectionTwo = {
    tabs: ProductDetailTab[],
    customize?: ProductCustomizeSection | null,
    detailsSections: ProductDetailAccordionSection[],
    stickySummary: ProductDetailStickySummary,
}

export type ProductFilterOption = {
    id: string,
    value: string,
    label: string,
    count: number,
    selected?: boolean,
}

export type ProductPriceRange = {
    min: number,
    max: number,
}

export type ProductListFilters = {
    audiences: ProductFilterOption[],
    productTypes: ProductFilterOption[],
    colors: ProductFilterOption[],
    sizes: ProductFilterOption[],
    priceRange: ProductPriceRange,
}

export type ProductMeta = {
    currentPage: number,
    lastPage: number,
    perPage: number,
    total: number,
}

export type ProductLinks = {
    first: string | null,
    last: string | null,
    prev: string | null,
    next: string | null,
}

export type ProductCard = {
    id: string,
    type: ProductType,
    audience: ProductAudience,
    categoryId: string,
    categoryHandle: string,
    categoryLabel: string,
    productType: string,
    productTypeLabel: string,
    sku: string,
    slug: string,
    href: string,
    name: string,
    from: string,
    price: string,
    priceValue: number,
    compareAtPrice?: string | null,
    compareAtPriceValue?: number | null,
    details: string,
    images: ProductImage[],
    featuredImage: ProductImage | null,
    colors: ProductColor[],
    selectedColorId: string | null,
    sizes: ProductDetailSelectableOption[],
    inStock: boolean,
    stockQuantity: number | null,
    badges?: string[],
}

export type ProductVariant = {
    id: string,
    sku: string,
    label: string,
    colorId?: string | null,
    sizeId?: string | null,
    price: string,
    priceValue: number,
    inStock: boolean,
    stockQuantity: number | null,
}

export type ProductDesignPrintArea = {
    id: string,
    title: string,
    subtitle?: string,
    price: string,
    selected?: boolean,
}

export type ProductDesign = {
    editorReady: boolean,
    techniques: ProductDetailTechniqueOption[],
    printAreas: ProductDesignPrintArea[],
}

export type Product = ProductCard

export type ProductDetail = Product & {
    breadcrumbs: ProductBreadcrumb[],
    gallerySlides: ProductGallerySlide[],
    actions: ProductDetailAction[],
    sectionTwo: ProductSectionTwo,
    variants: ProductVariant[],
    design: ProductDesign | null,
}

export type ProductListQuery = {
    audience?: ProductAudience,
    productType?: string,
    color?: string[],
    size?: string[],
    q?: string,
    priceMin?: number,
    priceMax?: number,
    sort?: ProductSort,
    page?: number,
    perPage?: number,
    inStock?: boolean,
}

export type ProductDetailQuery = {
    by?: ProductLookupBy,
}

export type ProductListResponse = {
    data: Product[],
    meta: ProductMeta,
    links: ProductLinks,
    filters: ProductListFilters,
}

export type ProductDetailResponse = {
    data: ProductDetail,
}
