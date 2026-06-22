<script setup lang="ts">
import HeaderSearch from '~/components/header/HeaderSearch.vue'
import MegaMenu from '~/components/header/MegaMenu.vue'
import type { CatalogNavigationColumn, CatalogNavigationItem, CatalogNavigationMenuLink } from '~/types/catalog-navigation'

const route = useRoute()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { locale } = useI18n()
const { itemCount } = useDesignCart()
const { authReady, displayName, hydrateAuth, isAuthenticated, logout } = useStorefrontAuth()
interface MobileNavLink {
  label: string
  url: string
  isClickable: boolean
  children: MobileNavLink[]
}

interface MobileNavPanel {
  title: string
  backLabel: string
  links: MobileNavLink[]
}

const activeMegaMenuKey = shallowRef<string | null>(null)
const isUserMenuOpen = shallowRef(false)
const isMobileMenuOpen = shallowRef(false)
const mobileActiveMainItem = shallowRef<CatalogNavigationItem | null>(null)
const mobileNavStack = shallowRef<MobileNavPanel[]>([])
const mobileNavGoingBack = shallowRef(false)
const logoutPending = shallowRef(false)
const userMenuRef = shallowRef<HTMLElement | null>(null)
const { items: navItems, menuForItem, subColumnsFor } = useCatalogNavigationTree()
const { activeCategoryPath } = useActiveNavigation()

function normalizePath(path: string): string {
  return path.replace(/^\/(en|es)(?=\/)/, '').replace(/\/$/, '') || '/'
}

// La ruta usada para resolver el estado activo del nav. En la página de producto
// (`/products/{slug}`) la URL no refleja la categoría, así que usamos la última
// categoría navegada para no perder la sección (p. ej. Men > New).
const activeNavPath = computed(() => {
  const routePath = normalizePath(route.path)

  if (routePath.startsWith('/products') && activeCategoryPath.value)
    return `/${activeCategoryPath.value}`

  return routePath
})

function normalizeUrlPath(url: string): string {
  return url.replace(/^\/+/, '').replace(/\/+$/, '')
}

function itemKey(item: CatalogNavigationItem): string {
  return String(item.id ?? item.path)
}

