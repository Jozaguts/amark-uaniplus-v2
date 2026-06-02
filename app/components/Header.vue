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
  badge?: string | null
  italic?: boolean
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
const { items: navItems, menuForItem, findByUrl } = useCatalogNavigationTree()

function normalizePath(path: string): string {
  return path.replace(/^\/(en|es)(?=\/)/, '').replace(/\/$/, '') || '/'
}

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
  const currentPath = normalizePath(route.path)
  const itemPath = normalizePath(item.url)

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

function isActiveColumn(column: CatalogNavigationColumn): boolean {
  if (!column.url) return false
  const currentPath = normalizePath(route.path)
  const colPath = normalizePath(column.url)
  return currentPath === colPath || currentPath.startsWith(`${colPath}/`)
}

function subNavigationItemClass(column: CatalogNavigationColumn): string {
  const isActive = activeMegaMenuKey.value === column.url || isActiveColumn(column)

  return isActive
    ? 'border-white md:border-black text-white md:text-black'
    : 'border-transparent text-white md:text-black'
}

function columnHasMenu(column: CatalogNavigationColumn): boolean {
  if (!column.url) return false
  const item = findByUrl(column.url)
  if (!item) return false
  const menu = menuForItem(item)
  return Boolean(menu?.columns?.length || menu?.images?.length || activeMainItem.value?.menu?.images?.length)
}

const nextLocale = computed(() => locale.value === 'es' ? 'en' : 'es')

const nextLocalePath = computed(() => switchLocalePath(nextLocale.value))

const nextLocaleLabel = computed(() => nextLocale.value.toUpperCase())

const activeMainItem = computed(() => {
  return navItems.value.find(isActiveNavigationItem) ?? navItems.value[0] ?? null
})

const subNavigationItems = computed<CatalogNavigationColumn[]>(() => activeMainItem.value?.menu?.columns ?? [])

const mobileSubNavigationItems = computed<CatalogNavigationColumn[]>(() => mobileActiveMainItem.value?.menu?.columns ?? [])

const forcedMegaMenuValue = computed(() => {
  const rawValue = route.query.nav ?? route.query.menu ?? route.query.activeNav
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue

  return typeof value === 'string' ? normalizeUrlPath(value) : ''
})

const isMegaMenuForced = computed(() => Boolean(forcedMegaMenuValue.value))

const activeMegaMenu = computed(() => {
  if (!activeMegaMenuKey.value) return null
  const item = findByUrl(activeMegaMenuKey.value)
  if (!item) return null
  return menuForItem(item)
})

const activeMegaMenuImages = computed(() => {
  return activeMegaMenu.value?.images?.length
    ? activeMegaMenu.value.images
    : activeMainItem.value?.menu?.images ?? []
})

function openMegaMenu(column: CatalogNavigationColumn): void {
  cancelMegaMenuClose()
  if (!column.url) {
    activeMegaMenuKey.value = null
    return
  }
  const item = findByUrl(column.url)
  if (!item) {
    activeMegaMenuKey.value = null
    return
  }
  const menu = menuForItem(item)
  const hasMenuContent = Boolean(menu?.columns?.length || menu?.images?.length || activeMainItem.value?.menu?.images?.length)
  activeMegaMenuKey.value = hasMenuContent ? column.url : null
}

function matchesForcedMegaMenuColumn(column: CatalogNavigationColumn): boolean {
  const forcedValue = forcedMegaMenuValue.value
  if (!forcedValue || !column.url) return false
  const normalized = normalizeUrlPath(column.url)
  return normalized === forcedValue || normalized.endsWith(`/${forcedValue}`)
}

function toggleMegaMenu(column: CatalogNavigationColumn): void {
  if (activeMegaMenuKey.value === column.url) {
    closeMegaMenu()
    return
  }

  openMegaMenu(column)
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
    badge: link.badge,
    italic: link.italic,
    children: (link.children ?? []).map(menuLinkToNavLink),
  }
}

function columnToNavLinks(column: CatalogNavigationColumn): MobileNavLink[] {
  if (column.groups?.length)
    return column.groups.flat().map(menuLinkToNavLink)
  return (column.items ?? []).map(menuLinkToNavLink)
}

