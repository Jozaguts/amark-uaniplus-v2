export type DesignEditorDialogTab = 'mine' | 'history' | 'recommend'

export type DesignEditorAssetCategory = {
  label: string
  value: string
}

export type DesignEditorAsset = {
  id: string
  name: string
  src: string
  category: string
}

export type DesignEditorUploadAssetStatus = 'uploading' | 'ready'

export type DesignEditorUploadAsset = {
  id: string
  name: string
  src: string
  status: DesignEditorUploadAssetStatus
  progress: number
  speedLabel: string
  source?: 'local' | 'remote'
  canRemove?: boolean
  scope?: string
  categoryLabel?: string | null
  categorySlug?: string | null
  uploadedAt?: string
}

export type DesignEditorWordArtOption = {
  id: string
  label?: string
  className: string
  fallbackText: string
  fontFamily?: string
  fontUrl?: string
  fontWeight?: number | string
  fontStyle?: 'normal' | 'italic'
  fontSize?: number
  textTransform?: 'uppercase' | 'lowercase' | null
  letterSpacing?: number
  lineHeight?: number | null
  defaultColor?: string
  enabled?: boolean
  sortOrder?: number
}

export const designEditorAssetCategories: DesignEditorAssetCategory[] = [
  { label: 'Clipart', value: 'clipart' },
  { label: 'Animal', value: 'animal' },
  { label: 'Friendship', value: 'friendship' },
  { label: 'Romantic', value: 'romantic' },
  { label: 'Summer', value: 'summer' },
  { label: 'Graphic designs', value: 'graphic-designs' },
  { label: 'Anime', value: 'anime' },
]

export const designEditorRecommendAssets: DesignEditorAsset[] = [
  { id: 'recommend-1', name: 'Heart Graphic', src: '/images/image-v2.jpg', category: 'romantic' },
  { id: 'recommend-2', name: 'Outrun Graphic', src: '/images/image-v3.jpeg', category: 'anime' },
  { id: 'recommend-3', name: 'Statue Artwork', src: '/images/image-v1.jpg', category: 'graphic-designs' },
  { id: 'recommend-4', name: 'Wash Texture', src: '/images/image-v4.jpeg', category: 'summer' },
  { id: 'recommend-5', name: 'Bear Graphic', src: '/images/image-v5.jpg', category: 'animal' },
  { id: 'recommend-6', name: 'Tank Top Layout', src: '/images/products/tank-tops.png', category: 'clipart' },
  { id: 'recommend-7', name: 'T-Shirt Layout', src: '/images/products/t-shirts.png', category: 'clipart' },
  { id: 'recommend-8', name: 'Hoodie Layout', src: '/images/products/hoodies.png', category: 'friendship' },
  { id: 'recommend-9', name: 'Sweatshirt Layout', src: '/images/products/sweatshirts.png', category: 'graphic-designs' },
  { id: 'recommend-10', name: 'Long Sleeve Layout', src: '/images/products/long-sleeve-shirts.png', category: 'anime' },
  { id: 'recommend-11', name: 'Sweatpants Layout', src: '/images/products/sweatpants.png', category: 'summer' },
  { id: 'recommend-12', name: 'Sportwear Layout', src: '/images/products/sportwear.png', category: 'animal' },
]

export const designEditorWordArtOptions: DesignEditorWordArtOption[] = [
  {
    id: 'word-art-1',
    className: 'text-center text-[22px] font-semibold uppercase tracking-[0.18em] text-[#c53232] [text-shadow:0_1px_0_#fff,0_0_12px_rgba(197,50,50,0.18)]',
    fallbackText: 'ADD TEXT HERE',
  },
  {
    id: 'word-art-2',
    className: 'text-center text-[30px] font-bold lowercase italic text-[#d02424]',
    fallbackText: 'add text here',
  },
  {
    id: 'word-art-3',
    className: 'text-center font-mono text-[24px] font-semibold uppercase tracking-[0.22em] text-[#c1272d]',
    fallbackText: 'ADD TEXT HERE',
  },
  {
    id: 'word-art-4',
    className: 'text-center text-[40px] font-semibold uppercase text-[#d52b2b] [text-shadow:2px_2px_0_rgba(255,255,255,0.8)]',
    fallbackText: 'ADD TEXT HERE',
  },
  {
    id: 'word-art-5',
    className: 'text-center text-[28px] font-medium lowercase text-[#d12a2a]',
    fallbackText: 'add text here',
  },
  {
    id: 'word-art-6',
    className: 'text-center text-[32px] font-semibold uppercase italic tracking-[0.08em] text-[#cb2828]',
    fallbackText: 'ADD TEXT HERE',
  },
  {
    id: 'word-art-7',
    className: 'text-center font-mono text-[30px] lowercase text-[#d43131]',
    fallbackText: 'add text here',
  },
  {
    id: 'word-art-8',
    className: 'text-center text-[24px] font-medium italic text-[#cf4040]',
    fallbackText: 'add text here',
  },
  {
    id: 'word-art-9',
    className: 'text-center text-[28px] font-normal italic tracking-[0.04em] text-[#d96363]',
    fallbackText: 'add text here',
  },
]

export const designEditorNumberArtOptions: DesignEditorWordArtOption[] = [
  {
    id: 'number-art-1',
    className: 'text-center text-[42px] font-bold text-[#c53232] [text-shadow:2px_2px_0_rgba(255,255,255,0.85)]',
    fallbackText: '23',
  },
  {
    id: 'number-art-2',
    className: 'text-center font-mono text-[40px] font-semibold tracking-[0.12em] text-[#d02424]',
    fallbackText: '08',
  },
  {
    id: 'number-art-3',
    className: 'text-center text-[46px] font-black italic text-[#c1272d]',
    fallbackText: '99',
  },
  {
    id: 'number-art-4',
    className: 'text-center text-[38px] font-semibold text-[#d52b2b] [text-shadow:0_0_12px_rgba(213,43,43,0.22)]',
    fallbackText: '10',
  },
  {
    id: 'number-art-5',
    className: 'text-center font-mono text-[44px] font-bold italic text-[#d12a2a]',
    fallbackText: '45',
  },
  {
    id: 'number-art-6',
    className: 'text-center text-[40px] font-semibold tracking-[0.08em] text-[#cb2828]',
    fallbackText: '01',
  },
]
