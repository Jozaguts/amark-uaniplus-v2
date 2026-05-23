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
        aria-label="uandiplus"
        class="flex items-center"
      >
        <Icon name="icon:uandi" size="50" />
      </NuxtLink>

      <div class="flex items-center gap-[18px] text-[16px] font-bold leading-none">
        <NuxtLink
          :to="localePath('/account/cart')"
          :aria-label="$t('header.actions.cart')"
          class="relative flex items-center"
        >
          <Icon name="icon:shoping-cart" class="size-[25px]" />
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
          <Icon name="icon:globe-light" class="size-[25px]" />
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
  </header>
</template>
