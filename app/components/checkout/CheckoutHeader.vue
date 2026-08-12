<script setup lang="ts">
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { locale } = useI18n()
const { itemCount } = useDesignCart()
const { authReady, displayName, hydrateAuth, isAuthenticated, logout } = useStorefrontAuth()

const isUserMenuOpen = shallowRef(false)
const logoutPending = shallowRef(false)
const userMenuRef = shallowRef<HTMLElement | null>(null)

const nextLocale = computed(() => locale.value === 'es' ? 'en' : 'es')
const nextLocalePath = computed(() => switchLocalePath(nextLocale.value))
const nextLocaleLabel = computed(() => nextLocale.value.toUpperCase())

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

onClickOutside(userMenuRef, () => {
  isUserMenuOpen.value = false
})

onMounted(() => {
  hydrateAuth()
})
</script>

<template>
  <header class="border-b border-[#ededed] bg-white text-black">
    <div class="flex h-[66px] items-center justify-between px-8 sm:px-10 lg:px-[37px]">
      <NuxtLink
        :to="localePath('/')"
        aria-label="trendfied"
        class="flex items-center"
      >
        <svg viewBox="0 0 202 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="50" height="50" class="inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation">
    <path d="M201.57 0H117.8V10.472H201.57V0Z" fill="#B20000"/>
    <path d="M118.848 0H0V10.472H118.848V0Z" fill="black"/>
    <path d="M201.57 16.7451H117.8V27.2171H201.57V16.7451Z" fill="#B20000"/>
    <path d="M118.848 16.7451H0V27.2171H118.848V16.7451Z" fill="black"/>
    <path d="M201.57 33.4209H117.8V43.8929H201.57V33.4209Z" fill="#B20000"/>
    <path d="M118.848 33.4209H0V43.8929H118.848V33.4209Z" fill="black"/>
</svg>
      </NuxtLink>

      <div class="flex items-center gap-[18px] text-[16px] font-bold leading-none">
        <NuxtLink
          :to="localePath('/account/cart')"
          :aria-label="$t('header.actions.cart')"
          class="relative flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" class="size-[25px] inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE --><path fill="currentColor" d="M104 216a16 16 0 1 1-16-16a16 16 0 0 1 16 16m88-16a16 16 0 1 0 16 16a16 16 0 0 0-16-16m47.71-125.86l-25.64 92.28A24.06 24.06 0 0 1 191 184H92.16A24.06 24.06 0 0 1 69 166.42L33.92 40H16a8 8 0 0 1 0-16h24a8 8 0 0 1 7.71 5.86L57.19 64H232a8 8 0 0 1 7.71 10.14M221.47 80H61.64l22.81 82.14a8 8 0 0 0 7.71 5.86H191a8 8 0 0 0 7.71-5.86Z"/></svg>
          <span
            v-if="itemCount"
            class="absolute -right-2 -top-2 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold leading-none text-white"
          >
            {{ itemCount }}
          </span>
        </NuxtLink>

        <NuxtLink
          :to="nextLocalePath"
          :aria-label="$t('header.actions.language')"
          class="flex items-center gap-[6px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" class="size-[25px] inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE --><path fill="currentColor" d="M128 26a102 102 0 1 0 102 102A102.12 102.12 0 0 0 128 26m81.57 64h-40.38a132.6 132.6 0 0 0-25.73-50.67A90.29 90.29 0 0 1 209.57 90m8.43 38a89.7 89.7 0 0 1-3.83 26h-42.36a155.4 155.4 0 0 0 0-52h42.36a89.7 89.7 0 0 1 3.83 26m-90 87.83a110 110 0 0 1-15.19-19.45A124.2 124.2 0 0 1 99.35 166h57.3a124.2 124.2 0 0 1-13.46 30.38A110 110 0 0 1 128 215.83M96.45 154a139.2 139.2 0 0 1 0-52h63.1a139.2 139.2 0 0 1 0 52ZM38 128a89.7 89.7 0 0 1 3.83-26h42.36a155.4 155.4 0 0 0 0 52H41.83A89.7 89.7 0 0 1 38 128m90-87.83a110 110 0 0 1 15.19 19.45A124.2 124.2 0 0 1 156.65 90h-57.3a124.2 124.2 0 0 1 13.46-30.38A110 110 0 0 1 128 40.17m-15.46-.84A132.6 132.6 0 0 0 86.81 90H46.43a90.29 90.29 0 0 1 66.11-50.67M46.43 166h40.38a132.6 132.6 0 0 0 25.73 50.67A90.29 90.29 0 0 1 46.43 166m97 50.67A132.6 132.6 0 0 0 169.19 166h40.38a90.29 90.29 0 0 1-66.11 50.67Z"/></svg>
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
            class="absolute right-0 top-[calc(100%+16px)] z-[80] w-44 overflow-hidden border border-[#d7d7d7] bg-white py-2 text-[14px] font-semibold shadow-[0_18px_40px_rgba(17,19,20,0.12)]"
            role="menu"
          >
            <NuxtLink
              :to="localePath('/account/orders')"
              class="flex items-center gap-2 px-4 py-2 hover:bg-[#f5f5f3]"
              role="menuitem"
              @click="isUserMenuOpen = false"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" class="size-[16px] inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE --><path fill="currentColor" d="m223.68 66.15l-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 32l80.34 44l-29.77 16.3l-80.35-44Zm0 88L47.66 76l33.9-18.56l80.34 44ZM40 90l80 43.78v85.79l-80-43.75Zm176 85.78l-80 43.79v-85.75l32-17.51V152a8 8 0 0 0 16 0v-44.45L216 90v85.77Z"/></svg>
              <span>{{ $t('header.user.orders') }}</span>
            </NuxtLink>

            <button
              type="button"
              class="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-[#f5f5f3] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="logoutPending"
              role="menuitem"
              @click="handleLogout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" class="size-[16px] inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE --><path fill="currentColor" d="M120 216a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V40a8 8 0 0 1 8-8h64a8 8 0 0 1 0 16H56v160h56a8 8 0 0 1 8 8m109.66-93.66l-40-40a8 8 0 0 0-11.32 11.32L204.69 120H112a8 8 0 0 0 0 16h92.69l-26.35 26.34a8 8 0 0 0 11.32 11.32l40-40a8 8 0 0 0 0-11.32"/></svg>
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
  </header>
</template>
