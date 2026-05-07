<script setup lang="ts">
import MegaMenu from '~/components/header/MegaMenu.vue'

type TabKey = 'women' | 'men' | 'kids' | 'dogs' | 'cats'
type NavKey = 'newToday' | 'clothing' | 'dresses' | 'shoes' | 'accessories' | 'designers' | 'stores' | 'hotList' | 'sale'
type MegaMenuLink = { labelKey: string, badgeKey?: string, italic?: boolean }
type MegaMenuColumn = { titleKey: string, items?: MegaMenuLink[], groups?: MegaMenuLink[][] }
type MegaMenuImage = { titleKey: string, altKey: string, src: string }
type MegaMenuConfig = { columns: MegaMenuColumn[], images?: MegaMenuImage[] }
type NavItem = { key: NavKey, menu?: MegaMenuConfig }

const route = useRoute()
const localePath = useLocalePath()
const activeMegaMenuKey = ref<NavKey | null>(null)

const tabs = [
  { key: 'women', to: '/women' },
  { key: 'men', to: '/men' },
  { key: 'kids', to: '/kids' },
  { key: 'dogs', to: '/dogs' },
  { key: 'cats', to: '/cats' },
] satisfies Array<{ key: TabKey, to: string }>

const navItems = [
  { key: 'newToday' },
  {
    key: 'clothing',
    menu: {
      columns: [
        {
          titleKey: 'header.mega.clothing.category.title',
          groups: [
            [
              { labelKey: 'header.mega.clothing.category.shopAll' },
              { labelKey: 'header.mega.clothing.category.bestSellers' },
              { labelKey: 'header.mega.clothing.category.foundations' },
              { labelKey: 'header.mega.clothing.category.activewear' },
              { labelKey: 'header.mega.clothing.category.denim' },
              { labelKey: 'header.mega.clothing.category.dresses' },
              { labelKey: 'header.mega.clothing.category.jackets' },
              { labelKey: 'header.mega.clothing.category.jumpsuits' },
              { labelKey: 'header.mega.clothing.category.kids' },
              { labelKey: 'header.mega.clothing.category.lingerie' },
            ],
            [
              { labelKey: 'header.mega.clothing.category.loungewear' },
              { labelKey: 'header.mega.clothing.category.matchingSets' },
              { labelKey: 'header.mega.clothing.category.pants' },
              { labelKey: 'header.mega.clothing.category.rompers' },
              { labelKey: 'header.mega.clothing.category.shorts' },
              { labelKey: 'header.mega.clothing.category.skirts' },
              { labelKey: 'header.mega.clothing.category.sweaters' },
              { labelKey: 'header.mega.clothing.category.swimsuits' },
              { labelKey: 'header.mega.clothing.category.tops' },
              { labelKey: 'header.mega.clothing.category.weddingShop' },
            ],
          ],
        },
        {
          titleKey: 'header.mega.clothing.trending.title',
          items: [
            { labelKey: 'header.mega.clothing.trending.vacayMostWanted' },
            { labelKey: 'header.mega.clothing.trending.bestOfSpring' },
            { labelKey: 'header.mega.clothing.trending.cuteMatchingSets' },
            { labelKey: 'header.mega.clothing.trending.coolGirlCasual' },
            { labelKey: 'header.mega.clothing.trending.resortDresses' },
            { labelKey: 'header.mega.clothing.trending.richGirlVibes' },
            { labelKey: 'header.mega.clothing.trending.westernChic' },
            { labelKey: 'header.mega.clothing.trending.sexyNightOut' },
            { labelKey: 'header.mega.clothing.trending.bestDressedGuest' },
            { labelKey: 'header.mega.clothing.trending.officeApproved' },
            { labelKey: 'header.mega.clothing.trending.itGirlEssentials' },
          ],
        },
      ],
      images: [
        { titleKey: 'header.mega.images.richGirlOutfits.title', altKey: 'header.mega.images.richGirlOutfits.alt', src: '/images/header-mega/rich-girl-outfits.png' },
        { titleKey: 'header.mega.images.summerPreview.title', altKey: 'header.mega.images.summerPreview.alt', src: '/images/header-mega/summer-preview.png' },
      ],
    },
  },
  {
    key: 'dresses',
    menu: {
      columns: [
        {
          titleKey: 'header.mega.dresses.length.title',
          items: [
            { labelKey: 'header.mega.dresses.length.shopAll' },
            { labelKey: 'header.mega.dresses.length.mini' },
            { labelKey: 'header.mega.dresses.length.midi' },
            { labelKey: 'header.mega.dresses.length.maxi' },
            { labelKey: 'header.mega.dresses.length.gowns' },
          ],
        },
        {
          titleKey: 'header.mega.dresses.trending.title',
          items: [
            { labelKey: 'header.mega.dresses.trending.spring' },
            { labelKey: 'header.mega.dresses.trending.chicEvent' },
            { labelKey: 'header.mega.dresses.trending.vacayDays' },
            { labelKey: 'header.mega.dresses.trending.everyday' },
            { labelKey: 'header.mega.dresses.trending.sexyNightOut' },
            { labelKey: 'header.mega.dresses.trending.bumpFriendly' },
            { labelKey: 'header.mega.dresses.trending.floral' },
            { labelKey: 'header.mega.dresses.trending.white' },
          ],
        },
        {
          titleKey: 'header.mega.dresses.occasion.title',
          items: [
            { labelKey: 'header.mega.dresses.occasion.wedding' },
            { labelKey: 'header.mega.dresses.occasion.blackTie' },
            { labelKey: 'header.mega.dresses.occasion.prom' },
            { labelKey: 'header.mega.dresses.occasion.graduation' },
            { labelKey: 'header.mega.dresses.occasion.vacation' },
            { labelKey: 'header.mega.dresses.occasion.nightOut' },
            { labelKey: 'header.mega.dresses.occasion.cocktail' },
            { labelKey: 'header.mega.dresses.occasion.weekend' },
            { labelKey: 'header.mega.dresses.occasion.work' },
            { labelKey: 'header.mega.dresses.occasion.dayEvent' },
            { labelKey: 'header.mega.dresses.occasion.bride' },
            { labelKey: 'header.mega.dresses.occasion.bridesmaid' },
          ],
        },
      ],
      images: [
        { titleKey: 'header.mega.images.vacayNights.title', altKey: 'header.mega.images.vacayNights.alt', src: '/images/header-mega/vacay-nights.png' },
        { titleKey: 'header.mega.images.dressesSeason.title', altKey: 'header.mega.images.dressesSeason.alt', src: '/images/header-mega/dresses-season.png' },
      ],
    },
  },
  { key: 'shoes' },
  {
    key: 'accessories',
    menu: {
      columns: [
        {
          titleKey: 'header.mega.accessories.bags.title',
          items: [
            { labelKey: 'header.mega.common.viewAll' },
            { labelKey: 'header.mega.accessories.bags.clutches' },
            { labelKey: 'header.mega.accessories.bags.crossbody' },
            { labelKey: 'header.mega.accessories.bags.shoulderBags' },
            { labelKey: 'header.mega.accessories.bags.totes' },
            { labelKey: 'header.mega.accessories.bags.travelBags' },
            { labelKey: 'header.mega.accessories.bags.luxuryBags', badgeKey: 'header.mega.common.uandiplus', italic: true },
          ],
        },
        {
          titleKey: 'header.mega.accessories.jewelry.title',
          items: [
            { labelKey: 'header.mega.common.viewAll' },
            { labelKey: 'header.mega.accessories.jewelry.bracelets' },
            { labelKey: 'header.mega.accessories.jewelry.earrings' },
            { labelKey: 'header.mega.accessories.jewelry.necklaces' },
            { labelKey: 'header.mega.accessories.jewelry.rings' },
            { labelKey: 'header.mega.accessories.jewelry.fineJewelry' },
            { labelKey: 'header.mega.accessories.jewelry.luxuryJewelry', badgeKey: 'header.mega.common.uandiplus', italic: true },
          ],
        },
        {
          titleKey: 'header.mega.accessories.accessories.title',
          items: [
            { labelKey: 'header.mega.common.viewAll' },
            { labelKey: 'header.mega.accessories.accessories.belts' },
            { labelKey: 'header.mega.accessories.accessories.hatsHair' },
            { labelKey: 'header.mega.accessories.accessories.sunglasses' },
            { labelKey: 'header.mega.accessories.accessories.travel' },
            { labelKey: 'header.mega.accessories.accessories.luxuryAccessories', badgeKey: 'header.mega.common.uandiplus', italic: true },
          ],
        },
        {
          titleKey: 'header.mega.accessories.home.title',
          items: [
            { labelKey: 'header.mega.common.viewAll' },
            { labelKey: 'header.mega.accessories.home.bath' },
            { labelKey: 'header.mega.accessories.home.candles' },
            { labelKey: 'header.mega.accessories.home.kitchen' },
            { labelKey: 'header.mega.accessories.home.outdoor' },
            { labelKey: 'header.mega.accessories.home.mothersDay' },
          ],
        },
      ],
      images: [
        { titleKey: 'header.mega.images.mothersDayGifts.title', altKey: 'header.mega.images.mothersDayGifts.alt', src: '/images/header-mega/mothers-day-gifts.png' },
      ],
    },
  },
  { key: 'designers' },
  { key: 'stores' },
  { key: 'hotList' },
  { key: 'sale' },
] satisfies NavItem[]

