<script setup lang="ts">
const tabs = [
  { key: 'women', active: true },
  { key: 'men', active: false },
  { key: 'beauty', active: false },
] as const

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
] as const
</script>

<template>
  <header>
    <div class="fixed inset-x-0 top-0 z-50 border-b border-[#e8e8e8] bg-white text-black">
      <div class="hidden h-[63px] grid-cols-[1fr_auto_1fr] items-start px-[288px] pt-[21px] lg:grid">
        <nav class="flex items-center gap-[18px] pt-px text-[12px] font-semibold leading-none">
          <a
            v-for="tab in tabs"
            :key="tab.key"
            href="#"
            class="capitalize text-[#6d6d6d]"
            :class="tab.active && 'border-b border-black pb-[3px] text-black'"
          >
            {{ $t(`header.tabs.${tab.key}`) }}
          </a>
        </nav>

        <a
          href="#"
          aria-label="REVOLVE"
          class="font-serif text-[28px] font-bold leading-none tracking-[0.24em]"
        >
          REVOLVEss
        </a>

        <div class="flex items-start justify-end gap-[24px]">
          <label class="flex h-[24px] w-[200px] items-center border-b border-black">
            <span class="sr-only">{{ $t('header.actions.search') }}</span>
            <input
              class="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] leading-none text-black outline-none placeholder:text-[#777]"
              type="search"
              :placeholder="$t('header.actions.search')"
            >
            <Icon name="icon:search" class="size-[18px]" />
          </label>

          <a href="#" :aria-label="$t('header.actions.wishlist')" class="pt-[1px]">
            <Icon name="icon:heart" class="size-[24px]" />
          </a>

          <a href="#" :aria-label="$t('header.actions.bag')" class="pt-[1px]">
            <Icon name="icon:shop" class="size-[24px]" />
          </a>
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
              aria-label="REVOLVE"
              class="font-serif text-[20px] font-bold leading-none tracking-[0.18em]"
            >
              REVOLVE
            </a>
          </div>

          <div class="flex items-center gap-[17px]">
            <a href="#" :aria-label="$t('header.actions.search')">
              <Icon name="icon:search" class="size-[26px]" />
            </a>

            <a href="#" :aria-label="$t('header.actions.wishlist')">
              <Icon name="icon:heart" class="size-[25px]" />
            </a>

            <a href="#" :aria-label="$t('header.actions.bag')">
              <Icon name="icon:shop" class="size-[25px]" />
            </a>
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
