<script setup lang="ts">
import type { Stripe, StripeElements } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const props = defineProps<{
  clientSecret: string
  orderNumber: string
  amountLabel: string
}>()

const emit = defineEmits<{
  ready: [ready: boolean]
  submitting: [submitting: boolean]
  confirmed: []
  error: [message: string]
}>()

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const stripeElementRef = ref<HTMLElement | null>(null)
const stripe = shallowRef<Stripe | null>(null)
const elements = shallowRef<StripeElements | null>(null)
const loading = ref(false)
const initializing = ref(false)
const inlineError = ref('')

const publishableKey = computed(() => runtimeConfig.public.stripePublishableKey)

const stripeReturnUrl = computed(() => {
  if (!import.meta.client) {
    return ''
  }

  const url = new URL('/checkout/result', window.location.origin)
  url.searchParams.set('order', props.orderNumber)
  return url.toString()
})

const resetMountedElement = () => {
  if (stripeElementRef.value) {
    stripeElementRef.value.innerHTML = ''
  }

  elements.value = null
  emit('ready', false)
}

const mountPaymentElement = async () => {
  if (!import.meta.client || !stripeElementRef.value || !props.clientSecret) {
    return
  }

  resetMountedElement()
  inlineError.value = ''

  if (!publishableKey.value) {
    inlineError.value = t('checkoutStripe.errors.missingKey')
    emit('error', inlineError.value)
    return
  }

  initializing.value = true

  try {
    stripe.value = await loadStripe(publishableKey.value)

    if (!stripe.value) {
      throw new Error(t('checkoutStripe.errors.initialize'))
    }

    const nextElements = stripe.value.elements({
      clientSecret: props.clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#111314',
          colorText: '#111314',
          borderRadius: '12px',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      },
    })

    nextElements.create('payment', {
      layout: 'accordion',
    }).mount(stripeElementRef.value)

    elements.value = nextElements
    emit('ready', true)
  } catch (error) {
    inlineError.value = error instanceof Error ? error.message : t('checkoutStripe.errors.loadForm')
    emit('error', inlineError.value)
    emit('ready', false)
  } finally {
    initializing.value = false
  }
}

const submit = async () => {
  if (!stripe.value || !elements.value || loading.value) {
    return
  }

  inlineError.value = ''
  loading.value = true
  emit('submitting', true)

  try {
    const { error } = await stripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: stripeReturnUrl.value,
      },
      redirect: 'if_required',
    })

    if (error) {
      inlineError.value = error.message ?? t('checkoutStripe.errors.confirmPayment')
      emit('error', inlineError.value)
      return
    }

    emit('confirmed')
  } catch (error) {
    inlineError.value = error instanceof Error ? error.message : t('checkoutStripe.errors.confirmPayment')
    emit('error', inlineError.value)
  } finally {
    loading.value = false
    emit('submitting', false)
  }
}

watch(
  () => props.clientSecret,
  () => mountPaymentElement(),
)

onMounted(() => {
  mountPaymentElement()
})

defineExpose({
  submit,
})
</script>

<template>
  <div class="rounded-[20px] border border-borderSecondary bg-white p-5">
    <div class="mb-5 flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-primary">
          {{ t('checkoutStripe.title') }}
        </p>
        <p class="mt-1 text-sm text-[#667085]">
          {{ t('checkoutStripe.description') }}
        </p>
      </div>
      <p class="text-sm font-semibold text-primary">
        {{ amountLabel }}
      </p>
    </div>

    <div
      ref="stripeElementRef"
      class="min-h-[188px]"
    />

    <div
      v-if="initializing"
      class="mt-4 rounded-xl bg-[#f5f6f7] px-4 py-3 text-sm text-[#667085]"
    >
      {{ t('checkoutStripe.loading') }}
    </div>

    <p
      v-if="inlineError"
      class="mt-4 text-sm text-[#f04438]"
    >
      {{ inlineError }}
    </p>
  </div>
</template>
