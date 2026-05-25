<script setup lang="ts">
import MegaMenu from '~/components/header/MegaMenu.vue'
import type { CatalogNavigationItem } from '~/types/catalog-navigation'

const route = useRoute()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { locale } = useI18n()
const { itemCount } = useDesignCart()
const { authReady, displayName, hydrateAuth, isAuthenticated, logout } = useStorefrontAuth()
const activeMegaMenuKey = shallowRef<string | null>(null)
const isUserMenuOpen = shallowRef(false)
const logoutPending = shallowRef(false)
const userMenuRef = shallowRef<HTMLElement | null>(null)
const { items: navItems, menuForItem } = useCatalogNavigationTree()

function normalizePath(path: string): string {
  return path.replace(/^\/(en|es)(?=\/)/, '').replace(/\/$/, '') || '/'
}

function normalizeCategoryPath(path: string): string {
  return normalizePath(path)
    .replace(/^\/+/, '')
    .replace(/^categories\//, '')
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

function subNavigationItemClass(item: CatalogNavigationItem): string {
  const isActive = activeMegaMenuKey.value === itemKey(item) || isActiveNavigationItem(item)

  return isActive
    ? 'border-white md:border-black text-white md:text-black'
    : 'border-transparent text-white md:text-black'
}

function hasChildren(item: CatalogNavigationItem): boolean {
  return Boolean(item.children?.length)
}

const nextLocale = computed(() => locale.value === 'es' ? 'en' : 'es')

const nextLocalePath = computed(() => switchLocalePath(nextLocale.value))

const nextLocaleLabel = computed(() => nextLocale.value.toUpperCase())

const activeMainItem = computed(() => {
  return navItems.value.find(isActiveNavigationItem) ?? navItems.value[0] ?? null
})

const subNavigationItems = computed(() => activeMainItem.value?.children ?? [])

const forcedMegaMenuValue = computed(() => {
  const rawValue = route.query.nav ?? route.query.menu ?? route.query.activeNav
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue

  return typeof value === 'string' ? normalizeCategoryPath(value) : ''
})

const isMegaMenuForced = computed(() => Boolean(forcedMegaMenuValue.value))

const activeMegaMenu = computed(() => {
  const item = subNavigationItems.value.find(navItem => itemKey(navItem) === activeMegaMenuKey.value)

  if (!item)
    return null

  return menuForItem(item)
})

const activeMegaMenuImages = computed(() => {
  return activeMegaMenu.value?.images?.length
    ? activeMegaMenu.value.images
    : activeMainItem.value?.menu?.images ?? []
})

function openMegaMenu(item: CatalogNavigationItem): void {
  const menu = menuForItem(item)
  const hasMenuContent = Boolean(menu?.columns?.length || menu?.images?.length || activeMainItem.value?.menu?.images?.length)

  activeMegaMenuKey.value = hasChildren(item) && hasMenuContent ? itemKey(item) : null
}

function matchesForcedMegaMenu(item: CatalogNavigationItem): boolean {
  const forcedValue = forcedMegaMenuValue.value

  if (!forcedValue)
    return false

  return [
    item.slug,
    item.path,
    item.url,
  ].some(value => normalizeCategoryPath(value) === forcedValue || normalizeCategoryPath(value).endsWith(`/${forcedValue}`))
}

function toggleMegaMenu(item: CatalogNavigationItem): void {
  if (activeMegaMenuKey.value === itemKey(item)) {
    closeMegaMenu()
    return
  }

  openMegaMenu(item)
}

function closeMegaMenu(): void {
  if (isMegaMenuForced.value)
    return

  activeMegaMenuKey.value = null
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

watch(
  [subNavigationItems, forcedMegaMenuValue],
  () => {
    if (!forcedMegaMenuValue.value) {
      activeMegaMenuKey.value = null
      return
    }

    const item = subNavigationItems.value.find(matchesForcedMegaMenu)

    if (item)
      openMegaMenu(item)
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
        @mouseleave="closeMegaMenu"
      >
        <div
            class="xs:hidden overflow-x-auto mx-auto scrollbar-thin max-w-325">
          <nav
              class="flex h-[41px] min-w-max items-center justify-center gap-[34px] text-[15px] font-bold uppercase leading-none tracking-[0.16em] mt-8">
            <div
              v-for="item in subNavigationItems"
              :key="itemKey(item)"
              class="flex h-full items-center uppercase"
              @mouseenter="openMegaMenu(item)"
            >
              <button
                v-if="hasChildren(item)"
                type="button"
                class="whitespace-nowrap border-b-2 pb-2 pt-2 uppercase"
                :class="subNavigationItemClass(item)"
                @click="toggleMegaMenu(item)"
              >
                {{ item.name }}
              </button>

              <NuxtLink
                v-else
                :to="linkTarget(item.url)"
                class="whitespace-nowrap border-b-2 pb-2 pt-2 uppercase"
                :class="subNavigationItemClass(item)"
              >
                {{ item.name }}
              </NuxtLink>
            </div>
          </nav>
        </div>

        <MegaMenu
          v-if="activeMegaMenu"
          :columns="activeMegaMenu.columns"
          :images="activeMegaMenuImages"
        />
      </div>

      <div class="lg:hidden">
        <div class="flex h-[58px] items-center justify-between bg-white pl-[15px] pr-[15px]">
          <div class="flex min-w-0 items-center gap-[12px]">
            <button type="button" :aria-label="$t('header.actions.menu')" class="flex size-[21px] items-center justify-center">
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
              <Icon name="icon:shoping-cart" class="size-[25px]" />
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
              v-for="item in subNavigationItems"
              :key="itemKey(item)"
            >
              <span
                v-if="hasChildren(item)"
                class="shrink-0 whitespace-nowrap border-b-2 pb-2 pt-2"
                :class="subNavigationItemClass(item)"
              >
                {{ item.name }}
              </span>

              <NuxtLink
                v-else
                :to="linkTarget(item.url)"
                class="shrink-0 whitespace-nowrap border-b-2 pb-2 pt-2"
                :class="subNavigationItemClass(item)"
              >
                {{ item.name }}
              </NuxtLink>
            </template>
          </nav>
        </div>
      </div>
    </div>

    <div class="h-[99px] lg:h-[104px]" aria-hidden="true" />
  </header>
</template>
