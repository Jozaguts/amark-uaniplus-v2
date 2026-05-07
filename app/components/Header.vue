<script setup lang="ts">
type TabKey = 'women' | 'men' | 'kids' | 'dogs' | 'cats'
type NavKey = 'newToday' | 'clothing' | 'dresses' | 'shoes' | 'accessories' | 'designers' | 'stores' | 'hotList' | 'sale'

const route = useRoute()
const localePath = useLocalePath()

const tabs = [
  { key: 'women', to: '/women' },
  { key: 'men', to: '/men' },
  { key: 'kids', to: '/kids' },
  { key: 'dogs', to: '/dogs' },
  { key: 'cats', to: '/cats' },
] satisfies Array<{ key: TabKey, to: string }>

const navItems = [
  'newToday',
  'clothing',
  'dresses',
  'shoes',
  'accessories',
  'designers',
  'stores',
  'hotList',
  'sale',
] satisfies NavKey[]

function normalizePath(path: string): string {
  return path.replace(/^\/(en|es)(?=\/)/, '').replace(/\/$/, '') || '/'
}

function isActiveTab(path: string): boolean {
  return normalizePath(route.path) === path
}
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
          aria-label="REVOLVE"
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

      <div class="hidden h-[41px] items-center justify-center lg:flex">
        <nav class="flex items-center gap-[34px] text-[15px] font-bold uppercase leading-none tracking-[0.16em]">
          <a
            v-for="item in navItems"
            :key="item"
            href="#"
            class="whitespace-nowrap"
          >
            {{ $t(`header.nav.${item}`) }}
          </a>
        </nav>
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
            :key="item"
            href="#"
            class="shrink-0 whitespace-nowrap"
          >
            {{ $t(`header.nav.${item}`) }}
          </a>
        </nav>
      </div>
    </div>

    <div class="h-[99px] lg:h-[104px]" aria-hidden="true" />
  </header>
</template>