const currentMobilePanel = computed<MobileNavPanel | null>(() =>
  mobileNavStack.value.length > 0
    ? mobileNavStack.value[mobileNavStack.value.length - 1]
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
  [subNavigationItems, forcedMegaMenuValue],
  () => {
    if (!forcedMegaMenuValue.value) {
      activeMegaMenuKey.value = null
      return
    }

    const column = subNavigationItems.value.find(matchesForcedMegaMenuColumn)

    if (column)
      openMegaMenu(column)
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
        <nav class="flex items-center gap-[18px] pt-px text-[12px] font-semibold leading-none">
          <NuxtLink
            v-for="item in navItems"
            :key="itemKey(item)"
            :to="linkTarget(item.url)"
            class="capitalize text-[#6d6d6d]"
            :class="activeMainItem && itemKey(activeMainItem) === itemKey(item) &&
            'border-b border-white md:border-black pb-0.75 text-white md:text-black'"
          >
            {{ item.name }}
          </NuxtLink>
        </nav>

        <NuxtLink
          :to="localePath('/')"
          aria-label="uandiplus"
          class="font-serif text-[28px] font-bold leading-none tracking-[0.24em]"
        >
         <Icon name="icon:uandi" size="60"></Icon>
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
        <div
            class="xs:hidden overflow-x-auto mx-auto scrollbar-thin max-w-325">
          <nav
              class="flex h-[41px] min-w-max items-center justify-center gap-[34px] text-[15px] font-bold uppercase leading-none tracking-[0.16em] mt-8">
            <div
              v-for="column in subNavigationItems"
              :key="column.url ?? column.title"
              class="flex h-full items-center uppercase"
              @mouseenter="openMegaMenu(column)"
            >
              <button
                v-if="columnHasMenu(column)"
                type="button"
                class="whitespace-nowrap border-b-2 pb-2 pt-2 uppercase"
                :class="subNavigationItemClass(column)"
                @click="toggleMegaMenu(column)"
              >
                {{ column.title }}
              </button>

              <NuxtLink
                v-else
                :to="linkTarget(column.url ?? '/')"
                class="whitespace-nowrap border-b-2 pb-2 pt-2 uppercase"
                :class="subNavigationItemClass(column)"
              >
                {{ column.title }}
              </NuxtLink>
            </div>
          </nav>
        </div>

        <Transition name="mega-menu">
          <MegaMenu
            v-if="activeMegaMenu"
            :columns="activeMegaMenu.columns"
            :images="activeMegaMenuImages"
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

        <div class="bg-black">
          <nav class="container mx-auto flex h-10.25 items-center gap-6.5 overflow-x-auto px-5 text-[14px] font-bold uppercase leading-none tracking-[0.15em] text-white">
            <template
              v-for="column in subNavigationItems"
              :key="column.url ?? column.title"
            >
              <span
                v-if="columnHasMenu(column)"
                class="shrink-0 whitespace-nowrap border-b-2 pb-2 pt-2"
                :class="subNavigationItemClass(column)"
              >
                {{ column.title }}
              </span>

              <NuxtLink
                v-else
                :to="linkTarget(column.url ?? '/')"
                class="shrink-0 whitespace-nowrap border-b-2 pb-2 pt-2"
                :class="subNavigationItemClass(column)"
              >
                {{ column.title }}
              </NuxtLink>
            </template>
          </nav>
        </div>
      </div>
    </div>

    <div class="h-[99px] lg:h-[136px]" aria-hidden="true" />
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
          <button
            v-for="item in navItems"
            :key="itemKey(item)"
            type="button"
            class="flex-1 border-b-2 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
            :class="mobileActiveMainItem && itemKey(mobileActiveMainItem) === itemKey(item)
              ? 'border-black text-black'
              : 'border-transparent text-[#8c8c8c]'"
            @click="setMobileSection(item)"
          >
            {{ item.name }}
          </button>
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
                <button
                  v-if="columnToNavLinks(column).length"
                  type="button"
                  class="flex w-full items-center justify-between px-4 py-4 text-[14px] text-[#222]"
                  @click="mobileOpenColumn(column)"
                >
                  <span>{{ column.title }}</span>
                  <Icon name="ph:caret-right" class="size-[14px] shrink-0 text-[#bbb]" />
                </button>

                <NuxtLink
                  v-else
                  :to="linkTarget(column.url ?? '/')"
                  class="flex items-center px-4 py-4 text-[14px] text-[#222]"
                  @click="isMobileMenuOpen = false"
                >
                  {{ column.title }}
                </NuxtLink>
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
                  <button
                    v-if="link.children.length"
                    type="button"
                    class="flex w-full items-center justify-between px-4 py-4 text-[14px] text-[#222]"
                    @click="mobileOpenLink(link)"
                  >
                    <span :class="link.italic && 'italic'">
                      {{ link.label }}
                      <span
                        v-if="link.badge"
                        class="ml-1.5 inline-flex rounded-full bg-[#e5e5e5] px-2 py-px align-middle text-[9px] font-bold not-italic leading-none text-black"
                      >{{ link.badge }}</span>
                    </span>
                    <Icon name="ph:caret-right" class="size-[14px] shrink-0 text-[#bbb]" />
                  </button>

                  <NuxtLink
                    v-else
                    :to="linkTarget(link.url)"
                    class="flex items-center px-4 py-4 text-[14px] text-[#222]"
                    :class="link.italic && 'italic'"
                    @click="isMobileMenuOpen = false"
                  >
                    {{ link.label }}
                    <span
                      v-if="link.badge"
                      class="ml-1.5 inline-flex rounded-full bg-[#e5e5e5] px-2 py-px align-middle text-[9px] font-bold not-italic leading-none text-black"
                    >{{ link.badge }}</span>
                  </NuxtLink>
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
