<script setup lang="ts">
import type { CatalogProduct, CatalogSidebarGroup } from '~/types/catalog'

const route = useRoute()
const localePath = useLocalePath()
const { currentSection, productPath } = useCatalogNavigation()

const sidebarGroups: CatalogSidebarGroup[] = [
  {
    titleKey: 'catalog.category.sidebar.category.title',
    items: [
      { labelKey: 'catalog.category.sidebar.category.allSaleItems', active: true },
      { labelKey: 'catalog.category.sidebar.category.lastChance' },
      { labelKey: 'catalog.category.sidebar.category.finalSale', danger: true },
    ],
  },
  {
    titleKey: 'catalog.category.sidebar.shopYourSize.title',
    items: [
      { labelKey: 'catalog.category.sidebar.shopYourSize.apparel' },
      { labelKey: 'catalog.category.sidebar.shopYourSize.denim' },
      { labelKey: 'catalog.category.sidebar.shopYourSize.shoes' },
    ],
  },
  {
    titleKey: 'catalog.category.sidebar.shopByCategory.title',
    items: [
      'accessories',
      'athleticWear',
      'bags',
      'beauty',
      'denim',
      'home',
      'jacketsCoats',
      'jewelry',
      'lounge',
      'pants',
      'polos',
      'shirts',
      'shoes',
      'shorts',
      'suits',
      'sweatersKnits',
      'sweatshirtsHoodies',
      'swim',
      'tShirts',
      'tops',
      'underwear',
    ].map(key => ({ labelKey: `catalog.category.sidebar.shopByCategory.${key}` })),
  },
]

const productSeeds = [
  {
    id: 'RGBR-MZ51',
    slug: 'tucker-oxford-dress-shoe',
    image: 'https://is4.revolveassets.com/images/p4/n/tv/RGBR-MZ51_V1.jpg',
    srcset: 'https://is4.revolveassets.com/images/p4/n/tv/RGBR-MZ51_V1.jpg 1x, https://is4.revolveassets.com/images/p4/n/uv/RGBR-MZ51_V1.jpg 2x',
    key: 'tuckerOxford',
  },
  {
    id: 'SSAM-MK24',
    slug: 'sanino-polo',
    image: 'https://is4.revolveassets.com/images/p4/n/tv/SSAM-MK24_V1.jpg',
    srcset: 'https://is4.revolveassets.com/images/p4/n/tv/SSAM-MK24_V1.jpg 1x, https://is4.revolveassets.com/images/p4/n/uv/SSAM-MK24_V1.jpg 2x',
    key: 'saninoPolo',
  },
  {
    id: 'SSAM-MK25',
    slug: 'salevo-sweater',
    image: 'https://is4.revolveassets.com/images/p4/n/tv/SSAM-MK25_V1.jpg',
    srcset: 'https://is4.revolveassets.com/images/p4/n/tv/SSAM-MK25_V1.jpg 1x, https://is4.revolveassets.com/images/p4/n/uv/SSAM-MK25_V1.jpg 2x',
    key: 'salevoSweater',
  },
  {
    id: 'ALLR-MO88',
    slug: 'saxon-jacket',
    image: 'https://is4.revolveassets.com/images/p4/n/tv/ALLR-MO88_V1.jpg',
    srcset: 'https://is4.revolveassets.com/images/p4/n/tv/ALLR-MO88_V1.jpg 1x, https://is4.revolveassets.com/images/p4/n/uv/ALLR-MO88_V1.jpg 2x',
    key: 'saxonJacket',
  },
  {
    id: 'HOKF-MZ143',
    slug: 'm-bondi-9',
    image: 'https://is4.revolveassets.com/images/p4/n/tv/HOKF-MZ143_V1.jpg',
    srcset: 'https://is4.revolveassets.com/images/p4/n/tv/HOKF-MZ143_V1.jpg 1x, https://is4.revolveassets.com/images/p4/n/uv/HOKF-MZ143_V1.jpg 2x',
    key: 'mBondi9',
  },
  {
    id: 'HOKF-MZ147',
    slug: 'u-ora-primo-ext-sneaker',
    image: 'https://is4.revolveassets.com/images/p4/n/tv/HOKF-MZ147_V1.jpg',
    srcset: 'https://is4.revolveassets.com/images/p4/n/tv/HOKF-MZ147_V1.jpg 1x, https://is4.revolveassets.com/images/p4/n/uv/HOKF-MZ147_V1.jpg 2x',
    key: 'uOraPrimo',
  },
  {
    id: 'HOKF-MZ153',
    slug: 'u-hopara',
    image: 'https://is4.revolveassets.com/images/p4/n/tv/HOKF-MZ153_V1.jpg',
    srcset: 'https://is4.revolveassets.com/images/p4/n/tv/HOKF-MZ153_V1.jpg 1x, https://is4.revolveassets.com/images/p4/n/uv/HOKF-MZ153_V1.jpg 2x',
    key: 'uHopara',
  },
  {
    id: 'HOKF-MZ154',
    slug: 'm-mafate-x',
    image: 'https://is4.revolveassets.com/images/p4/n/tv/HOKF-MZ154_V1.jpg',
    srcset: 'https://is4.revolveassets.com/images/p4/n/tv/HOKF-MZ154_V1.jpg 1x, https://is4.revolveassets.com/images/p4/n/uv/HOKF-MZ154_V1.jpg 2x',
    key: 'mMafateX',
  },
] as const

