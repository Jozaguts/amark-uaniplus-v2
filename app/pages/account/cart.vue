<script setup lang="ts">
import CartPageSkeleton from '~/components/skeletons/CartPageSkeleton.vue'
import type { DesignCartItem, DesignCartSizeAllocation } from '~~/types/design-cart'

const {
  cartItems,
  cartReady,
  itemCount,
  removeCartItem,
  syncCart,
  updateCartItemSizeQuantity,
  clearCartItems,
} = useDesignCart()
const { hydrateAuth, isAuthenticated } = useStorefrontAuth()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const selectedItemIds = shallowRef<string[]>([])

useSeoMeta({
  title: () => t('account.cart.seo.title'),
  description: () => t('account.cart.seo.description'),
})

const numberLocale = computed(() => locale.value === 'es' ? 'es-MX' : 'en-US')

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat(numberLocale.value, {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

const syncSelectedItems = (items: DesignCartItem[]) => {
  const nextIds = new Set(items.map(item => item.id))
  const retainedIds = selectedItemIds.value.filter(id => nextIds.has(id))

  selectedItemIds.value = retainedIds.length
    ? retainedIds
    : items.map(item => item.id)
}

watch(cartItems, syncSelectedItems, { immediate: true, deep: true })

const allSelected = computed(() => {
  return cartItems.value.length > 0 && selectedItemIds.value.length === cartItems.value.length
})

const cartLineCount = computed(() => cartItems.value.length)

const selectedItems = computed(() => {
  return cartItems.value.filter(item => selectedItemIds.value.includes(item.id))
})

const checkoutItems = computed(() => {
  return selectedItems.value.length ? selectedItems.value : cartItems.value
})

const orderSummary = computed(() => {
  const items = checkoutItems.value
  const productCost = items.reduce((total, item) => total + item.summary.productPrice * item.quantity, 0)
  const customizationCost = items.reduce((total, item) => total + item.summary.customizationPrice * item.quantity, 0)
  const total = items.reduce((totalAmount, item) => totalAmount + item.summary.totalPrice * item.quantity, 0)

  return {
    productCost,
    customizationCost,
    total,
    productCostLabel: formatCurrency(productCost),
    customizationCostLabel: formatCurrency(customizationCost),
    totalLabel: formatCurrency(total),
  }
})

const summaryPreviewItem = computed(() => {
  return checkoutItems.value[0] ?? null
})

const hasCheckoutQuantity = computed(() => {
  return checkoutItems.value.some(item => item.quantity > 0)
})

const isCheckoutDisabled = computed(() => {
  return !checkoutItems.value.length || !hasCheckoutQuantity.value || orderSummary.value.total <= 0
})

const checkoutHref = computed(() => {
  const itemIds = checkoutItems.value
    .filter(item => item.quantity > 0)
    .map(item => item.id)

  if (!itemIds.length)
    return '/order/checkout'

  return `/order/checkout?items=${encodeURIComponent(itemIds.join(','))}`
})

const toggleItemSelection = (itemId: string) => {
  if (selectedItemIds.value.includes(itemId)) {
    selectedItemIds.value = selectedItemIds.value.filter(id => id !== itemId)
    return
  }

  selectedItemIds.value = [...selectedItemIds.value, itemId]
}

const toggleAllItems = () => {
  selectedItemIds.value = allSelected.value ? [] : cartItems.value.map(item => item.id)
}

const removeSelectedItems = async () => {
  if (!selectedItemIds.value.length)
    return

  const ids = [...selectedItemIds.value]

  await Promise.all(ids.map(id => removeCartItem(id)))
  selectedItemIds.value = []
}

const createDesignHref = (item: DesignCartItem) => {
  if (item.source !== 'design' || !item.designId)
    return null

  const query = new URLSearchParams()

  if (item.productType)
    query.set('type', item.productType)

  query.set('designId', item.designId)

  return `/design/${item.productHandle}?${query.toString()}`
}

const createSizeRows = (sizes: DesignCartSizeAllocation[]) => {
  const rows: DesignCartSizeAllocation[][] = []

  for (let index = 0; index < sizes.length; index += 2)
    rows.push(sizes.slice(index, index + 2))

  return rows
}

const handleCheckout = async () => {
  if (isCheckoutDisabled.value)
    return

  if (!isAuthenticated.value) {
    await navigateTo(localePath(`/login?redirect=${encodeURIComponent(checkoutHref.value)}`))
    return
  }

  await navigateTo(localePath(checkoutHref.value))
}

onMounted(() => {
  hydrateAuth()
  void syncCart()
})
</script>

<template>
  <section class="min-h-screen bg-[#f7f7f7] text-primary">
    <div class="px-5 pb-10 pt-8 lg:px-8">
      <ClientOnly>
        <div v-if="!cartReady">
          <CartPageSkeleton :rows="3" />
        </div>

        <template v-else>
          <h1 class="text-[2.1rem] font-semibold italic leading-none text-primary">
            {{ $t('account.cart.title', { count: cartLineCount }) }}
          </h1>

          <div v-if="!cartItems.length" class="mt-6">
            <div class="flex min-h-[calc(100vh-180px)] flex-col items-center justify-center rounded-[22px] bg-white px-6 text-center shadow-[0_20px_60px_rgba(17,19,20,0.04)]">
              <Icon name="ph:shopping-cart-simple-thin" class="size-[72px] text-primary" />
              <p class="mt-4 text-xl font-medium text-[#8a8f98]">
                {{ $t('account.cart.empty.title') }}
              </p>
              <NuxtLink
                :to="localePath('/fashion/all?pageNum=1')"
                class="mt-8 inline-flex min-w-[208px] items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
              >
                {{ $t('account.cart.empty.cta') }}
              </NuxtLink>
            </div>
          </div>

          <div v-else class="mt-6 space-y-4">
            <div class="flex flex-col gap-3 rounded-2xl bg-white px-4 py-4 shadow-[0_12px_32px_rgba(17,19,20,0.03)] lg:flex-row lg:items-center lg:justify-between">
              <div class="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  class="flex items-center gap-2 text-sm font-medium text-primary"
                  @click="toggleAllItems"
                >
                  <span class="flex h-5 w-5 items-center justify-center rounded-[6px] border border-borderSecondary bg-white">
                    <Icon
                      v-if="allSelected"
                      name="ph:check-bold"
                      class="size-[12px] text-primary"
                    />
                  </span>
                  <span>{{ $t('account.cart.actions.all') }}</span>
                </button>

                <button
                  type="button"
                  class="text-sm font-medium text-primary/75 transition hover:text-primary disabled:cursor-not-allowed disabled:text-primary/35"
                  :disabled="!selectedItemIds.length"
                  @click="removeSelectedItems"
                >
                  {{ $t('account.cart.actions.remove') }}
                </button>
              </div>

              <p class="text-sm font-medium text-primary">
                {{ $t('account.cart.fulfillment') }}
              </p>
            </div>

            <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
              <section class="space-y-4">
                <article
                  v-for="item in cartItems"
                  :key="item.id"
                  class="rounded-[22px] bg-white px-4 py-4 shadow-[0_12px_32px_rgba(17,19,20,0.03)]"
                >
                  <div class="mb-4 flex items-center justify-between gap-4 border-b border-borderSecondary pb-3">
                    <div class="flex items-center gap-3">
                      <button
                        type="button"
                        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border border-borderSecondary bg-white"
                        :aria-label="$t('account.cart.actions.selectItem', { name: item.productName })"
                        @click="toggleItemSelection(item.id)"
                      >
                        <Icon
                          v-if="selectedItemIds.includes(item.id)"
                          name="ph:check-bold"
                          class="size-[12px] text-primary"
                        />
                      </button>
                      <p class="text-[1.05rem] font-semibold text-primary">
                        {{ item.productSku }}
                      </p>
                    </div>
                  </div>

                  <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px_auto] xl:items-center">
                    <div class="flex min-w-0 gap-4">
                      <div class="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl border border-borderSecondary bg-[#f3f3f1]">
                        <img
                          v-if="item.previewImage"
                          :src="item.previewImage"
                          :alt="item.productName"
                          class="h-full w-full object-cover"
                        >
                        <div
                          v-else
                          class="flex h-full w-full items-center justify-center text-[#9aa0a8]"
                        >
                          <Icon name="ph:t-shirt-light" class="size-[34px]" />
                        </div>
                      </div>

                      <div class="min-w-0 flex-1">
                        <h2 class="truncate text-[1.1rem] font-semibold leading-tight text-primary">
                          {{ item.productName }}
                        </h2>
                        <p class="mt-2 text-sm text-[#686f72]">
                          #{{ item.productSku }} / {{ item.colorName || $t('account.cart.item.colorMissing') }}
                        </p>

                        <div class="mt-3 flex flex-wrap items-center gap-2">
                          <span class="rounded bg-[#f2f2ef] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                            {{ item.source === 'blank' || item.source === 'product' ? $t('account.cart.item.blank') : (item.techniqueName || item.techniqueId) }}
                          </span>
                        </div>

                        <div class="mt-4 flex flex-wrap items-center gap-4 text-sm">
                          <NuxtLink
                            v-if="createDesignHref(item)"
                            :to="localePath(createDesignHref(item)!)"
                            class="font-medium text-primary underline decoration-black/35 underline-offset-2"
                          >
                            {{ $t('account.cart.item.design') }}
                          </NuxtLink>
                          <span
                            v-if="item.source === 'design'"
                            class="font-medium text-[#686f72] underline decoration-black/20 underline-offset-2"
                          >
                            {{ $t('account.cart.item.branding') }}
                          </span>
                          <button
                            type="button"
                            class="font-medium text-primary underline decoration-black/35 underline-offset-2"
                            @click="removeCartItem(item.id)"
                          >
                            {{ $t('account.cart.actions.remove') }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="grid w-[180px] grid-cols-1 gap-x-6 gap-y-4">
                      <template v-for="sizeRow in createSizeRows(item.sizes)" :key="`${item.id}-${sizeRow.map(size => size.id).join('-')}`">
                        <div
                          v-for="size in sizeRow"
                          :key="size.id"
                          class="flex items-center justify-between gap-3"
                        >
                          <span class="min-w-[28px] text-[1.05rem] font-medium text-primary">
                            {{ size.label }}
                          </span>
                          <div class="flex items-center gap-2">
                            <button
                              type="button"
                              class="flex h-8 w-8 items-center justify-center rounded-lg border border-borderSecondary bg-white text-primary transition hover:bg-[#f5f5f3]"
                              :aria-label="$t('account.cart.actions.decreaseSize', { size: size.label })"
                              @click="updateCartItemSizeQuantity(item.id, size.id, size.quantity - 1)"
                            >
                              <Icon name="ph:minus" class="size-[14px]" />
                            </button>
                            <div class="flex h-8 min-w-[44px] items-center justify-center rounded-lg border border-borderSecondary bg-white px-2 text-sm font-medium text-primary">
                              {{ size.quantity }}
                            </div>
                            <button
                              type="button"
                              class="flex h-8 w-8 items-center justify-center rounded-lg border border-borderSecondary bg-white text-primary transition hover:bg-[#f5f5f3]"
                              :aria-label="$t('account.cart.actions.increaseSize', { size: size.label })"
                              @click="updateCartItemSizeQuantity(item.id, size.id, size.quantity + 1)"
                            >
                              <Icon name="ph:plus" class="size-[14px]" />
                            </button>
                          </div>
                        </div>
                      </template>
                    </div>

                    <div class="flex w-[160px] items-center justify-end gap-2 self-start xl:self-center">
                      <p class="text-[1.8rem] font-semibold leading-none text-primary">
                        {{ formatCurrency(item.summary.totalPrice * item.quantity) }}
                      </p>
                      <Icon name="ph:caret-down" class="size-[16px] text-[#686f72]" />
                    </div>
                  </div>
                </article>
              </section>

              <aside class="xl:sticky xl:top-24 xl:self-start">
                <div class="rounded-[22px] bg-white p-5 shadow-[0_12px_32px_rgba(17,19,20,0.03)]">
                  <h2 class="text-xl font-semibold leading-none text-primary">
                    {{ $t('account.cart.summary.title') }}
                  </h2>

                  <div v-if="summaryPreviewItem" class="mt-5 flex items-start gap-4">
                    <div class="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-2xl border border-borderSecondary bg-[#f3f3f1]">
                      <img
                        v-if="summaryPreviewItem.previewImage"
                        :src="summaryPreviewItem.previewImage"
                        :alt="summaryPreviewItem.productName"
                        class="h-full w-full object-cover"
                      >
                      <div
                        v-else
                        class="flex h-full w-full items-center justify-center text-[#9aa0a8]"
                      >
                        <Icon name="ph:t-shirt-light" class="size-[26px]" />
                      </div>
                      <span class="absolute right-1 top-0 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full border border-white bg-white px-1 text-[11px] font-semibold text-primary shadow-[0_10px_24px_rgba(17,19,20,0.08)]">
                        {{ summaryPreviewItem.quantity }}
                      </span>
                    </div>

                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-primary">
                        {{ summaryPreviewItem.productName }}
                      </p>
                      <p class="mt-1 text-xs text-[#686f72]">
                        {{ summaryPreviewItem.colorName || $t('account.cart.item.colorMissing') }}
                      </p>
                    </div>
                  </div>

                  <div class="mt-6 space-y-3 border-t border-dashed border-borderSecondary pt-5 text-sm text-[#686f72]">
                    <div class="flex items-center justify-between gap-4">
                      <span>{{ $t('account.cart.summary.productCost') }}</span>
                      <span class="font-medium text-primary">{{ orderSummary.productCostLabel }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4">
                      <span>{{ $t('account.cart.summary.customization') }}</span>
                      <span class="font-medium text-primary">{{ orderSummary.customizationCostLabel }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4">
                      <span>{{ $t('account.cart.summary.shipping') }}</span>
                      <span class="font-medium text-primary">{{ $t('account.cart.summary.tbd') }}</span>
                    </div>
                  </div>

                  <div class="mt-6 flex items-center justify-between gap-4 border-t border-borderSecondary pt-5">
                    <span class="text-[2rem] font-semibold leading-none text-primary">{{ $t('account.cart.summary.total') }}</span>
                    <span class="text-[2rem] font-semibold leading-none text-primary">{{ orderSummary.totalLabel }}</span>
                  </div>

                  <button
                    type="button"
                    class="mt-6 flex h-12 w-full items-center justify-center rounded-2xl text-base font-semibold text-white transition"
                    :class="isCheckoutDisabled ? 'cursor-not-allowed bg-[#c8ccd2] text-white/90' : 'bg-primary hover:opacity-90'"
                    :disabled="isCheckoutDisabled"
                    @click="handleCheckout"
                  >
                    {{ $t('account.cart.actions.checkout') }}
                  </button>

                  <button
                    type="button"
                    class="mt-3 flex h-11 w-full items-center justify-center rounded-2xl border border-borderSecondary text-sm font-semibold text-primary transition hover:bg-[#f5f5f3]"
                    @click="clearCartItems"
                  >
                    {{ $t('account.cart.actions.clear') }}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </template>

        <template #fallback>
          <CartPageSkeleton :rows="3" />
        </template>
      </ClientOnly>
    </div>
  </section>
</template>
