<script setup lang="ts">
import type {
  CheckoutOrderAddress,
  CheckoutOrderDetail,
  CheckoutOrderDetailItem,
  CheckoutOrderShipment,
  CheckoutOrderTimelineStep,
} from '~~/types/checkout'
import type { StorefrontFetchError } from '~~/types/storefront'

definePageMeta({
  layout: 'blank',
  middleware: 'auth',
})

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getOrder } = useStripeCheckout()

const order = shallowRef<CheckoutOrderDetail | null>(null)
const orderLoading = shallowRef(false)
const orderError = shallowRef('')

const orderNumber = computed(() => {
  const value = route.params.number
  const rawValue = Array.isArray(value) ? value[0] : value

  return decodeURIComponent(String(rawValue ?? ''))
})

useSeoMeta({
  title: () => t('account.orderDetail.seo.title', { number: orderNumber.value || t('account.orderDetail.fallbackOrder') }),
  description: () => t('account.orderDetail.seo.description'),
})

const dateLocale = computed(() => locale.value === 'es' ? 'es-MX' : 'en-US')

const statusLabel = (value?: unknown) => {
  return formatOrderStatusLabel(value)
}

const formatDate = (value?: unknown) => {
  if (!value)
    return t('account.orders.labels.pending')

  const date = new Date(String(value))

  if (Number.isNaN(date.getTime()))
    return t('account.orders.labels.pending')

  return new Intl.DateTimeFormat(dateLocale.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const formatMoney = (value?: unknown, currency = 'USD') => {
  const amount = typeof value === 'number'
    ? value
    : Number.parseFloat(String(value ?? '').replace(/[^0-9.-]+/g, ''))

  return new Intl.NumberFormat(dateLocale.value, {
    style: 'currency',
    currency,
  }).format(Number.isFinite(amount) ? amount : 0)
}

const coerceString = (value?: unknown) => {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

const orderCurrency = computed(() => coerceString(order.value?.currency) || 'USD')

const orderItems = computed<CheckoutOrderDetailItem[]>(() => {
  return Array.isArray(order.value?.items) ? order.value.items : []
})

const orderFulfillmentStatus = computed(() => {
  return getOrderFulfillmentStatus(order.value)
})

const orderTimeline = computed<CheckoutOrderTimelineStep[]>(() => {
  if (Array.isArray(order.value?.timeline))
    return order.value.timeline

  if (Array.isArray(order.value?.fulfillment?.timeline))
    return order.value.fulfillment.timeline

  return []
})

const shipments = computed<CheckoutOrderShipment[]>(() => {
  if (order.value?.shipment)
    return [order.value.shipment]

  return Array.isArray(order.value?.shipments) ? order.value.shipments : []
})

const shippingAddress = computed<CheckoutOrderAddress | null>(() => {
  return order.value?.shipping_address ?? null
})

const customerName = computed(() => {
  const customer = order.value?.customer
  const address = shippingAddress.value
  const addressName = [address?.first_name, address?.last_name].map(coerceString).filter(Boolean).join(' ')

  return coerceString(customer?.name)
    || coerceString(address?.full_name)
    || addressName
    || t('account.orders.labels.customer')
})

const customerEmail = computed(() => {
  return coerceString(order.value?.customer?.email) || coerceString(shippingAddress.value?.email)
})

const customerPhone = computed(() => {
  return coerceString(order.value?.customer?.phone)
    || coerceString(shippingAddress.value?.phone)
    || coerceString(shippingAddress.value?.phone_number)
})

const addressLines = computed(() => {
  const address = shippingAddress.value

  if (!address)
    return []

  if (coerceString(address.formatted_address))
    return [coerceString(address.formatted_address)]

  const cityLine = [
    address.city,
    address.state_code || address.state,
    address.postal_code,
  ].map(coerceString).filter(Boolean).join(', ')

  return [
    coerceString(address.address_line_1),
    coerceString(address.address_line_2),
    cityLine,
    coerceString(address.country_code),
  ].filter(Boolean)
})

const itemQuantity = (item: CheckoutOrderDetailItem) => {
  if (typeof item.quantity_total === 'number')
    return item.quantity_total

  if (typeof item.quantity === 'number')
    return item.quantity

  if (Array.isArray(item.sizes))
    return item.sizes.reduce((total, size) => total + Math.max(0, Number(size.quantity ?? 0)), 0)

  return 0
}

const itemTotal = (item: CheckoutOrderDetailItem) => {
  return item.pricing?.total ?? item.total ?? 0
}

const fetchOrder = async () => {
  if (!orderNumber.value) {
    orderError.value = t('account.orderDetail.errors.missingNumber')
    return
  }

  orderLoading.value = true
  orderError.value = ''

  try {
    const response = await getOrder(orderNumber.value)
    order.value = response.data
  } catch (error) {
    const storefrontError = error as StorefrontFetchError
    orderError.value = storefrontError?.data?.message ?? t('account.orderDetail.errors.load')
  } finally {
    orderLoading.value = false
  }
}

onMounted(() => {
  fetchOrder()
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
          <Icon name="icon:package" class="size-[18px]" />
          <span>{{ $t('account.orders.title') }}</span>
        </NuxtLink>
      </aside>

      <div class="min-w-0 flex-1 px-5 py-8 lg:px-16">
        <div class="mx-auto max-w-[1180px]">
          <NuxtLink
            :to="localePath('/account/orders')"
            class="inline-flex items-center gap-2 text-sm font-semibold text-[#667085] transition hover:text-primary"
          >
            <Icon name="icon:arrow-left" class="size-[16px]" />
            <span>{{ $t('account.orderDetail.back') }}</span>
          </NuxtLink>

          <div class="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-[#667085]">
                {{ $t('account.orderDetail.eyebrow') }}
              </p>
              <h1 class="mt-2 text-[2.25rem] font-semibold leading-none text-primary">
                {{ orderNumber }}
              </h1>
            </div>

            <button
              type="button"
              class="inline-flex h-10 items-center gap-2 rounded-full border border-borderSecondary px-5 text-sm font-semibold text-primary transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="orderLoading"
              @click="fetchOrder"
            >
              <Icon name="icon:arrow-clockwise" class="size-[16px]" />
              <span>{{ orderLoading ? $t('account.orderDetail.refreshing') : $t('account.orderDetail.refresh') }}</span>
            </button>
          </div>

          <div
            v-if="orderLoading"
            class="mt-10 flex min-h-[360px] items-center justify-center rounded-3xl border border-borderSecondary text-sm text-[#8a8f98]"
          >
            {{ $t('account.orderDetail.loading') }}
          </div>

          <div
            v-else-if="orderError"
            class="mt-10 flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-borderSecondary text-center"
          >
            <Icon name="icon:warning-circle" class="size-[48px] text-[#f04438]" />
            <p class="mt-4 text-sm text-[#f04438]">
              {{ orderError }}
            </p>
            <button
              type="button"
              class="mt-5 rounded-xl border border-primary px-5 py-2 text-sm font-semibold text-primary"
              @click="fetchOrder"
            >
              {{ $t('account.orders.actions.retry') }}
            </button>
          </div>

          <div
            v-else-if="order"
            class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
          >
            <div class="space-y-6">
              <section class="rounded-3xl border border-borderSecondary bg-white p-6">
                <div class="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">
                      {{ $t('account.orderDetail.fields.status') }}
                    </p>
                    <span class="mt-2 inline-flex rounded-full bg-[#f3f4f6] px-3 py-1 text-sm font-semibold text-primary">
                      {{ orderFulfillmentStatus.label }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">
                      {{ $t('account.orderDetail.fields.payment') }}
                    </p>
                    <p class="mt-2 text-sm font-semibold text-primary">
                      {{ statusLabel(order.payment_status) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">
                      {{ $t('account.orderDetail.fields.created') }}
                    </p>
                    <p class="mt-2 text-sm font-semibold text-primary">
                      {{ formatDate(order.created_at) }}
                    </p>
                  </div>
                </div>
              </section>

              <section class="rounded-3xl border border-borderSecondary bg-white p-6">
                <div class="flex items-center justify-between gap-4 border-b border-borderSecondary pb-4">
                  <h2 class="text-lg font-semibold text-primary">
                    {{ $t('account.orderDetail.products.title') }}
                  </h2>
                  <span class="text-sm text-[#667085]">
                    {{ $t('account.orderDetail.products.count', { count: orderItems.length }) }}
                  </span>
                </div>

                <div
                  v-if="!orderItems.length"
                  class="py-10 text-center text-sm text-[#8a8f98]"
                >
                  {{ $t('account.orderDetail.products.empty') }}
                </div>

                <div
                  v-else
                  class="divide-y divide-borderSecondary"
                >
                  <article
                    v-for="item in orderItems"
                    :key="String(item.id ?? item.product_handle ?? item.product_name)"
                    class="grid gap-4 py-5 md:grid-cols-[72px_minmax(0,1fr)_120px]"
                  >
                    <div class="h-[72px] w-[72px] overflow-hidden rounded-2xl border border-borderSecondary bg-[#f3f3f1]">
                      <img
                        v-if="item.preview_image"
                        :src="item.preview_image"
                        :alt="item.product_name || $t('account.orderDetail.products.itemFallback')"
                        class="h-full w-full object-cover"
                      >
                      <div
                        v-else
                        class="flex h-full w-full items-center justify-center text-[#9aa0a8]"
                      >
                        <Icon name="icon:package" class="size-[24px]" />
                      </div>
                    </div>

                    <div class="min-w-0">
                      <h3 class="truncate text-sm font-semibold text-primary">
                        {{ item.product_name || $t('account.orderDetail.products.itemFallback') }}
                      </h3>
                      <p
                        v-if="item.product_sku"
                        class="mt-1 text-xs text-[#667085]"
                      >
                        {{ item.product_sku }}
                      </p>
                      <div class="mt-3 flex flex-wrap gap-2 text-xs text-[#667085]">
                        <span v-if="item.color?.name" class="rounded-full bg-[#f3f4f6] px-2 py-1">
                          {{ item.color.name }}
                        </span>
                        <span v-if="item.technique?.name" class="rounded-full bg-[#f3f4f6] px-2 py-1">
                          {{ item.technique.name }}
                        </span>
                        <span
                          v-for="placement in item.placements ?? []"
                          :key="placement"
                          class="rounded-full bg-[#f3f4f6] px-2 py-1"
                        >
                          {{ placement }}
                        </span>
                      </div>

                      <div
                        v-if="item.sizes?.length"
                        class="mt-3 flex flex-wrap gap-2 text-xs"
                      >
                        <span
                          v-for="size in item.sizes"
                          :key="`${size.size_id ?? size.label}-${size.quantity}`"
                          class="rounded-lg border border-borderSecondary px-2 py-1 text-primary"
                        >
                          {{ size.label || size.size_id }}: {{ size.quantity ?? 0 }}
                        </span>
                      </div>
                    </div>

                    <div class="text-left md:text-right">
                      <p class="text-xs text-[#667085]">
                        {{ $t('account.orderDetail.products.quantity', { count: itemQuantity(item) }) }}
                      </p>
                      <p class="mt-2 text-sm font-semibold text-primary">
                        {{ formatMoney(itemTotal(item), orderCurrency) }}
                      </p>
                    </div>
                  </article>
                </div>
              </section>

              <section
                v-if="orderTimeline.length"
                class="rounded-3xl border border-borderSecondary bg-white p-6"
              >
                <h2 class="text-lg font-semibold text-primary">
                  {{ $t('account.orderDetail.timeline.title') }}
                </h2>

                <ol class="mt-5 space-y-4">
                  <li
                    v-for="(step, index) in orderTimeline"
                    :key="`${index}-${step.status ?? step.frontend_status ?? step.label ?? 'timeline-step'}`"
                    class="flex gap-3"
                  >
                    <span
                      class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                      :class="step.completed ? 'border-primary bg-primary text-white' : 'border-borderSecondary bg-white text-[#98a2b3]'"
                    >
                      <Icon
                        v-if="step.completed"
                        name="ph:check"
                        class="size-[12px]"
                      />
                    </span>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-primary">
                        {{ getOrderFulfillmentStatus(step).label }}
                      </p>
                      <p
                        v-if="step.completed_at || step.date"
                        class="mt-1 text-xs text-[#667085]"
                      >
                        {{ formatDate(step.completed_at || step.date) }}
                      </p>
                    </div>
                  </li>
                </ol>
              </section>

              <section class="rounded-3xl border border-borderSecondary bg-white p-6">
                <h2 class="text-lg font-semibold text-primary">
                  {{ $t('account.orderDetail.shipping.title') }}
                </h2>

                <div
                  v-if="!shipments.length"
                  class="mt-4 text-sm text-[#8a8f98]"
                >
                  {{ $t('account.orderDetail.shipping.empty') }}
                </div>

                <div
                  v-else
                  class="mt-4 space-y-3"
                >
                  <div
                    v-for="shipment in shipments"
                    :key="`${shipment.carrier ?? 'shipment'}-${shipment.tracking_number ?? shipment.service ?? ''}`"
                    class="rounded-2xl bg-[#f7f7f5] p-4 text-sm"
                  >
                    <div class="flex flex-wrap items-center justify-between gap-3">
                      <p class="font-semibold text-primary">
                        {{ shipment.carrier || $t('account.orderDetail.shipping.carrierPending') }}
                        <span v-if="shipment.service" class="font-normal text-[#667085]">
                          · {{ shipment.service }}
                        </span>
                      </p>
                      <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
                        {{ statusLabel(shipment.status) }}
                      </span>
                    </div>
                    <a
                      v-if="shipment.tracking_url"
                      :href="shipment.tracking_url"
                      target="_blank"
                      rel="noreferrer"
                      class="mt-3 inline-flex text-sm font-semibold underline decoration-black/20 underline-offset-4"
                    >
                      {{ $t('account.orderDetail.shipping.track', { number: shipment.tracking_number || $t('account.orderDetail.shipping.shipment') }) }}
                    </a>
                    <p
                      v-else-if="shipment.tracking_number"
                      class="mt-3 text-sm text-[#667085]"
                    >
                      {{ $t('account.orderDetail.shipping.tracking', { number: shipment.tracking_number }) }}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside class="space-y-6">
              <section class="rounded-3xl border border-borderSecondary bg-white p-6 shadow-[0_18px_40px_rgba(17,19,20,0.04)]">
                <h2 class="text-lg font-semibold text-primary">
                  {{ $t('account.orderDetail.summary.title') }}
                </h2>

                <dl class="mt-5 space-y-3 text-sm">
                  <div class="flex justify-between gap-4">
                    <dt class="text-[#667085]">
                      {{ $t('account.orderDetail.summary.subtotal') }}
                    </dt>
                    <dd class="font-semibold text-primary">
                      {{ formatMoney(order.subtotal, orderCurrency) }}
                    </dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-[#667085]">
                      {{ $t('account.orderDetail.summary.shipping') }}
                    </dt>
                    <dd class="font-semibold text-primary">
                      {{ formatMoney(order.shipping_amount, orderCurrency) }}
                    </dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-[#667085]">
                      {{ $t('account.orderDetail.summary.discount') }}
                    </dt>
                    <dd class="font-semibold text-primary">
                      {{ formatMoney(order.discount_amount, orderCurrency) }}
                    </dd>
                  </div>
                  <div class="flex justify-between gap-4 border-t border-borderSecondary pt-4 text-base">
                    <dt class="font-semibold text-primary">
                      {{ $t('account.orderDetail.summary.total') }}
                    </dt>
                    <dd class="font-semibold text-primary">
                      {{ formatMoney(order.total, orderCurrency) }}
                    </dd>
                  </div>
                </dl>
              </section>

              <section class="rounded-3xl border border-borderSecondary bg-white p-6">
                <h2 class="text-lg font-semibold text-primary">
                  {{ $t('account.orderDetail.customer.title') }}
                </h2>
                <div class="mt-4 space-y-1 text-sm text-[#667085]">
                  <p class="font-semibold text-primary">
                    {{ customerName }}
                  </p>
                  <p v-if="customerEmail">
                    {{ customerEmail }}
                  </p>
                  <p v-if="customerPhone">
                    {{ customerPhone }}
                  </p>
                </div>
              </section>

              <section class="rounded-3xl border border-borderSecondary bg-white p-6">
                <h2 class="text-lg font-semibold text-primary">
                  {{ $t('account.orderDetail.address.title') }}
                </h2>
                <div
                  v-if="addressLines.length"
                  class="mt-4 space-y-1 text-sm text-[#667085]"
                >
                  <p
                    v-for="line in addressLines"
                    :key="line"
                  >
                    {{ line }}
                  </p>
                </div>
                <p
                  v-else
                  class="mt-4 text-sm text-[#8a8f98]"
                >
                  {{ $t('account.orderDetail.address.empty') }}
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