function normalizePath(path: string): string {
  return path.replace(/^\/(en|es)(?=\/)/, '').replace(/\/$/, '') || '/'
}

function isActiveTab(path: string): boolean {
  return normalizePath(route.path) === path
}

const activeMegaMenu = computed(() => {
  return navItems.find(item => item.key === activeMegaMenuKey.value)?.menu
})
// esto es para forzar el estado activo
// const forcedMegaMenuKey = computed(() => {
//   const value = route.query.megaMenu
//
//   if (typeof value !== 'string')
//     return null
//
//   const item = navItems.find(navItem => navItem.key === value && navItem.menu)
//
//   return item?.key ?? null
// })

function openMegaMenu(item: NavItem): void {
  // esto es para forzar el estado activo
  // if (forcedMegaMenuKey.value)
  //   return

  activeMegaMenuKey.value = item.menu ? item.key : null
}

function closeMegaMenu(): void {
  // esto es para forzar el estado activo
  // if (forcedMegaMenuKey.value)
  //   return

  activeMegaMenuKey.value = null
}
// esto es para forzar el estado activo
// watchEffect(() => {
//   if (forcedMegaMenuKey.value)
//     activeMegaMenuKey.value = forcedMegaMenuKey.value
// })
</script>

<template>
  <header>
    <div class="fixed inset-x-0 top-0 z-50 border-b border-[#e8e8e8] bg-white text-black">
      <div class="hidden h-[63px] grid-cols-[1fr_auto_1fr] items-start px-[288px] pt-[21px] lg:grid">
        <nav class="flex items-center gap-[18px] pt-px text-[12px] font-semibold leading-none">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.key"
            :to="localePath(tab.to)"
            class="capitalize text-[#6d6d6d]"
            :class="isActiveTab(tab.to) && 'border-b border-black pb-[3px] text-black'"
          >
            {{ $t(`header.tabs.${tab.key}`) }}
          </NuxtLink>
        </nav>

        <a
          href="#"
          aria-label="uandiplus"
          class="font-serif text-[28px] font-bold leading-none tracking-[0.24em]"
        >
         <Icon name="icon:uandi" size="40"></Icon>
        </a>

        <div class="flex items-center justify-end gap-[21px] pt-[-1px] text-[16px] font-bold leading-none">
          <a href="#" :aria-label="$t('header.actions.cart')" class="pt-px">
            <Icon name="icon:shoping-cart" class="size-[25px]" />
          </a>

          <a href="#" :aria-label="$t('header.actions.language')" class="flex items-center gap-[6px]">
            <Icon name="icon:globe-light" class="size-[26px]" />
            <span>{{ $t('header.actions.currency') }}</span>
          </a>

          <NuxtLink :to="localePath('/login')" class="text-[16px] font-bold">
            {{ $t('header.actions.login') }}
          </NuxtLink>
        </div>
      </div>

      <div
        class="hidden lg:block"
        @mouseenter.stop
        @mouseleave="closeMegaMenu"
      >
        <nav class="flex h-[41px] items-center justify-center gap-[34px] text-[15px] font-bold uppercase leading-none tracking-[0.16em]">
          <div
            v-for="item in navItems"
            :key="item.key"
            class="flex h-full items-center"
            @mouseenter="openMegaMenu(item)"
          >
            <a
              href="#"
              class="border-b border-transparent pb-[8px] pt-[8px] whitespace-nowrap"
              :class="activeMegaMenuKey === item.key && 'border-black'"
            >
              {{ $t(`header.nav.${item.key}`) }}
            </a>
          </div>
        </nav>

        <MegaMenu
          v-if="activeMegaMenu"
          :columns="activeMegaMenu.columns"
          :images="activeMegaMenu.images"
        />
      </div>

      <div class="lg:hidden">
        <div class="flex h-[58px] items-center justify-between bg-white pl-[15px] pr-[15px]">
          <div class="flex min-w-0 items-center gap-[12px]">
            <a href="#" :aria-label="$t('header.actions.menu')" class="flex size-[21px] items-center justify-center">
              <Icon name="icon:menu" class="size-[21px]" />
            </a>

            <a
              href="#"
              aria-label="U&I"
              class="flex items-center"
            >
              <Icon name="icon:uandi" size="40" />
            </a>
          </div>

          <div class="flex items-center gap-[15px]">
            <a href="#" :aria-label="$t('header.actions.cart')">
              <Icon name="icon:shoping-cart" class="size-[25px]" />
            </a>

            <a href="#" :aria-label="$t('header.actions.language')" class="flex items-center gap-[4px] text-[13px] font-bold">
              <Icon name="icon:globe-light" class="size-[24px]" />
              <span>{{ $t('header.actions.currency') }}</span>
            </a>

            <NuxtLink :to="localePath('/login')" class="text-[13px] font-bold">
              {{ $t('header.actions.login') }}
            </NuxtLink>
          </div>
        </div>

        <nav class="flex h-[41px] items-center gap-[26px] overflow-hidden bg-black px-[20px] text-[14px] font-bold uppercase leading-none tracking-[0.15em] text-white">
          <a
            v-for="item in navItems"
            :key="item.key"
            href="#"
            class="shrink-0 whitespace-nowrap"
          >
            {{ $t(`header.nav.${item.key}`) }}
          </a>
        </nav>
      </div>
    </div>

    <div class="h-[99px] lg:h-[104px]" aria-hidden="true" />
  </header>
</template>
