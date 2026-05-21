<script setup lang="ts">
import type { CheckoutPaymentStatusData } from '~~/types/checkout'
import type { StorefrontFetchError } from '~~/types/storefront'

definePageMeta({
  layout: 'blank',
})

const route = useRoute()
const { t } = useI18n()
const { getPaymentStatus } = useStripeCheckout()
const { clearCartItems } = useDesignCart()

const orderNumber = computed(() => {
  const raw = Array.isArray(route.query.order) ? route.query.order[0] : route.query.order
  return typeof raw === 'string' ? raw : ''
})

const paymentStatus = ref<CheckoutPaymentStatusData | null>(null)
const statusLoading = ref(false)
const statusError = ref('')
const redirecting = ref(false)
const pollAttempts = ref(0)
const maxPollAttempts = 20
let pollTimer: ReturnType<typeof setTimeout> | null = null

useSeoMeta({
  title: t('checkoutResult.seo.title'),
  description: t('checkoutResult.seo.description'),
})

const clearPollTimer = () => {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

const isTerminalStatus = (status: CheckoutPaymentStatusData | null) => {
  return Boolean(
    status
    && (
      (status.status === 'paid' && status.payment_status === 'succeeded')
      || status.status === 'payment_failed'
      || status.status === 'cancelled'
    ),
  )
}

const statusTitle = computed(() => {
  if (!orderNumber.value) {
    return t('checkoutResult.status.missingOrder')
  }

  if (!paymentStatus.value) {
    return statusLoading.value ? t('checkoutResult.status.checking') : t('checkoutResult.status.paymentStatus')
  }

  if (paymentStatus.value.status === 'paid' && paymentStatus.value.payment_status === 'succeeded') {
    return t('checkoutResult.status.confirmed')
  }

  if (paymentStatus.value.status === 'payment_failed') {
    return t('checkoutResult.status.failed')
  }

  if (paymentStatus.value.status === 'cancelled') {
    return t('checkoutResult.status.cancelled')
  }

  return t('checkoutResult.status.processing')
})

const statusDescription = computed(() => {
  if (!orderNumber.value) {
    return t('checkoutResult.description.missingOrder')
  }

  if (paymentStatus.value?.payment_failure_message) {
    return paymentStatus.value.payment_failure_message
  }

  if (paymentStatus.value?.status === 'paid' && paymentStatus.value.payment_status === 'succeeded') {
    return t('checkoutResult.description.confirmed')
  }

  if (paymentStatus.value?.status === 'payment_failed') {
    return t('checkoutResult.description.failed')
  }

  return t('checkoutResult.description.processing')
})

const fetchStatus = async () => {
  if (!orderNumber.value) {
    return
  }

  statusLoading.value = true
  statusError.value = ''

  try {
    const response = await getPaymentStatus(orderNumber.value)
    paymentStatus.value = response.data

    if (response.data.status === 'paid' && response.data.payment_status === 'succeeded') {
      clearPollTimer()
      redirecting.value = true
      await clearCartItems({ optimistic: true }).catch(() => undefined)
      await navigateTo('/account/orders')
      return
    }

    if (!isTerminalStatus(response.data) && pollAttempts.value < maxPollAttempts) {
      pollAttempts.value += 1
      clearPollTimer()
      pollTimer = setTimeout(() => {
        fetchStatus()
      }, 3000)
    }
  } catch (error) {
    const storefrontError = error as StorefrontFetchError
    statusError.value = storefrontError?.data?.message ?? t('checkoutResult.errors.checkStatus')
  } finally {
    statusLoading.value = false
  }
}

onMounted(() => {
  fetchStatus()
})

onBeforeUnmount(() => {
  clearPollTimer()
})
</script>

<template>
  <main class="min-h-screen bg-[#f7f7f7] text-primary">
    <div class="px-5 pb-12 pt-8 lg:px-8">
      <section class="mx-auto max-w-[720px] rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_18px_54px_rgba(17,19,20,0.05)] md:px-12">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f4f6] text-primary">
          <Icon
            :name="paymentStatus?.status === 'paid' ? 'ph:check-circle' : paymentStatus?.status === 'payment_failed' ? 'ph:x-circle' : 'ph:clock-countdown'"
            size="36px"
          />
        </div>

        <h1 class="mt-6 text-[2.5rem] font-semibold leading-none text-primary">
          {{ statusTitle }}
        </h1>

        <p class="mx-auto mt-4 max-w-[520px] text-base leading-7 text-[#667085]">
          {{ statusDescription }}
        </p>

        <div
          v-if="orderNumber"
          class="mx-auto mt-8 max-w-[440px] rounded-2xl border border-borderSecondary bg-[#f8f8f7] px-5 py-4 text-left"
        >
          <div class="flex items-center justify-between gap-4 text-sm">
            <span class="text-[#667085]">{{ t('checkoutResult.fields.order') }}</span>
            <span class="font-semibold text-primary">{{ orderNumber }}</span>
          </div>
          <div
            v-if="paymentStatus"
            class="mt-3 flex items-center justify-between gap-4 text-sm"
          >
            <span class="text-[#667085]">{{ t('checkoutResult.fields.paymentStatus') }}</span>
            <span class="font-semibold text-primary">{{ paymentStatus.payment_status }}</span>
          </div>
          <div
            v-if="paymentStatus"
            class="mt-3 flex items-center justify-between gap-4 text-sm"
          >
            <span class="text-[#667085]">{{ t('checkoutResult.fields.orderStatus') }}</span>
            <span class="font-semibold text-primary">{{ paymentStatus.status }}</span>
          </div>
        </div>

        <p
          v-if="statusError"
          class="mt-5 text-sm text-[#f04438]"
        >
          {{ statusError }}
        </p>

        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            class="inline-flex h-12 min-w-[160px] items-center justify-center rounded-2xl border border-primary px-6 text-sm font-semibold text-primary transition hover:bg-[#f5f5f3]"
            :disabled="statusLoading || redirecting"
            @click="fetchStatus"
          >
            {{ redirecting ? t('checkoutResult.actions.redirecting') : statusLoading ? t('checkoutResult.actions.checking') : t('checkoutResult.actions.refresh') }}
          </button>

          <NuxtLink
            to="/account/orders"
            class="inline-flex h-12 min-w-[160px] items-center justify-center rounded-2xl bg-primary px-6 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {{ t('checkoutResult.actions.viewOrders') }}
          </NuxtLink>
        </div>
      </section>
    </div>
  </main>
</template>
