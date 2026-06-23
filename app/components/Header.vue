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
            <svg width="202" height="35" viewBox="0 0 202 35" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M201.57 0H117.8V34.556H201.57V0Z" fill="#B20000"/>
              <path d="M118.848 0H0V34.556H118.848V0Z" fill="black"/>
              <path d="M4.86099 11.2181L5.448 9.05609C5.486 8.76909 5.53798 8.5861 5.60498 8.5051C5.67198 8.4241 5.74798 8.38312 5.83398 8.38312C6.00598 8.38312 6.20099 8.58811 6.42099 8.99811C6.58299 9.29411 6.71699 9.48311 6.82199 9.56311C6.92699 9.64511 7.08 9.69912 7.28 9.72812L7.42398 9.7131L8.039 9.77112L11.417 9.81311L15.411 9.7991H16.585L18.804 9.75711C18.899 9.75711 19.019 9.7671 19.162 9.7851C19.811 9.8421 20.212 9.87012 20.365 9.87012C20.508 9.87012 20.623 9.8231 20.708 9.7291C20.737 9.6921 20.895 9.37712 21.181 8.78412C21.305 8.51512 21.458 8.3811 21.639 8.3811C21.715 8.3811 21.811 8.40011 21.926 8.43811C21.973 8.62711 21.997 8.7981 21.997 8.9491L21.983 9.51712L21.997 10.7251C21.997 11.0191 21.973 11.9661 21.926 13.5661C21.926 13.6701 21.906 13.7651 21.868 13.8501C21.763 13.9161 21.672 13.9501 21.596 13.9501C21.52 13.9501 21.453 13.9141 21.396 13.8441C21.338 13.7731 21.267 13.5531 21.181 13.1841C20.99 12.3331 20.751 11.7231 20.465 11.3531C20.274 11.1171 20 10.9461 19.642 10.8421C19.284 10.7381 18.428 10.6861 17.072 10.6861C15.984 10.6861 15.177 10.6861 14.653 10.6861C14.633 11.0681 14.624 11.4171 14.624 11.7321L14.738 20.6301C14.738 20.9841 14.719 21.6521 14.681 22.6361L14.696 24.5421L14.681 25.6021C14.681 25.9361 14.738 26.1761 14.853 26.3191C14.968 26.4621 15.278 26.6011 15.784 26.7341C16.662 26.9541 17.249 27.0881 17.545 27.1351C17.726 27.1551 17.874 27.1931 17.989 27.2501V27.6791L15.956 27.6281C14.839 27.6201 13.999 27.5981 13.436 27.5651L11.346 27.6651L9.814 27.7511C9.384 27.7511 9.122 27.7411 9.026 27.7221L8.82599 27.6361C8.84499 27.4171 8.88799 27.2761 8.95499 27.2141C9.02099 27.1521 9.19801 27.1021 9.48401 27.0641C9.88501 27.0061 10.358 26.9041 10.901 26.7561C11.445 26.6091 11.803 26.4581 11.975 26.3051C12.07 26.2191 12.137 26.0761 12.175 25.8751C12.261 25.4551 12.304 24.6291 12.304 23.3981V20.9641L12.247 15.6531L12.19 14.5071L12.175 10.6851C11.574 10.6851 10.805 10.6851 9.87 10.6851C8.495 10.6851 7.66099 10.7681 7.36499 10.9351C6.89699 11.1941 6.19999 11.9531 5.27499 13.2121C4.96899 13.6841 4.70199 13.9201 4.47299 13.9201L4.34399 13.8911C4.30599 13.8341 4.28699 13.7821 4.28699 13.7341C4.28699 13.6191 4.36299 13.2761 4.51599 12.7031C4.70899 11.9721 4.82299 11.4751 4.86099 11.2181Z" fill="white"/>
              <path d="M26.116 26.9511C27.503 26.7891 28.286 26.6751 28.467 26.6081C28.591 26.5611 28.704 26.4181 28.809 26.1791V26.0221C28.809 25.7841 28.847 24.9211 28.923 23.4331C28.942 23.0131 28.951 22.6031 28.951 22.2031L28.908 20.5001L28.937 18.5691L28.923 14.9791L28.937 12.4052C28.946 11.3182 28.863 10.6551 28.687 10.4161C28.51 10.1781 28.055 10.0091 27.32 9.90915C26.585 9.80815 26.179 9.73513 26.103 9.68713C26.026 9.63913 25.988 9.56313 25.988 9.45813C25.988 9.39113 26.003 9.30513 26.031 9.20013C26.126 9.11413 26.346 9.06613 26.69 9.05713C26.738 9.05713 26.869 9.04515 27.084 9.02115C27.299 8.99815 27.501 8.98514 27.692 8.98514H28.866L32.631 8.94214C34.759 8.94214 36.251 9.10013 37.105 9.41513C37.959 9.73013 38.639 10.2621 39.145 11.0111C39.651 11.7601 39.904 12.5971 39.904 13.5231C39.904 15.2791 38.984 16.6201 37.145 17.5461C36.83 17.7081 36.583 17.8511 36.401 17.9751C36.725 18.6621 37.177 19.4861 37.759 20.4491L39.574 23.5671C40.299 24.7141 40.8 25.4341 41.077 25.7251C41.354 26.0171 41.69 26.2581 42.086 26.4491C42.482 26.6401 43.148 26.8221 44.084 26.9941C44.094 27.0901 44.099 27.1661 44.099 27.2231C44.099 27.2801 44.094 27.3521 44.084 27.4381C42.776 27.4571 41.245 27.4671 39.489 27.4671C39.365 27.4671 39.193 27.4571 38.973 27.4381C38.295 26.1381 37.499 24.7091 36.582 23.1511L34.463 19.2791C34.177 18.8781 33.941 18.6271 33.755 18.5271C33.569 18.4271 33.323 18.3771 33.018 18.3771L31.801 18.3911L31.4 18.3771C31.371 18.6831 31.357 19.3081 31.357 20.2521V25.1481C31.347 25.3291 31.386 25.5831 31.471 25.9071C31.548 26.0881 31.679 26.2341 31.865 26.3441C32.051 26.4541 32.588 26.6181 33.475 26.8381L34.062 26.9811C34.138 27.0761 34.177 27.2051 34.177 27.3671C33.919 27.4151 33.738 27.4391 33.634 27.4391C32.777 27.4391 32.172 27.4291 31.819 27.4101C31.638 27.4011 31.49 27.3961 31.376 27.3961L29.432 27.4251L27.532 27.4101C27.446 27.4101 27.013 27.4251 26.232 27.4531L25.946 27.3961L25.918 27.2531C25.917 27.1661 25.984 27.0651 26.116 26.9511ZM31.428 17.5881C31.686 17.5971 31.877 17.6021 32.001 17.6021C32.689 17.6021 33.48 17.5211 34.377 17.3591C35.007 17.2351 35.518 17.0331 35.909 16.7521C36.3 16.4711 36.627 16.0541 36.89 15.5021C37.152 14.9491 37.284 14.3781 37.284 13.7871C37.284 13.1391 37.078 12.4541 36.668 11.7291C36.353 11.1761 35.821 10.7141 35.072 10.3431C34.322 9.97214 33.423 9.78613 32.373 9.78613C32.116 9.78613 31.781 9.80013 31.371 9.82913C31.333 10.3251 31.314 10.7051 31.314 10.9721L31.386 13.6441L31.371 14.7451C31.371 15.4881 31.39 16.4361 31.428 17.5881Z" fill="white"/>
              <path d="M47.273 27.1761C47.368 27.0931 47.449 27.0411 47.516 27.0231C47.678 26.9751 47.955 26.9371 48.347 26.9081C49.272 26.8501 49.845 26.7651 50.065 26.6501C50.199 26.4591 50.266 26.1911 50.266 25.8471L50.251 24.8441L50.266 21.2021L50.237 19.4811L50.251 15.8821L50.18 11.7951C50.17 10.8201 50.108 10.2701 49.994 10.1461C49.822 9.96409 49.311 9.85909 48.462 9.83109C48.099 9.82209 47.78 9.79309 47.503 9.74509C47.379 9.67809 47.317 9.59209 47.317 9.48709C47.317 9.41109 47.34 9.32009 47.388 9.21509C47.474 9.16809 47.551 9.14307 47.617 9.14307C47.75 9.14307 47.912 9.14808 48.103 9.15808C48.666 9.21508 49.249 9.24408 49.85 9.24408L50.91 9.21509L53.43 9.27206C54.69 9.27206 55.673 9.25806 56.379 9.22906C57.085 9.20106 57.562 9.18607 57.811 9.18607C58.03 9.18607 58.574 9.20608 59.443 9.24408L61.476 9.22906L61.72 9.27206L62.908 9.22906L63.051 9.30109C63.099 9.37809 63.132 9.45907 63.152 9.54407C63.152 9.67807 63.131 9.88306 63.088 10.1601C63.045 10.4371 63.024 10.6091 63.024 10.6761C63.024 11.6691 63.057 12.5081 63.124 13.1961C63.115 13.2531 63.086 13.2911 63.04 13.3101C62.937 13.3101 62.843 13.2961 62.759 13.2671C62.654 13.0861 62.513 12.7661 62.337 12.3081C62.161 11.8501 61.895 11.3201 61.542 10.7191C61.303 10.3181 61.117 10.0791 60.983 10.0031C60.849 9.92608 60.572 9.88806 60.152 9.88806C60.066 9.88806 59.631 9.87907 58.848 9.85907C58.638 9.85007 58.432 9.84506 58.232 9.84506L54.149 9.93106H53.791C53.266 9.93106 52.95 9.99807 52.845 10.1311C52.683 10.3601 52.602 11.0331 52.602 12.1501C52.602 12.2651 52.625 13.4101 52.673 15.5861V17.5761C52.778 17.6051 52.893 17.6191 53.017 17.6191H53.26C53.422 17.6191 53.661 17.6241 53.976 17.6341C54.472 17.6531 54.807 17.6621 54.978 17.6621C55.093 17.6621 55.193 17.6581 55.279 17.6481C56.31 17.6101 57.636 17.5911 59.259 17.5911C59.765 17.5051 60.061 17.4041 60.147 17.2901C60.29 17.1181 60.397 16.6701 60.469 15.9441C60.541 15.2191 60.7 14.8081 60.948 14.7131C61.072 14.7131 61.187 14.7371 61.292 14.7841C61.311 14.8611 61.321 14.9321 61.321 14.9991C61.321 15.0661 61.311 15.1761 61.292 15.3281C61.244 15.6821 61.22 16.7881 61.22 18.6491C61.22 19.1461 61.246 19.6991 61.299 20.3101C61.351 20.9211 61.378 21.2501 61.378 21.2981C61.378 21.3841 61.364 21.4991 61.335 21.6421C61.258 21.6801 61.196 21.6991 61.149 21.6991H61.049C60.896 21.4321 60.748 21.0171 60.605 20.4531C60.356 19.4891 60.097 18.8861 59.825 18.6421C59.553 18.3981 59.112 18.2771 58.501 18.2771C58.367 18.2771 58.124 18.2841 57.771 18.2981C57.417 18.3121 56.893 18.3191 56.196 18.3191H55.265C53.938 18.3191 53.07 18.3481 52.66 18.4051L52.646 18.8781L52.66 21.5171L52.646 23.1811L52.66 24.8011C52.669 25.7771 52.731 26.3411 52.846 26.4931C53.008 26.7031 53.361 26.8081 53.906 26.8081L54.779 26.7941C54.855 26.7941 55.154 26.8011 55.674 26.8151C56.195 26.8291 56.836 26.8361 57.6 26.8361C59.442 26.8361 60.668 26.7571 61.279 26.5991C61.889 26.4411 62.393 26.1611 62.789 25.7591C63.185 25.3571 63.684 24.4901 64.285 23.1591C64.466 22.7661 64.647 22.5701 64.829 22.5701C64.915 22.5701 65.01 22.6081 65.115 22.6841C64.838 23.6291 64.681 24.2491 64.643 24.5451C64.538 25.2131 64.476 25.8961 64.457 26.5921C64.457 26.9071 64.38 27.1701 64.228 27.3801H63.913L59.891 27.4231L58.087 27.4081L53.792 27.4661H52.045C51.825 27.4661 51.62 27.4701 51.429 27.4801C49.711 27.5561 48.447 27.5941 47.636 27.5941C47.493 27.5941 47.395 27.5711 47.343 27.5251C47.29 27.4781 47.264 27.4081 47.264 27.3151L47.273 27.1761Z" fill="white"/>
              <path d="M69.116 9.88614L69.101 9.19913C70.58 9.19913 71.663 9.16114 72.351 9.08414C72.618 9.05614 72.804 9.04114 72.909 9.04114C72.995 9.04114 73.124 9.04612 73.296 9.05612C73.697 9.39012 74.069 9.77214 74.413 10.2011C74.489 10.2871 74.575 10.3832 74.67 10.4872L77.6909 13.8232L78.12 14.3381C78.731 15.0541 79.287 15.6651 79.788 16.1711C80.289 16.6771 81.265 17.7321 82.715 19.3351L86.137 23.1281C86.471 23.5001 86.9 23.9632 87.425 24.5172L87.44 24.2881C87.382 22.9611 87.354 22.2601 87.354 22.1841L87.4109 21.3251L87.382 19.9791V19.3631C87.382 18.9721 87.349 17.7651 87.282 15.7411C87.273 15.4651 87.234 14.9421 87.168 14.1741C87.101 13.4061 87.067 12.7311 87.067 12.1481C87.067 11.0991 87.005 10.4871 86.881 10.3161C86.795 10.1921 86.389 10.0631 85.664 9.92914C85.492 9.92014 85.225 9.89114 84.862 9.84314C84.433 9.82414 84.18 9.80013 84.103 9.77213C84.027 9.74313 83.951 9.66214 83.874 9.52814C83.893 9.37614 83.936 9.23215 84.003 9.09915C84.261 9.02215 84.514 8.98413 84.762 8.98413C85.029 8.98413 85.361 9.01814 85.757 9.08414C86.153 9.15114 86.508 9.18414 86.823 9.18414C87.262 9.18414 87.944 9.15615 88.87 9.09915C89.394 9.06115 89.757 9.04114 89.958 9.04114H90.201L90.173 9.48514C90.02 9.55214 89.81 9.59215 89.543 9.60715C89.275 9.62215 89.027 9.66213 88.798 9.72913C88.454 9.83413 88.249 9.92413 88.182 10.0011C87.953 10.2491 87.839 10.5021 87.839 10.7601L87.996 15.2831L88.111 17.3591L88.096 17.9601L88.182 20.8371C88.24 22.8031 88.268 24.5111 88.268 25.9621C88.268 26.2771 88.249 26.9601 88.211 28.0091L87.544 28.0661C87.21 27.6841 86.0589 26.4821 84.0919 24.4591C83.6339 23.9911 83.3229 23.6621 83.1609 23.4711L81.93 22.0541C81.452 21.5291 81.142 21.1951 80.999 21.0521C80.856 20.9091 80.751 20.8042 80.684 20.7372C79.643 19.5532 78.292 18.0741 76.631 16.2991C76.182 15.8221 75.524 15.0771 74.654 14.0661C74.11 13.4271 73.766 13.0352 73.623 12.8922C73.48 12.7492 73.2839 12.5872 73.0359 12.4052L72.993 12.8922C72.993 14.7532 73.041 17.3211 73.136 20.5941L73.236 25.3321C73.246 25.7331 73.27 26.1201 73.308 26.4921L73.809 26.6061C74.716 26.6921 75.608 26.8211 76.486 26.9931C76.552 27.0501 76.61 27.0931 76.658 27.1221L76.643 27.6661C76.49 27.7141 76.366 27.7381 76.271 27.7381C76.166 27.7381 76.037 27.7281 75.884 27.7091C74.939 27.6321 73.789 27.5941 72.434 27.5941C71.479 27.5941 70.64 27.6181 69.914 27.6661L69.714 27.6801C69.628 27.6801 69.5039 27.6711 69.3419 27.6521L69.327 27.2221L69.7 27.0501L70.373 26.9501C70.974 26.8641 71.413 26.7691 71.69 26.6641C71.871 26.5971 72.019 26.4971 72.134 26.3631C72.239 25.7041 72.291 24.7401 72.291 23.4711C72.291 22.8791 72.277 21.7961 72.248 20.2211V18.2741L72.22 14.2081C72.2 12.3951 72.139 11.3261 72.034 11.0011C71.976 10.8291 71.857 10.6772 71.676 10.5432C71.313 10.2852 70.839 10.1231 70.251 10.0561C69.667 9.99112 69.288 9.93414 69.116 9.88614Z" fill="white"/>
              <path d="M94.61 27.123C94.963 26.971 95.374 26.8701 95.841 26.8221C96.518 26.7461 97.024 26.5831 97.358 26.3351C97.616 25.8101 97.745 24.4731 97.745 22.3231V20.0591L97.774 18.6981L97.745 17.695L97.774 15.847L97.731 11.19C97.731 10.665 97.654 10.3211 97.502 10.1591C97.282 9.92006 96.7 9.70105 95.756 9.49905C95.364 9.41405 95.126 9.33403 95.04 9.26303C94.954 9.19103 94.902 9.05504 94.883 8.85504C95.102 8.80804 95.256 8.78406 95.341 8.78406H96.358L96.888 8.76904C97.241 8.76904 97.632 8.80803 98.062 8.88403C98.94 8.94103 99.841 8.97003 100.767 8.97003C101.035 8.97003 101.416 8.95503 101.913 8.92703C103.23 8.85003 104.175 8.81204 104.748 8.81204C105.902 8.81204 106.993 8.92704 108.019 9.15604C109.045 9.38504 110.102 9.81005 111.19 10.4301C111.868 10.8221 112.562 11.4391 113.273 12.2841C113.984 13.1291 114.524 14.0501 114.891 15.0471C115.258 16.0441 115.442 17.1681 115.442 18.4181C115.442 19.5351 115.24 20.642 114.834 21.739C114.429 22.837 113.863 23.789 113.138 24.595C112.412 25.402 111.678 26.0081 110.934 26.4131C110.189 26.8191 109.053 27.1691 107.527 27.4651C106.897 27.5791 105.766 27.636 104.133 27.636C103.055 27.636 102.177 27.603 101.499 27.536C101.231 27.498 100.945 27.479 100.64 27.479C100.592 27.479 100.54 27.484 100.483 27.493L94.642 27.608L94.614 27.493C94.594 27.445 94.585 27.3931 94.585 27.3361L94.61 27.123ZM101.896 26.55C102.622 26.799 103.357 26.9221 104.101 26.9221C105.065 26.9221 106.01 26.772 106.936 26.471C107.861 26.17 108.68 25.7461 109.391 25.1971C110.102 24.6481 110.686 24.0281 111.144 23.3361C111.603 22.6441 111.927 22.022 112.118 21.468C112.386 20.657 112.519 19.602 112.519 18.304C112.519 17.063 112.256 15.804 111.731 14.524C111.369 13.637 110.732 12.787 109.82 11.976C108.909 11.165 107.833 10.5711 106.592 10.1931C105.351 9.81705 104.01 9.62805 102.569 9.62805C101.577 9.62805 100.841 9.73804 100.365 9.95804C100.307 10.015 100.251 10.0821 100.193 10.1581C100.135 10.3971 100.107 10.616 100.107 10.817C100.107 10.941 100.112 11.089 100.122 11.261C100.15 12.368 100.165 13.256 100.165 13.924L100.15 17.174C100.15 21.946 100.238 24.6021 100.415 25.1411C100.592 25.6791 101.086 26.149 101.896 26.55Z" fill="white"/>
              <path d="M120.663 27.6111L120.677 27.2621C120.886 27.1601 121.234 27.0681 121.724 26.9871C122.212 26.9061 122.548 26.8251 122.734 26.7441C122.92 26.6621 123.074 26.5551 123.197 26.4211C123.283 26.0011 123.326 25.2411 123.326 24.1431V12.9961L123.369 11.1481C123.369 10.7661 123.295 10.5031 123.146 10.3601C122.998 10.2171 122.607 10.0861 121.978 9.96609C121.347 9.84709 120.976 9.7491 120.861 9.6731C120.748 9.5971 120.691 9.51611 120.691 9.43011C120.691 9.38211 120.707 9.32011 120.734 9.24411C120.859 9.16811 120.988 9.12912 121.121 9.12912C121.264 9.12912 121.555 9.13911 121.994 9.15811H122.394C122.529 9.15811 122.906 9.14912 123.525 9.12912H125.515L129.624 9.05811L133.976 8.88611H134.363L134.978 8.87109C135.15 8.87109 135.302 8.91911 135.437 9.01511C135.494 9.16811 135.527 9.27712 135.537 9.34412L135.523 9.91711L135.652 12.4791C135.652 12.5841 135.642 12.7181 135.623 12.8801C135.471 12.9471 135.332 12.9801 135.209 12.9801C135.123 12.9801 135.055 12.9511 135.008 12.8941C134.932 12.7891 134.883 12.5891 134.865 12.2931C134.826 11.8821 134.677 11.3531 134.422 10.7041C134.297 10.3991 134.092 10.1891 133.807 10.0741C133.235 9.8551 132.272 9.74512 130.92 9.74512C130.281 9.74512 129.686 9.7621 129.133 9.7951C128.58 9.8281 128.242 9.84509 128.117 9.84509L127.002 9.83112C126.545 9.83112 126.168 9.8981 125.873 10.0311C125.674 10.1171 125.574 10.3231 125.574 10.6471V10.8621C125.601 11.3491 125.617 11.8881 125.617 12.4801L125.574 16.3741C125.574 16.7551 125.601 17.1181 125.658 17.4621L126.074 17.4901L126.873 17.4471H129.603C130.699 17.4471 131.46 17.3711 131.888 17.2181C132.173 17.1131 132.388 16.9561 132.531 16.7461C132.58 16.6791 132.699 16.3021 132.888 15.6151L133.074 14.4271C133.189 14.3701 133.275 14.3411 133.332 14.3411C133.381 14.3411 133.457 14.3651 133.562 14.4131C133.599 14.6331 133.623 14.9671 133.632 15.4151L133.804 20.6831C133.642 20.7501 133.519 20.7841 133.433 20.7841L133.275 20.7551C133.123 19.8011 132.884 19.0511 132.56 18.5071C132.445 18.3161 132.316 18.2061 132.173 18.1781C131.923 18.1201 130.788 18.0921 128.765 18.0921C128.136 18.0921 127.701 18.0971 127.462 18.1061C126.89 18.1351 126.546 18.1491 126.431 18.1491H126.288C126.003 18.1491 125.796 18.1871 125.673 18.2641C125.634 18.3781 125.616 18.4591 125.616 18.5071V19.4951C125.616 19.6101 125.62 20.0871 125.63 20.9271L125.601 25.6651C125.601 25.7991 125.64 25.9661 125.716 26.1661C125.917 26.3281 126.28 26.4361 126.812 26.4881C127.341 26.5411 127.839 26.6671 128.308 26.8671C128.574 26.9911 128.708 27.1301 128.708 27.2821C128.708 27.3491 128.688 27.4111 128.651 27.4691C128.612 27.5261 128.546 27.5691 128.45 27.5971C127.669 27.4351 126.587 27.3541 125.206 27.3541C124.474 27.3541 123.696 27.4211 122.878 27.5551C122.316 27.6401 121.673 27.6831 120.948 27.6831L120.663 27.6111Z" fill="white"/>
              <path d="M139.843 26.9371C140.052 26.8511 140.267 26.7991 140.488 26.7791C141.947 26.6841 142.783 26.5091 142.992 26.2561C143.203 26.0031 143.308 24.7781 143.308 22.5811L143.292 21.0771V19.5011L143.235 17.7681L143.264 16.7501L143.248 15.6321V14.3141L143.221 13.7271L143.248 12.9821C143.258 12.8101 143.264 12.6091 143.264 12.3801C143.264 11.7781 143.235 11.1431 143.178 10.4741C143.139 10.3401 143.086 10.2111 143.02 10.0871C142.666 9.90607 142.096 9.78408 141.309 9.72208C140.522 9.66008 140.077 9.59107 139.971 9.51407C139.895 9.45707 139.852 9.30907 139.842 9.07007H141.047L144.846 9.15607C145.821 9.15607 147.121 9.12707 148.746 9.07007C148.746 9.22307 148.736 9.36608 148.717 9.49908C148.528 9.54708 148.207 9.60007 147.758 9.65707C146.852 9.76207 146.299 9.86307 146.098 9.95807C145.973 10.0061 145.883 10.0871 145.827 10.2021C145.731 10.3741 145.675 10.6941 145.655 11.1621L145.583 13.0111L145.64 19.3861V21.9081C145.622 22.7011 145.613 23.2411 145.613 23.5271C145.613 24.5971 145.638 25.2801 145.691 25.5761C145.744 25.8721 145.834 26.0841 145.962 26.2131C146.091 26.3421 146.304 26.4451 146.601 26.5211C147.039 26.6261 147.382 26.6841 147.63 26.6931C148.165 26.7131 148.503 26.7891 148.648 26.9221C148.675 27.0471 148.691 27.1511 148.691 27.2371V27.3521C147.82 27.3811 147.179 27.3951 146.769 27.3951C146.531 27.3951 146.105 27.3811 145.494 27.3521L143.514 27.3811L140.145 27.3661H139.874L139.843 26.9371Z" fill="white"/>
              <path d="M153.253 27.1761C153.349 27.0931 153.431 27.0411 153.497 27.0231C153.659 26.9751 153.936 26.9371 154.327 26.9081C155.253 26.8501 155.825 26.7651 156.046 26.6501C156.179 26.4591 156.245 26.1911 156.245 25.8471L156.231 24.8441L156.245 21.2021L156.216 19.4811L156.232 15.8821L156.16 11.7951C156.15 10.8201 156.09 10.2701 155.974 10.1461C155.802 9.96409 155.29 9.85909 154.443 9.83109C154.08 9.82209 153.759 9.79309 153.484 9.74509C153.359 9.67809 153.296 9.59209 153.296 9.48709C153.296 9.41109 153.319 9.32009 153.368 9.21509C153.454 9.16809 153.53 9.14307 153.597 9.14307C153.732 9.14307 153.894 9.14808 154.083 9.15808C154.647 9.21508 155.229 9.24408 155.831 9.24408L156.89 9.21509L159.41 9.27206C160.67 9.27206 161.652 9.25806 162.359 9.22906C163.064 9.20106 163.543 9.18607 163.791 9.18607C164.01 9.18607 164.555 9.20608 165.422 9.24408L167.455 9.22906L167.699 9.27206L168.887 9.22906L169.032 9.30109C169.079 9.37809 169.112 9.45907 169.132 9.54407C169.132 9.67807 169.111 9.88306 169.068 10.1601C169.025 10.4371 169.004 10.6091 169.004 10.6761C169.004 11.6691 169.037 12.5081 169.104 13.1961C169.094 13.2531 169.067 13.2911 169.02 13.3101C168.916 13.3101 168.823 13.2961 168.739 13.2671C168.634 13.0861 168.493 12.7661 168.317 12.3081C168.139 11.8501 167.876 11.3201 167.522 10.7191C167.284 10.3181 167.096 10.0791 166.963 10.0031C166.828 9.92608 166.551 9.88806 166.131 9.88806C166.045 9.88806 165.611 9.87907 164.828 9.85907C164.617 9.85007 164.412 9.84506 164.213 9.84506L160.129 9.93106H159.769C159.244 9.93106 158.927 9.99807 158.824 10.1311C158.66 10.3601 158.58 11.0331 158.58 12.1501C158.58 12.2651 158.603 13.4101 158.652 15.5861V17.5761C158.756 17.6051 158.871 17.6191 158.994 17.6191H159.238C159.4 17.6191 159.638 17.6241 159.955 17.6341C160.451 17.6531 160.785 17.6621 160.957 17.6621C161.07 17.6621 161.172 17.6581 161.258 17.6481C162.287 17.6101 163.613 17.5911 165.237 17.5911C165.743 17.5051 166.04 17.4041 166.126 17.2901C166.269 17.1181 166.376 16.6701 166.448 15.9441C166.518 15.2191 166.678 14.8081 166.927 14.7131C167.052 14.7131 167.165 14.7371 167.271 14.7841C167.291 14.8611 167.3 14.9321 167.3 14.9991C167.3 15.0661 167.29 15.1761 167.271 15.3281C167.224 15.6821 167.199 16.7881 167.199 18.6491C167.199 19.1461 167.226 19.6991 167.279 20.3101C167.33 20.9211 167.357 21.2501 167.357 21.2981C167.357 21.3841 167.343 21.4991 167.314 21.6421C167.238 21.6801 167.175 21.6991 167.128 21.6991H167.026C166.874 21.4321 166.725 21.0171 166.583 20.4531C166.335 19.4891 166.075 18.8861 165.804 18.6421C165.531 18.3981 165.089 18.2771 164.48 18.2771C164.345 18.2771 164.103 18.2841 163.75 18.2981C163.397 18.3121 162.871 18.3191 162.176 18.3191H161.244C159.918 18.3191 159.049 18.3481 158.639 18.4051L158.625 18.8781L158.639 21.5171L158.625 23.1811L158.639 24.8011C158.649 25.7771 158.711 26.3411 158.825 26.4931C158.989 26.7031 159.341 26.8081 159.886 26.8081L160.759 26.7941C160.835 26.7941 161.134 26.8011 161.654 26.8151C162.174 26.8291 162.816 26.8361 163.58 26.8361C165.422 26.8361 166.648 26.7571 167.26 26.5991C167.869 26.4411 168.373 26.1611 168.77 25.7591C169.166 25.3571 169.665 24.4901 170.266 23.1591C170.448 22.7661 170.629 22.5701 170.809 22.5701C170.895 22.5701 170.991 22.6081 171.096 22.6841C170.819 23.6291 170.662 24.2491 170.623 24.5451C170.518 25.2131 170.457 25.8961 170.437 26.5921C170.437 26.9071 170.361 27.1701 170.208 27.3801H169.892L165.871 27.4231L164.066 27.4081L159.771 27.4661H158.025C157.806 27.4661 157.601 27.4701 157.41 27.4801C155.691 27.5561 154.428 27.5941 153.615 27.5941C153.472 27.5941 153.375 27.5711 153.322 27.5251C153.269 27.4781 153.244 27.4081 153.244 27.3151L153.253 27.1761Z" fill="white"/>
              <path d="M175.054 27.123C175.406 26.971 175.818 26.8701 176.284 26.8221C176.962 26.7461 177.468 26.5831 177.802 26.3351C178.06 25.8101 178.189 24.4731 178.189 22.3231V20.0591L178.218 18.6981L178.189 17.695L178.218 15.847L178.175 11.19C178.175 10.665 178.097 10.3211 177.945 10.1591C177.726 9.92006 177.144 9.70105 176.199 9.49905C175.808 9.41405 175.57 9.33403 175.484 9.26303C175.398 9.19103 175.345 9.05504 175.326 8.85504C175.545 8.80804 175.697 8.78406 175.783 8.78406H176.801L177.33 8.76904C177.684 8.76904 178.074 8.80803 178.504 8.88403C179.383 8.94103 180.283 8.97003 181.209 8.97003C181.477 8.97003 181.859 8.95503 182.355 8.92703C183.671 8.85003 184.617 8.81204 185.189 8.81204C186.343 8.81204 187.435 8.92704 188.46 9.15604C189.485 9.38504 190.542 9.81005 191.63 10.4301C192.308 10.8221 193.003 11.4391 193.714 12.2841C194.425 13.1291 194.964 14.0501 195.331 15.0471C195.698 16.0441 195.882 17.1681 195.882 18.4181C195.882 19.5351 195.681 20.642 195.275 21.739C194.869 22.837 194.304 23.789 193.578 24.595C192.853 25.402 192.119 26.0081 191.375 26.4131C190.629 26.8191 189.494 27.1691 187.967 27.4651C187.338 27.5791 186.207 27.636 184.574 27.636C183.496 27.636 182.617 27.603 181.939 27.536C181.671 27.498 181.386 27.479 181.08 27.479C181.033 27.479 180.98 27.484 180.924 27.493L175.082 27.608L175.055 27.493C175.035 27.445 175.026 27.3931 175.026 27.3361L175.054 27.123ZM182.339 26.55C183.066 26.799 183.8 26.9221 184.544 26.9221C185.509 26.9221 186.454 26.772 187.38 26.471C188.304 26.17 189.124 25.7461 189.835 25.1971C190.546 24.6481 191.13 24.0281 191.587 23.3361C192.046 22.6441 192.37 22.022 192.562 21.468C192.83 20.657 192.962 19.602 192.962 18.304C192.962 17.063 192.7 15.804 192.175 14.524C191.812 13.637 191.175 12.787 190.263 11.976C189.353 11.165 188.277 10.5711 187.036 10.1931C185.794 9.81705 184.454 9.62805 183.013 9.62805C182.021 9.62805 181.284 9.73804 180.808 9.95804C180.751 10.015 180.695 10.0821 180.636 10.1581C180.579 10.3971 180.55 10.616 180.55 10.817C180.55 10.941 180.556 11.089 180.566 11.261C180.593 12.368 180.609 13.256 180.609 13.924L180.593 17.174C180.593 21.946 180.681 24.6021 180.859 25.1411C181.034 25.6791 181.529 26.149 182.339 26.55Z" fill="white"/>
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