const sectionHomePath = computed(() => localePath(`/${currentSection.value}`))

const headingKey = computed(() => `catalog.category.headings.${currentSection.value}`)

const products = computed<CatalogProduct[]>(() => productSeeds.map(product => ({
  id: product.id,
  image: product.image,
  srcset: product.srcset,
  to: productPath(product.slug),
  nameKey: `catalog.category.products.${product.key}.name`,
  brandKey: `catalog.category.products.${product.key}.brand`,
  salePriceKey: `catalog.category.products.${product.key}.salePrice`,
  retailPriceKey: `catalog.category.products.${product.key}.retailPrice`,
  altKey: `catalog.category.products.${product.key}.alt`,
})))

const selectedCategory = computed(() => String(route.query.category || 'all-sale-items'))
</script>

<template>
  <main class="page mx-auto w-full max-w-[1344px] px-[20px] pb-[80px] pt-[28px] lg:px-0">
   <div class="container mx-auto ">
     <nav
         class=" text-[12px] text-[#303030] mt-4 mb-4 leading-8"
         aria-label="Breadcrumb"
     >
       <NuxtLink
           :to="sectionHomePath"
           class="underline"
       >
         {{ $t(`catalog.sections.${currentSection}`) }}
       </NuxtLink>
       <span class="px-[5px]">/</span>
       <NuxtLink
           :to="localePath({ path: `/content/${currentSection}`, query: { category: 'sale' } })"
           class="underline"
       >
         {{ $t('catalog.breadcrumb.sale') }}
       </NuxtLink>
       <span class="px-[5px]">/</span>
       <span>{{ $t('catalog.breadcrumb.allSaleItems') }}</span>
     </nav>

     <h1 class="mt-[34px] text-[25px] font-semibold uppercase  tracking-[0.16em]">
       {{ $t(headingKey) }}
     </h1>

     <div class="mt-[29px] flex flex-col gap-[48px] lg:flex-row">
       <CatalogSidebar :groups="sidebarGroups" />

       <section class="min-w-0 flex-1">
         <CatalogFilterBar item-count-key="catalog.category.itemCount" />

         <p class="sr-only">
           {{ $t('catalog.category.active') }}: {{ selectedCategory }}
         </p>

         <div class="mt-[24px]">
           <CatalogProductGrid :products="products" />
         </div>
       </section>
     </div>
   </div>
  </main>
</template>
