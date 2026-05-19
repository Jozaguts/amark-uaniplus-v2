<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { ProductGalleryImage } from '~/types/catalog'
import type { ProductDetailResponse, ProductGalleryItem } from '~/types/product-detail'

const props = defineProps<{
  slug: string
  fallbackBackTo: RouteLocationRaw
}>()

const localePath = useLocalePath()
const { locale, t } = useI18n()

function linkTarget(url: string): string {
  if (/^https?:\/\//.test(url))
    return url

  return localePath(url)
}

const {
  data: productResponse,
  pending,
  error,
} = useStorefrontFetch<ProductDetailResponse>(
  () => `/storefront/products/${props.slug}`,
  {
    key: computed(() => `product-detail:${props.slug}:${locale.value}`),
    query: computed(() => ({ locale: locale.value })),
    default: () => ({ data: null }),
    immediate: Boolean(props.slug),
    watch: [
      computed(() => props.slug),
      locale,
    ],
  },
)

const product = computed(() => productResponse.value?.data ?? null)

const galleryImages = computed<ProductGalleryImage[]>(() => {
  return (product.value?.gallery ?? []).map(galleryItemToImage)
})

const backTo = computed<RouteLocationRaw>(() => {
  const breadcrumbs = product.value?.breadcrumbs ?? []
  const lastCategory = breadcrumbs.at(-1)

  return lastCategory?.url ? linkTarget(lastCategory.url) : props.fallbackBackTo
})

const designTo = computed<RouteLocationRaw | undefined>(() => {
  if (!product.value?.is_designable || !product.value.design_url)
    return undefined

  return linkTarget(product.value.design_url)
})

function galleryItemToImage(image: ProductGalleryItem): ProductGalleryImage {
  return {
    src: image.src,
    srcset: image.srcset ?? undefined,
    thumb: image.thumb,
    thumbSrcset: image.thumb_srcset ?? undefined,
    alt: image.alt,
  }
}

useSeoMeta({
  title: () => product.value?.seo?.title || product.value?.name || t('catalog.product.title'),
  description: () => product.value?.seo?.description || undefined,
  ogTitle: () => product.value?.seo?.title || product.value?.name || t('catalog.product.title'),
  ogDescription: () => product.value?.seo?.description || undefined,
  ogImage: () => product.value?.seo?.image || product.value?.gallery?.[0]?.src || undefined,
})
</script>

<template>
  <main class="page mx-auto w-full max-w-[1344px] px-[20px] pb-[80px] pt-[28px] lg:px-0">
    <NuxtLink
      :to="backTo"
      class="text-[12px] leading-none underline"
    >
      {{ $t('catalog.product.backToResults') }}
    </NuxtLink>

    <p
      v-if="pending"
      class="mt-[27px] text-[14px] text-[#606060]"
    >
      {{ $t('catalog.product.loading') }}
    </p>

    <p
      v-else-if="error || !product"
      class="mt-[27px] text-[14px] text-[#606060]"
    >
      {{ $t('catalog.product.error') }}
    </p>

    <div
      v-else
      class="mt-[27px] flex flex-col gap-[45px] lg:flex-row lg:items-start"
    >
      <div class="min-w-0 flex-1">
        <ProductGallery :images="galleryImages" />
      </div>

      <div class="pt-[2px]">
        <ProductInfoPanel
          :product="product"
          :design-to="designTo"
        />
        <ProductDetailsTabs :content="product.content" />
      </div>
    </div>
  </main>
</template>
