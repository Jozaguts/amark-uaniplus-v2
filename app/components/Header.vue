<script setup lang="ts">
import MegaMenu from '~/components/header/MegaMenu.vue'
import type { CatalogNavigationItem } from '~/types/catalog-navigation'

const route = useRoute()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { locale } = useI18n()
const activeMegaMenuKey = shallowRef<string | null>(null)
const { items: navItems, menuForItem } = useCatalogNavigationTree()

function normalizePath(path: string): string {
  return path.replace(/^\/(en|es)(?=\/)/, '').replace(/\/$/, '') || '/'
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

const activeMegaMenu = computed(() => {
  const item = subNavigationItems.value.find(navItem => itemKey(navItem) === activeMegaMenuKey.value)

  if (!item)
    return null

  return menuForItem(item)
})

function openMegaMenu(item: CatalogNavigationItem): void {
  activeMegaMenuKey.value = hasChildren(item) && menuForItem(item)?.columns?.length ? itemKey(item) : null
}

function toggleMegaMenu(item: CatalogNavigationItem): void {
  if (activeMegaMenuKey.value === itemKey(item)) {
    closeMegaMenu()
    return
  }

  openMegaMenu(item)
}

function closeMegaMenu(): void {
  activeMegaMenuKey.value = null
}

watch(activeMainItem, () => {
  closeMegaMenu()
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
            :class="activeMainItem && itemKey(activeMainItem) === itemKey(item) && 'border-b border-black pb-[3px] text-black'"
          >
            {{ item.name }}
          </NuxtLink>
        </nav>

        <NuxtLink
          :to="localePath('/')"
          aria-label="uandiplus"
          class="font-serif text-[28px] font-bold leading-none tracking-[0.24em]"
        >
         <Icon name="icon:uandi" size="40"></Icon>
        </NuxtLink>

        <div class="flex items-center justify-end gap-[21px] pt-[-1px] text-[16px] font-bold leading-none">
          <button type="button" :aria-label="$t('header.actions.cart')" class="pt-px">
            <Icon name="icon:shoping-cart" class="size-[25px]" />
          </button>

          <NuxtLink :to="nextLocalePath" :aria-label="$t('header.actions.language')" class="flex items-center gap-[6px]">
            <Icon name="icon:globe-light" class="size-[26px]" />
            <span>{{ nextLocaleLabel }}</span>
          </NuxtLink>

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
        <div
            class="container max-w-8/12 mx-auto overflow-x-auto scrollbar-thin  ">
          <nav class="flex h-[41px] min-w-max items-center justify-center gap-[34px] text-[15px] font-bold uppercase leading-none tracking-[0.16em]">
            <div
              v-for="item in subNavigationItems"
              :key="itemKey(item)"
              class="flex h-full items-center"
              @mouseenter="openMegaMenu(item)"
            >
              <button
                v-if="hasChildren(item)"
                type="button"
                class="border-b border-transparent pb-[8px] pt-[8px] whitespace-nowrap"
                :class="(activeMegaMenuKey === itemKey(item) || isActiveNavigationItem(item)) && 'border-black'"
                @click="toggleMegaMenu(item)"
              >
                {{ item.name }}
              </button>

              <NuxtLink
                v-else
                :to="linkTarget(item.url)"
                class="border-b border-transparent pb-[8px] pt-[8px] whitespace-nowrap"
                :class="isActiveNavigationItem(item) && 'border-black'"
              >
                {{ item.name }}
              </NuxtLink>
            </div>
          </nav>
        </div>

        <MegaMenu
          v-if="activeMegaMenu"
          :columns="activeMegaMenu.columns"
          :images="activeMegaMenu.images"
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
            <button type="button" :aria-label="$t('header.actions.cart')">
              <Icon name="icon:shoping-cart" class="size-[25px]" />
            </button>

            <NuxtLink :to="nextLocalePath" :aria-label="$t('header.actions.language')" class="flex items-center gap-[4px] text-[13px] font-bold">
              <Icon name="icon:globe-light" class="size-[24px]" />
              <span>{{ nextLocaleLabel }}</span>
            </NuxtLink>

            <NuxtLink :to="localePath('/login')" class="text-[13px] font-bold">
              {{ $t('header.actions.login') }}
            </NuxtLink>
          </div>
        </div>

        <div class="bg-black">
          <nav class="container mx-auto flex h-[41px] items-center gap-[26px] overflow-x-auto px-[20px] text-[14px] font-bold uppercase leading-none tracking-[0.15em] text-white">
            <template
              v-for="item in subNavigationItems"
              :key="itemKey(item)"
            >
              <span
                v-if="hasChildren(item)"
                class="shrink-0 whitespace-nowrap"
              >
                {{ item.name }}
              </span>

              <NuxtLink
                v-else
                :to="linkTarget(item.url)"
                class="shrink-0 whitespace-nowrap"
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
