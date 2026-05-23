<script setup lang="ts">
import type { CheckoutOrderListItem } from '~~/types/checkout'
import type { StorefrontFetchError } from '~~/types/storefront'

definePageMeta({
  layout: 'blank',
  middleware: 'auth',
})

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { listOrders, cancelOrder } = useStripeCheckout()

const orders = shallowRef<CheckoutOrderListItem[]>([])
const ordersLoading = shallowRef(false)
const ordersError = shallowRef('')
const activeStatus = shallowRef('all')
const cancellingOrder = shallowRef<string | null>(null)

const CANCELLABLE_STATUSES: (CheckoutOrderListItem['status'])[] = ['draft', 'awaiting_payment', 'payment_failed']

const isCancellable = (order: CheckoutOrderListItem) =>
  CANCELLABLE_STATUSES.includes(order.status)

useSeoMeta({
  title: () => t('account.orders.seo.title'),
  description: () => t('account.orders.seo.description'),
})

const orderTabs = computed(() => [
  { id: 'all', label: t('account.orders.tabs.all') },
  { id: 'in_review', label: t('account.orders.tabs.inReview') },
  { id: 'in_production', label: t('account.orders.tabs.inProduction') },
  { id: 'shipped', label: t('account.orders.tabs.shipped') },
  { id: 'delivered', label: t('account.orders.tabs.delivered') },
  { id: 'canceled', label: t('account.orders.tabs.canceled') },
])

const dateLocale = computed(() => locale.value === 'es' ? 'es-MX' : 'en-US')