function linkTarget(url: string): string {
  if (/^https?:\/\//.test(url))
    return url

  return localePath(url)
}

function isActiveNavigationItem(item: CatalogNavigationItem): boolean {
  const currentPath = activeNavPath.value
  const itemPath = normalizePath(item.url)

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

const nextLocale = computed(() => locale.value === 'es' ? 'en' : 'es')

const nextLocalePath = computed(() => switchLocalePath(nextLocale.value))

const nextLocaleLabel = computed(() => nextLocale.value.toUpperCase())

const activeMainItem = computed(() => {
  return navItems.value.find(isActiveNavigationItem) ?? navItems.value[0] ?? null
})

const mobileSubNavigationItems = computed<CatalogNavigationColumn[]>(() => subColumnsFor(mobileActiveMainItem.value))

const forcedMegaMenuValue = computed(() => {
  const rawValue = route.query.nav ?? route.query.menu ?? route.query.activeNav
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue

  return typeof value === 'string' ? normalizeUrlPath(value) : ''
})

const isMegaMenuForced = computed(() => Boolean(forcedMegaMenuValue.value))

const activeMegaMenu = computed(() => {
  if (!activeMegaMenuKey.value) return null
  const item = navItems.value.find(item => itemKey(item) === activeMegaMenuKey.value)
  if (!item) return null
  return menuForItem(item)
})

function itemCanNavigate(item: CatalogNavigationItem): boolean {
  return catalogNavigationState(item).canNavigate
}

function itemHasDropdown(item: CatalogNavigationItem): boolean {
  return catalogNavigationState(item).hasChildren
}

function openMegaMenuForItem(item: CatalogNavigationItem): void {
  cancelMegaMenuClose()
  const hasMenuContent = Boolean(menuForItem(item)?.columns?.length)
  activeMegaMenuKey.value = hasMenuContent ? itemKey(item) : null
}

function matchesForcedMegaMenuItem(item: CatalogNavigationItem): boolean {
  const forcedValue = forcedMegaMenuValue.value
  if (!forcedValue) return false
  const normalized = normalizeUrlPath(item.url)
  return normalized === forcedValue || normalized.endsWith(`/${forcedValue}`)
}

function toggleMegaMenuForItem(item: CatalogNavigationItem): void {
  if (activeMegaMenuKey.value === itemKey(item)) {
    closeMegaMenu()
    return
  }

  openMegaMenuForItem(item)
}

let megaMenuCloseTimer: ReturnType<typeof setTimeout> | null = null

function scheduleMegaMenuClose(): void {
  if (isMegaMenuForced.value) return
  megaMenuCloseTimer = setTimeout(() => {
    activeMegaMenuKey.value = null
    megaMenuCloseTimer = null
  }, 150)
}

function cancelMegaMenuClose(): void {
  if (megaMenuCloseTimer) {
    clearTimeout(megaMenuCloseTimer)
    megaMenuCloseTimer = null
  }
}

function closeMegaMenu(): void {
  cancelMegaMenuClose()
  if (isMegaMenuForced.value) return
  activeMegaMenuKey.value = null
}

function menuLinkToNavLink(link: CatalogNavigationMenuLink): MobileNavLink {
  return {
    label: link.label,
    url: link.url,
    isClickable: link.isClickable,
    children: (link.children ?? []).map(menuLinkToNavLink),
  }
}

function columnToNavLinks(column: CatalogNavigationColumn): MobileNavLink[] {
  return (column.items ?? []).map(menuLinkToNavLink)
}

const currentMobilePanel = computed<MobileNavPanel | null>(() =>
  mobileNavStack.value.length > 0
    ? mobileNavStack.value[mobileNavStack.value.length - 1] ?? null
    : null,
)

function mobileOpenColumn(column: CatalogNavigationColumn): void {
  const links = columnToNavLinks(column)
  if (!links.length) return
  mobileNavGoingBack.value = false
  mobileNavStack.value = [{
    title: column.title,
    backLabel: mobileActiveMainItem.value?.name ?? '',
    links,
  }]
}

function mobileOpenLink(link: MobileNavLink): void {
  if (!link.children.length) return
  mobileNavGoingBack.value = false
  const current = mobileNavStack.value[mobileNavStack.value.length - 1]
  mobileNavStack.value = [...mobileNavStack.value, {
    title: link.label,
    backLabel: current?.title ?? '',
    links: link.children,
  }]
}

function mobileNavBack(): void {
  mobileNavGoingBack.value = true
  mobileNavStack.value = mobileNavStack.value.slice(0, -1)
}

function setMobileSection(item: CatalogNavigationItem): void {
  mobileActiveMainItem.value = item
  mobileNavStack.value = []
  mobileNavGoingBack.value = false
}

async function handleLogout(): Promise<void> {
  if (logoutPending.value)
    return

  isUserMenuOpen.value = false
  logoutPending.value = true

  try {
    await logout()
    await navigateTo(localePath('/'))
  } finally {
    logoutPending.value = false
  }
}

watch(activeMainItem, () => {
  closeMegaMenu()
})

watch(isMobileMenuOpen, (open) => {
  if (open)
    mobileActiveMainItem.value = activeMainItem.value ?? navItems.value[0] ?? null

  if (!open) {
    mobileNavStack.value = []
    mobileNavGoingBack.value = false
  }

  if (import.meta.client)
    document.body.style.overflow = open ? 'hidden' : ''
})

watch(route, () => {
  isMobileMenuOpen.value = false
  closeMegaMenu()
})

watch(
  [navItems, forcedMegaMenuValue],
  () => {
    if (!forcedMegaMenuValue.value) {
      activeMegaMenuKey.value = null
      return
    }

    const item = navItems.value.find(matchesForcedMegaMenuItem)

    if (item)
      openMegaMenuForItem(item)
  },
  { immediate: true },
)

onClickOutside(userMenuRef, () => {
  isUserMenuOpen.value = false
})

onMounted(() => {
  hydrateAuth()
})
</script>

<template>
  <header>
    <div class="fixed inset-x-0 top-0 z-50 border-b border-[#e8e8e8] bg-white text-black">
      <div class="hidden h-[63px] grid-cols-[1fr_auto_1fr] items-start px-[288px] pt-[21px] lg:grid">
        <div aria-hidden="true" />

        <NuxtLink
          :to="localePath('/')"
          aria-label="uandiplus"
          class="font-serif text-[28px] font-bold leading-none tracking-[0.24em]"
        >
          <client-only>
            <svg width="50" height="41" viewBox="0 0 50 41" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.1217 37.809V38.1107H11.5489H10.9182C10.6286 38.1107 10.3793 37.9966 10.1695 37.7653C9.95793 37.5388 9.85377 37.2659 9.85377 36.9524V36.7375C9.85377 36.6802 9.82678 36.6517 9.77558 36.6517H9.69664C9.0127 37.0808 8.30353 37.4232 7.56913 37.6811C7.14822 37.8248 6.70757 37.9319 6.24794 38.0036C5.78781 38.0737 5.3734 38.1107 5.0057 38.1107C4.40119 38.1107 3.84888 38.0244 3.35053 37.8527C2.82496 37.6813 2.37733 37.4093 2.01037 37.0383C1.64167 36.6376 1.34017 36.1366 1.10486 35.536C0.867299 34.9362 0.749645 34.2057 0.749645 33.3482V23.5655V23.4366V21.292V20.7343C0.749645 20.3628 0.578278 20.1763 0.236305 20.1763H0V19.8763H4.5728H5.20328C5.49205 19.8763 5.73985 19.9906 5.95118 20.2189C6.16226 20.4481 6.26817 20.7343 6.26817 21.0778V22.2788V23.4796V24.123V34.1631C6.26817 34.964 6.39857 35.6066 6.66061 36.0926C6.89816 36.4949 7.21315 36.7521 7.60683 36.8673C7.9488 36.9522 8.34249 36.9242 8.78988 36.7801C9.02669 36.6947 9.22278 36.6089 9.38165 36.5219C9.53853 36.4664 9.65668 36.3591 9.73612 36.2004C9.8143 36.0438 9.85377 35.8777 9.85377 35.7068V23.4364V21.2918V20.7341C9.85377 20.3625 9.68315 20.1761 9.34218 20.1761H9.06616V19.8761H13.6779H14.2692C14.5844 19.8761 14.8462 19.9903 15.0566 20.2187C15.2664 20.4479 15.3721 20.7341 15.3721 21.0776V22.2786V23.4794V33.5619V36.6945V37.2518C15.3721 37.6233 15.5427 37.8086 15.8854 37.8086H16.1217V37.809Z" fill="#C10505"/>
              <path d="M37.344 21.3015V34.3743V34.8761V37.252C37.344 37.6485 37.4924 37.8467 37.7876 37.8467H37.977V38.1673H32.3156V37.8467H32.5052C32.7792 37.8467 32.9163 37.6485 32.9163 37.252V34.8761V34.3743V23.5856V20.2501V19.6565C32.9163 19.2614 32.7792 19.0616 32.5052 19.0616H32.3156V18.7421H35.9846H36.4899C36.7228 18.7421 36.9218 18.864 37.091 19.1083C37.2606 19.3521 37.344 19.6566 37.344 20.0218V21.3015ZM36.458 13.8633C36.0531 13.4559 35.5642 13.2519 34.9912 13.2519C34.4176 13.2519 33.9288 13.4559 33.5236 13.8633C33.1187 14.2704 32.9161 14.7622 32.9161 15.3387C32.9161 15.9149 33.1187 16.4076 33.5236 16.8145C33.9288 17.2223 34.4176 17.4261 34.9912 17.4261C35.5642 17.4261 36.0531 17.2223 36.458 16.8145C36.8629 16.4076 37.067 15.9149 37.067 15.3387C37.067 14.7622 36.8629 14.2704 36.458 13.8633Z" fill="#C10505"/>
              <path d="M34.827 19.5899H33V34.595C33 36.1886 32.14 37.5543 30.4204 38.6934C28.701 39.8333 26.6234 40.4031 24.1869 40.4031C21.7746 40.4031 19.703 39.8333 17.9714 38.6934C16.2413 37.5543 15.3745 36.1886 15.3745 34.595V24.3693C15.3745 21.9427 17.0944 20.1736 20.5334 19.0616C17.0942 18.0246 15.3745 16.2653 15.3745 13.783V5.80762C15.3745 4.21426 16.2413 2.84876 17.9714 1.70902C19.703 0.569752 21.7746 0 24.1869 0C26.6234 0 28.701 0.569752 30.4204 1.70902C32.14 2.84876 33 4.21426 33 5.80762V12.2264H27.1238V3.30678C27.1238 2.67735 26.8373 2.13975 26.264 1.69514C25.6922 1.25077 24.9992 1.02824 24.1872 1.02824C23.3751 1.02824 22.6824 1.25077 22.1091 1.69514C21.5361 2.13975 21.249 2.67735 21.249 3.30678V16.2829C21.249 16.9128 21.5361 17.4504 22.1091 17.895C22.6824 18.3396 23.3751 18.5619 24.1872 18.5619H34.8275V19.5899H34.827ZM27.1235 37.0963V19.5897H24.1867C23.3746 19.5897 22.6819 19.8122 22.1086 20.2566C21.5356 20.701 21.2485 21.2388 21.2485 21.868V37.0963C21.2485 37.726 21.5356 38.264 22.1086 38.7086C22.6819 39.153 23.3746 39.3751 24.1867 39.3751C24.9988 39.3751 25.6917 39.153 26.2635 38.7086C26.837 38.264 27.1235 37.726 27.1235 37.0963Z" fill="black"/>
              <path d="M37.3493 18.5744H27.2637V19.9358H37.3493V18.5744Z" fill="black"/>
              <path d="M46.2191 11.5526V14.5031H50V16.1363H46.2191V19.1002H44.1357V16.1363H40.3383V14.5031H44.1357V11.5526H46.2191Z" fill="#C10505"/>
            </svg>
          </client-only>
        </NuxtLink>

        <div class="flex items-center justify-end gap-5 pt-[-1px] text-[16px] font-bold leading-none">
          <HeaderSearch />
          <NuxtLink :to="localePath('/account/cart')" :aria-label="$t('header.actions.cart')" class="relative pt-px">
            <Icon name="icon:shopping-cart" class="size-6" />
            <span
              v-if="itemCount"
              class="absolute -right-2 -top-2 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold leading-none text-white"
            >
              {{ itemCount }}
            </span>
          </NuxtLink>

          <NuxtLink :to="nextLocalePath" :aria-label="$t('header.actions.language')" class="flex items-center gap-[6px]">
            <Icon name="icon:globe-light" class="size-[26px]" />
            <span>{{ nextLocaleLabel }}</span>
          </NuxtLink>

          <div
            v-if="authReady && isAuthenticated"
            ref="userMenuRef"
            class="relative"
          >
            <button
              type="button"
              class="inline-flex max-w-[190px] items-center gap-[6px] text-[16px] font-bold leading-none"
              :aria-expanded="isUserMenuOpen"
              aria-haspopup="menu"
              @click="isUserMenuOpen = !isUserMenuOpen"
            >
              <span class="truncate">{{ displayName || $t('header.user.account') }}</span>
              <Icon
                name="ph:caret-down"
                class="size-[14px] shrink-0 transition"
                :class="isUserMenuOpen ? 'rotate-180' : ''"
              />
            </button>

            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 top-[calc(100%+14px)] z-[80] w-44 overflow-hidden border border-[#d7d7d7] bg-white py-2 text-[14px] font-semibold shadow-[0_18px_40px_rgba(17,19,20,0.12)]"
              role="menu"
            >
              <NuxtLink
                :to="localePath('/account/orders')"
                class="flex items-center gap-2 px-4 py-2 hover:bg-[#f5f5f3]"
                role="menuitem"
                @click="isUserMenuOpen = false"
              >
                <Icon name="icon:package" class="size-[16px]" />
                <span>{{ $t('header.user.orders') }}</span>
              </NuxtLink>
              <button
                type="button"
                class="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-[#f5f5f3] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="logoutPending"
                role="menuitem"
                @click="handleLogout"
              >
                <Icon name="icon:sign-out" class="size-[16px]" />
                <span>{{ logoutPending ? $t('header.user.loggingOut') : $t('header.user.logout') }}</span>
              </button>
            </div>
          </div>

          <NuxtLink
            v-else-if="authReady"
            :to="localePath('/login')"
            class="text-[16px] font-bold"
          >
            {{ $t('header.actions.login') }}
          </NuxtLink>
        </div>
      </div>

      <div
        class="hidden lg:block"
        @mouseenter.stop
        @mouseleave="scheduleMegaMenuClose"
      >
        <nav class="hidden h-[41px] min-w-max items-center justify-center gap-[34px] text-[15px] font-bold uppercase leading-none tracking-[0.16em] mt-8 lg:flex">
          <template
            v-for="item in navItems"
            :key="itemKey(item)"
          >
            <NuxtLink
              v-if="itemCanNavigate(item)"
              :to="linkTarget(item.url)"
              class="text-[#6d6d6d]"
              :class="activeMainItem && itemKey(activeMainItem) === itemKey(item) && 'border-b-2 border-black pb-2 text-black'"
              @mouseenter="openMegaMenuForItem(item)"
              @focus="openMegaMenuForItem(item)"
            >
              {{ item.name }}
            </NuxtLink>
            <button
              v-else-if="itemHasDropdown(item)"
              type="button"
              class="text-[#6d6d6d]"
              :class="activeMegaMenuKey === itemKey(item) && 'border-b-2 border-black pb-2 text-black'"
              :aria-expanded="activeMegaMenuKey === itemKey(item)"
              aria-haspopup="true"
              @mouseenter="openMegaMenuForItem(item)"
              @focus="openMegaMenuForItem(item)"
              @click="toggleMegaMenuForItem(item)"
            >
              {{ item.name }}
            </button>
            <span v-else class="text-[#6d6d6d]">
              {{ item.name }}
            </span>
          </template>
        </nav>

        <Transition name="mega-menu">
          <MegaMenu
            v-if="activeMegaMenu"
            :columns="activeMegaMenu.columns"
            @mouseenter="cancelMegaMenuClose"
            @mouseleave="scheduleMegaMenuClose"
          />
        </Transition>
      </div>

      <div class="lg:hidden">
        <div class="flex h-[58px] items-center justify-between bg-white pl-[15px] pr-[15px]">
          <div class="flex min-w-0 items-center gap-[12px]">
            <button type="button" :aria-label="$t('header.actions.menu')" class="flex size-[21px] items-center justify-center" @click="isMobileMenuOpen = true">
              <Icon name="icon:menu" class="size-[21px]" />
            </button>

            <NuxtLink
              :to="localePath('/')"
              aria-label="U&I"
              class="flex items-center"
            >
              <Icon name="icon:uandi" size="40" />
            </NuxtLink>
          </div>

          <div class="flex items-center gap-[15px]">
            <NuxtLink :to="localePath('/account/cart')" :aria-label="$t('header.actions.cart')" class="relative">
              <Icon name="icon:shopping-cart" class="size-[25px]" />
              <span
                v-if="itemCount"
                class="absolute -right-2 -top-2 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold leading-none text-white"
              >
                {{ itemCount }}
              </span>
            </NuxtLink>

            <NuxtLink :to="nextLocalePath" :aria-label="$t('header.actions.language')" class="flex items-center gap-[4px] text-[13px] font-bold">
              <Icon name="icon:globe-light" class="size-[24px]" />
              <span>{{ nextLocaleLabel }}</span>
            </NuxtLink>

            <div
              v-if="authReady && isAuthenticated"
              ref="userMenuRef"
              class="relative"
            >
              <button
                type="button"
                class="inline-flex max-w-[110px] items-center gap-[4px] text-[13px] font-bold"
                :aria-expanded="isUserMenuOpen"
                aria-haspopup="menu"
                @click="isUserMenuOpen = !isUserMenuOpen"
              >
                <span class="truncate">{{ displayName || $t('header.user.account') }}</span>
                <Icon
                  name="ph:caret-down"
                  class="size-[13px] shrink-0 transition"
                  :class="isUserMenuOpen ? 'rotate-180' : ''"
                />
              </button>

              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 top-[calc(100%+12px)] z-[80] w-40 overflow-hidden border border-[#d7d7d7] bg-white py-2 text-[13px] font-semibold text-black shadow-[0_18px_40px_rgba(17,19,20,0.12)]"
                role="menu"
              >
                <NuxtLink
                  :to="localePath('/account/orders')"
                  class="flex items-center gap-2 px-4 py-2 hover:bg-[#f5f5f3]"
                  role="menuitem"
                  @click="isUserMenuOpen = false"
                >
                  <Icon name="icon:package" class="size-[15px]" />
                  <span>{{ $t('header.user.orders') }}</span>
                </NuxtLink>
                <button
                  type="button"
                  class="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-[#f5f5f3] disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="logoutPending"
                  role="menuitem"
                  @click="handleLogout"
                >
                  <Icon name="icon:sign-out" class="size-[15px]" />
                  <span>{{ logoutPending ? $t('header.user.loggingOut') : $t('header.user.logout') }}</span>
                </button>
              </div>
            </div>

            <NuxtLink
              v-else-if="authReady"
              :to="localePath('/login')"
              class="text-[13px] font-bold"
            >
              {{ $t('header.actions.login') }}
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>

    <div class="h-[58px] lg:h-[136px]" aria-hidden="true" />
  </header>

  <Teleport to="body">
    <Transition name="mobile-overlay">
      <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[60] bg-black/50" @click="isMobileMenuOpen = false" />
    </Transition>

    <Transition name="mobile-drawer">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-y-0 left-0 z-[70] flex w-[85%] max-w-[360px] flex-col overflow-hidden bg-white"
        role="dialog"
        :aria-label="$t('header.actions.menu')"
      >
        <!-- Drawer header -->
        <div class="flex shrink-0 items-center justify-between bg-black px-4 py-3.5">
          <NuxtLink
            v-if="!isAuthenticated"
            :to="localePath('/login')"
            class="text-[13px] font-semibold text-white"
            @click="isMobileMenuOpen = false"
          >
            {{ $t('header.mobile.signIn') }}
          </NuxtLink>
          <span v-else class="max-w-[200px] truncate text-[13px] font-semibold text-white">
            {{ displayName || $t('header.user.account') }}
          </span>
          <button
            type="button"
            :aria-label="$t('header.mobile.close')"
            class="ml-4 shrink-0 text-white"
            @click="isMobileMenuOpen = false"
          >
            <Icon name="ph:x" class="size-[18px]" />
          </button>
        </div>

        <!-- Search -->
        <div class="shrink-0 border-b border-[#e8e8e8] px-4 py-3">
          <HeaderSearch :full-width="true" />
        </div>

        <!-- Main nav tabs -->
        <div class="flex shrink-0 border-b border-[#e8e8e8]">
          <template
            v-for="item in navItems"
            :key="itemKey(item)"
          >
            <div
              v-if="itemHasDropdown(item)"
              class="flex flex-1 items-center justify-center border-b-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
              :class="mobileActiveMainItem && itemKey(mobileActiveMainItem) === itemKey(item)
                ? 'border-black text-black'
                : 'border-transparent text-[#8c8c8c]'"
            >
              <NuxtLink
                v-if="itemCanNavigate(item)"
                :to="linkTarget(item.url)"
                class="py-3.5"
                @click="isMobileMenuOpen = false"
              >
                {{ item.name }}
              </NuxtLink>
              <button
                type="button"
                class="flex items-center py-3.5"
                :class="itemCanNavigate(item) ? 'ml-1' : ''"
                :aria-label="itemCanNavigate(item) ? item.name : undefined"
                aria-haspopup="true"
                @click="setMobileSection(item)"
              >
                <span v-if="!itemCanNavigate(item)">{{ item.name }}</span>
                <Icon v-else name="ph:caret-down" class="size-[11px]" />
              </button>
            </div>
            <NuxtLink
              v-else-if="itemCanNavigate(item)"
              :to="linkTarget(item.url)"
              class="flex-1 border-b-2 border-transparent py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8c8c8c]"
              @click="isMobileMenuOpen = false"
            >
              {{ item.name }}
            </NuxtLink>
            <span
              v-else
              class="flex-1 border-b-2 border-transparent py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8c8c8c]"
            >
              {{ item.name }}
            </span>
          </template>
        </div>

        <!-- Multi-level nav panels -->
        <div class="relative flex-1 overflow-hidden">
          <Transition :name="mobileNavGoingBack ? 'mobile-panel-back' : 'mobile-panel-forward'">
            <!-- Level 0: section columns -->
            <div
              v-if="!currentMobilePanel"
              key="level-0"
              class="absolute inset-0 overflow-y-auto divide-y divide-[#efefef]"
            >
              <div
                v-for="column in mobileSubNavigationItems"
                :key="column.url ?? column.title"
              >
                <div
                  v-if="columnToNavLinks(column).length"
                  class="flex w-full items-center justify-between px-4 py-4 text-[14px] text-[#222]"
                >
                  <NuxtLink
                    v-if="column.isClickable && column.url"
                    :to="linkTarget(column.url)"
                    @click="isMobileMenuOpen = false"
                  >
                    {{ column.title }}
                  </NuxtLink>
                  <span v-else>{{ column.title }}</span>
                  <button type="button" class="p-1" :aria-label="column.title" @click="mobileOpenColumn(column)">
                    <Icon name="ph:caret-right" class="size-[14px] shrink-0 text-[#bbb]" />
                  </button>
                </div>

                <NuxtLink
                  v-else-if="column.isClickable && column.url"
                  :to="linkTarget(column.url ?? '/')"
                  class="flex items-center px-4 py-4 text-[14px] text-[#222]"
                  @click="isMobileMenuOpen = false"
                >
                  {{ column.title }}
                </NuxtLink>
                <span
                  v-else
                  class="flex items-center px-4 py-4 text-[14px] text-[#222]"
                >
                  {{ column.title }}
                </span>
              </div>
            </div>

            <!-- Level 1+: deep panel -->
            <div
              v-else
              :key="`panel-${mobileNavStack.length}`"
              class="absolute inset-0 flex flex-col"
            >
              <!-- Back button -->
              <button
                type="button"
                class="flex shrink-0 items-center gap-1.5 bg-[#f5f5f3] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#444]"
                @click="mobileNavBack"
              >
                <Icon name="ph:caret-left" class="size-[11px]" />
                {{ currentMobilePanel.backLabel }}
              </button>

              <!-- Panel title -->
              <h2 class="shrink-0 px-4 pb-3 pt-4 text-[18px] font-bold uppercase leading-tight tracking-[0.08em]">
                {{ currentMobilePanel.title }}
              </h2>

              <!-- Links -->
              <div class="flex-1 overflow-y-auto divide-y divide-[#efefef]">
                <div
                  v-for="link in currentMobilePanel.links"
                  :key="link.url"
                >
                  <div
                    v-if="link.children.length"
                    class="flex w-full items-center justify-between px-4 py-4 text-[14px] text-[#222]"
                  >
                    <NuxtLink
                      v-if="link.isClickable"
                      :to="linkTarget(link.url)"
                      @click="isMobileMenuOpen = false"
                    >
                      {{ link.label }}
                    </NuxtLink>
                    <span v-else>{{ link.label }}</span>
                    <button type="button" class="p-1" :aria-label="link.label" @click="mobileOpenLink(link)">
                      <Icon name="ph:caret-right" class="size-[14px] shrink-0 text-[#bbb]" />
                    </button>
                  </div>

                  <NuxtLink
                    v-else-if="link.isClickable"
                    :to="linkTarget(link.url)"
                    class="flex items-center px-4 py-4 text-[14px] text-[#222]"
                    @click="isMobileMenuOpen = false"
                  >
                    {{ link.label }}
                  </NuxtLink>
                  <span
                    v-else
                    class="flex items-center px-4 py-4 text-[14px] text-[#222]"
                  >
                    {{ link.label }}
                  </span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mobile-overlay-enter-active,
.mobile-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.mobile-overlay-enter-from,
.mobile-overlay-leave-to {
  opacity: 0;
}

.mobile-drawer-enter-active,
.mobile-drawer-leave-active {
  transition: transform 0.25s ease;
}
.mobile-drawer-enter-from,
.mobile-drawer-leave-to {
  transform: translateX(-100%);
}

/* Mobile panel: go deeper — nuevo entra desde la derecha, viejo se desvanece */
.mobile-panel-forward-enter-active {
  transition: transform 0.28s ease;
  position: absolute;
  inset: 0;
}
.mobile-panel-forward-leave-active {
  transition: opacity 0.14s ease;
  position: absolute;
  inset: 0;
}
.mobile-panel-forward-enter-from { transform: translateX(100%); }
.mobile-panel-forward-leave-to   { opacity: 0; }

/* Mobile panel: regresar — viejo sale a la derecha, nuevo aparece con fade */
.mobile-panel-back-leave-active {
  transition: transform 0.28s ease;
  position: absolute;
  inset: 0;
}
.mobile-panel-back-enter-active {
  transition: opacity 0.14s ease 0.14s;
  position: absolute;
  inset: 0;
}
.mobile-panel-back-leave-to   { transform: translateX(100%); }
.mobile-panel-back-enter-from { opacity: 0; }

.mega-menu-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.mega-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.mega-menu-enter-from,
.mega-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