const formatDate = (value?: string | null) => {
  if (!value)
    return t('account.orders.labels.pending')

  const date = new Date(value)

  if (Number.isNaN(date.getTime()))
    return t('account.orders.labels.pending')

  return new Intl.DateTimeFormat(dateLocale.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const formatMoney = (value: string | number, currency = 'USD') => {
  const amount = typeof value === 'number'
    ? value
    : Number.parseFloat(String(value).replace(/[^0-9.-]+/g, ''))

  return new Intl.NumberFormat(dateLocale.value, {
    style: 'currency',
    currency,
  }).format(Number.isFinite(amount) ? amount : 0)
}

const filteredOrders = computed(() => {
  if (activeStatus.value === 'all')
    return orders.value

  return orders.value.filter((order) => {
    return getOrderFulfillmentStatus(order).status === activeStatus.value
  })
})

const fetchOrders = async () => {
  ordersLoading.value = true
  ordersError.value = ''

  try {
    const response = await listOrders()
    orders.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    const storefrontError = error as StorefrontFetchError
    ordersError.value = storefrontError?.data?.message ?? t('account.orders.errors.load')
  } finally {
    ordersLoading.value = false
  }
}

const handleCancelOrder = async (order: CheckoutOrderListItem) => {
  if (!window.confirm(t('account.orders.actions.cancelConfirm', { number: order.number })))
    return

  cancellingOrder.value = order.number

  try {
    await cancelOrder(order.number)
    ElMessage.success(t('account.orders.actions.cancelSuccess', { number: order.number }))
    await fetchOrders()
  }
  catch {
    ElMessage.error(t('account.orders.errors.cancel'))
  }
  finally {
    cancellingOrder.value = null
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <section class="min-h-screen bg-white text-primary">
    <div class="flex min-h-screen">
      <aside class="hidden w-[240px] shrink-0 border-r border-borderSecondary bg-[#f2f2f1] px-4 py-6 lg:block">
        <NuxtLink
          :to="localePath('/account/orders')"
          class="flex h-11 items-center gap-3 rounded-lg bg-white px-4 text-sm font-semibold text-primary shadow-[0_8px_20px_rgba(17,19,20,0.03)]"
        >
          <Icon name="ph:package" class="size-[18px]" />
          <span>{{ $t('account.orders.title') }}</span>
        </NuxtLink>
      </aside>

      <div class="min-w-0 flex-1 px-5 py-8 lg:px-16">
        <div class="mx-auto max-w-[1180px]">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <h1 class="text-[2.4rem] font-semibold leading-none text-primary">
              {{ $t('account.orders.title') }}
            </h1>

            <button
              type="button"
              class="inline-flex h-10 items-center gap-2 rounded-full border border-borderSecondary px-5 text-sm font-semibold text-primary transition hover:border-primary"
            >
              <span>{{ $t('account.orders.manage') }}</span>
              <Icon name="ph:caret-down" class="size-[16px]" />
            </button>
          </div>

          <div class="mt-8 flex flex-wrap gap-8 border-b border-borderSecondary text-sm font-semibold text-[#667085]">
            <button
              v-for="tab in orderTabs"
              :key="tab.id"
              type="button"
              class="-mb-px border-b-2 pb-3 transition"
              :class="activeStatus === tab.id ? 'border-primary text-primary' : 'border-transparent hover:text-primary'"
              @click="activeStatus = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="mt-4 overflow-x-auto">
            <div class="orders-table-grid border-b border-borderSecondary pb-3 text-sm font-medium text-[#98a2b3]">
              <input
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-borderSecondary text-primary focus:ring-primary"
                :aria-label="$t('account.orders.actions.selectAll')"
              >
              <span>{{ $t('account.orders.columns.product') }}</span>
              <span>{{ $t('account.orders.columns.orderId') }}</span>
              <span>{{ $t('account.orders.columns.dateCustomer') }}</span>
              <span>{{ $t('account.orders.columns.status') }}</span>
              <span>{{ $t('account.orders.columns.action') }}</span>
            </div>

            <div
              v-if="ordersLoading"
              class="flex min-h-[360px] items-center justify-center text-sm text-[#8a8f98]"
            >
              {{ $t('account.orders.loading') }}
            </div>

            <div
              v-else-if="ordersError"
              class="flex min-h-[360px] flex-col items-center justify-center text-center"
            >
              <Icon name="ph:warning-circle" class="size-[48px] text-[#f04438]" />
              <p class="mt-4 text-sm text-[#f04438]">
                {{ ordersError }}
              </p>
              <button
                type="button"
                class="mt-5 rounded-xl border border-primary px-5 py-2 text-sm font-semibold text-primary"
                @click="fetchOrders"
              >
                {{ $t('account.orders.actions.retry') }}
              </button>
            </div>

            <div
              v-else-if="!filteredOrders.length"
              class="flex min-h-[360px] flex-col items-center justify-center text-center"
            >
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3f4f6] text-[#b8bdc5]">
                <Icon name="ph:clipboard-text" class="size-[36px]" />
              </div>
              <p class="mt-4 text-sm text-[#8a8f98]">
                {{ $t('account.orders.empty') }}
              </p>
            </div>

            <div
              v-else
              class="divide-y divide-borderSecondary"
            >
              <div
                v-for="order in filteredOrders"
                :key="order.number"
                class="orders-table-grid items-center py-4 text-sm"
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-borderSecondary text-primary focus:ring-primary"
                  :aria-label="$t('account.orders.actions.selectOrder', { number: order.number })"
                >

                <div class="flex min-w-0 items-center gap-3">
                  <div class="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-borderSecondary bg-[#f3f3f1]">
                    <img
                      v-if="order.preview_image"
                      :src="order.preview_image"
                      :alt="order.product_name || order.number"
                      class="h-full w-full object-cover"
                    >
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center text-[#9aa0a8]"
                    >
                      <Icon name="ph:package" class="size-[22px]" />
                    </div>
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-semibold text-primary">
                      {{ order.product_name || $t('account.orders.labels.itemOrder', { count: order.items_count ?? 1 }) }}
                    </p>
                    <p class="mt-1 truncate text-xs text-[#667085]">
                      {{ order.product_sku || $t('account.orders.labels.units', { count: order.units_count ?? 0 }) }}
                    </p>
                  </div>
                </div>

                <span class="font-medium text-primary">{{ order.number }}</span>

                <div>
                  <p class="font-medium text-primary">
                    {{ formatDate(order.created_at) }}
                  </p>
                  <p class="mt-1 text-xs text-[#667085]">
                    {{ order.customer_name || $t('account.orders.labels.customer') }}
                  </p>
                </div>

                <span class="inline-flex w-fit rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-semibold text-primary">
                  {{ getOrderFulfillmentStatus(order).label }}
                </span>

                <div class="flex items-center justify-between gap-3">
                  <span class="font-semibold text-primary">
                    {{ formatMoney(order.total, order.currency) }}
                  </span>
                  <div class="flex items-center gap-2">
                    <NuxtLink
                      :to="localePath(`/account/orders/${order.number}`)"
                      class="text-sm font-semibold text-primary underline decoration-black/20 underline-offset-4"
                    >
                      {{ $t('account.orders.actions.view') }}
                    </NuxtLink>
                    <button
                      type="button"
                      :disabled="!isCancellable(order) || cancellingOrder === order.number"
                      class="text-sm font-semibold text-[#f04438] underline decoration-[#f04438]/30 underline-offset-4 transition disabled:cursor-not-allowed disabled:opacity-35"
                      @click="handleCancelOrder(order)"
                    >
                      {{ cancellingOrder === order.number ? '…' : $t('account.orders.actions.cancel') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.orders-table-grid {
  display: grid;
  grid-template-columns: 28px minmax(220px, 1.2fr) 180px 190px 140px 160px;
  column-gap: 1.25rem;
}

@media (max-width: 1023px) {
  .orders-table-grid {
    grid-template-columns: 28px minmax(220px, 1fr) 160px 160px 120px 140px;
    min-width: 960px;
  }
}
</style>
