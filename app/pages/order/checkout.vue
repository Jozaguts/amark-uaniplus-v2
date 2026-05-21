<script setup lang="ts">
import dayjs from 'dayjs'
import CartPageSkeleton from '~/components/skeletons/CartPageSkeleton.vue'
import StripePaymentForm from '~/components/checkout/StripePaymentForm.vue'
import type { AccountAddress, AccountAddressPayload } from '~~/types/address'
import type {
  CheckoutOrder,
  CheckoutPaymentIntent,
  CheckoutQuoteAddressPayload,
  CheckoutSelectedRate,
  CheckoutShippingNormalizedAddress,
  CheckoutShippingRate,
  CheckoutTotals,
} from '~~/types/checkout'
import type { DesignCartItem } from '~~/types/design-cart'
import type { StorefrontFetchError } from '~~/types/storefront'
import { buildCheckoutQuotePayload } from '~/composables/useCheckoutQuote'

definePageMeta({
  layout: 'blank',
})

type AddressSuggestion = {
  value: string
  placeId: string
  mainText: string
  secondaryText: string
}

type ParsedGoogleAddress = {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  stateCode: string
  district: string
  county: string
  postalCode: string
  formattedAddress: string
  googlePlaceId: string
  latitude: number | null
  longitude: number | null
}

let googlePlacesLoaderPromise: Promise<void> | null = null
let googlePlacesServiceInstance: any | null = null

const getGoogleMapsApi = () => {
  if (!import.meta.client) {
    return null
  }

  return (window as Window & { google?: any }).google ?? null
}

const loadGooglePlacesApi = (apiKey: string) => {
  if (!import.meta.client) {
    return Promise.resolve()
  }

  const googleApi = getGoogleMapsApi()

  if (googleApi?.maps?.places) {
    return Promise.resolve()
  }

  if (googlePlacesLoaderPromise) {
    return googlePlacesLoaderPromise
  }

  googlePlacesLoaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-google-places-loader="true"]') as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Google Places API.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`
    script.async = true
    script.defer = true
    script.dataset.googlePlacesLoader = 'true'
    script.onload = () => {
      const loadedGoogleApi = getGoogleMapsApi()

      if (loadedGoogleApi?.maps?.places) {
        resolve()
        return
      }

      reject(new Error('Google Places API loaded without places library.'))
    }
    script.onerror = () => reject(new Error('Unable to load Google Places API.'))
    document.head.appendChild(script)
  })

  return googlePlacesLoaderPromise
}

const getGooglePlacesService = () => {
  const googleApi = getGoogleMapsApi()

  if (!googleApi?.maps?.places) {
    return null
  }

  if (!googlePlacesServiceInstance) {
    googlePlacesServiceInstance = new googleApi.maps.places.PlacesService(document.createElement('div'))
  }

  return googlePlacesServiceInstance
}

const getAddressComponent = (components: Array<{ long_name?: string, short_name?: string, types?: string[] }>, type: string) => {
  const component = components.find(item => Array.isArray(item.types) && item.types.includes(type))

  if (!component) {
    return {
      longName: '',
      shortName: '',
    }
  }

  return {
    longName: component.long_name ?? '',
    shortName: component.short_name ?? '',
  }
}

const parseGooglePlace = (place: any): ParsedGoogleAddress => {
  const components = Array.isArray(place?.address_components) ? place.address_components : []
  const streetNumber = getAddressComponent(components, 'street_number').longName
  const routeName = getAddressComponent(components, 'route').longName
  const subpremise = getAddressComponent(components, 'subpremise').longName
  const locality = getAddressComponent(components, 'locality').longName
  const postalTown = getAddressComponent(components, 'postal_town').longName
  const adminAreaLevel2 = getAddressComponent(components, 'administrative_area_level_2').longName
  const neighborhood = getAddressComponent(components, 'neighborhood').longName
  const sublocality = getAddressComponent(components, 'sublocality').longName
  const sublocalityLevel1 = getAddressComponent(components, 'sublocality_level_1').longName
  const state = getAddressComponent(components, 'administrative_area_level_1')
  const postalCode = getAddressComponent(components, 'postal_code').longName
  const postalCodeSuffix = getAddressComponent(components, 'postal_code_suffix').longName
  const geometryLocation = place?.geometry?.location
  const latitude = typeof geometryLocation?.lat === 'function' ? geometryLocation.lat() : null
  const longitude = typeof geometryLocation?.lng === 'function' ? geometryLocation.lng() : null

  return {
    addressLine1: [streetNumber, routeName].filter(Boolean).join(' ').trim() || (place?.name ?? ''),
    addressLine2: subpremise,
    city: locality || postalTown,
    state: state.longName,
    stateCode: state.shortName,
    district: neighborhood || sublocalityLevel1 || sublocality,
    county: adminAreaLevel2,
    postalCode: [postalCode, postalCodeSuffix].filter(Boolean).join('-'),
    formattedAddress: typeof place?.formatted_address === 'string' ? place.formatted_address : '',
    googlePlaceId: typeof place?.place_id === 'string' ? place.place_id : '',
    latitude,
    longitude,
  }
}

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const {
  listAddresses,
  createAddress,
  updateAddress,
} = useAccountAddresses()
const { requestShippingQuote, selectShippingRate } = useCheckoutQuote()
const { createOrder, createPaymentIntent } = useStripeCheckout()
const {
  cartItems,
  cartReady,
  syncCart,
} = useDesignCart()
const {
  account,
  authReady,
  syncProfile,
  hydrateAuth,
  isAuthenticated,
} = useStorefrontAuth()

useSeoMeta({
  title: t('checkout.seo.title'),
  description: t('checkout.seo.description'),
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

const parseMoneyValue = (value?: string | number | null) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const numericValue = Number.parseFloat(String(value ?? '').replace(/[^0-9.-]+/g, ''))
  return Number.isFinite(numericValue) ? numericValue : 0
}

const formatMoneyValue = (value?: string | number | null) => {
  return formatCurrency(parseMoneyValue(value))
}

const splitFullName = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean)

  if (!parts.length) {
    return {
      firstName: '',
      lastName: '',
    }
  }

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  }
}

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '')

  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1)
  }

  return digits
}

const accountName = computed(() => {
  const explicitFirstName = typeof account.value?.firstName === 'string' ? account.value.firstName.trim() : ''
  const explicitLastName = typeof account.value?.lastName === 'string' ? account.value.lastName.trim() : ''

  if (explicitFirstName || explicitLastName) {
    return {
      firstName: explicitFirstName,
      lastName: explicitLastName,
    }
  }

  const fallbackName = typeof account.value?.full_name === 'string' && account.value.full_name.trim()
    ? account.value.full_name.trim()
    : typeof account.value?.name === 'string' && account.value.name.trim()
      ? account.value.name.trim()
      : ''

  return splitFullName(fallbackName)
})

const accountEmail = computed(() => typeof account.value?.email === 'string' ? account.value.email : '')
const accountPhoneNumber = computed(() => {
  const phone = typeof account.value?.phone === 'string' ? account.value.phone : ''
  return normalizePhoneNumber(phone)
})
const googleMapsApiKey = computed(() => runtimeConfig.public.googleMapsApiKey)

const checkoutForm = reactive({
  countryCode: 'US',
  firstName: '',
  lastName: '',
  phoneCountryCode: '+1',
  phoneNumber: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  state: '',
  stateCode: '',
  city: '',
  district: '',
  county: '',
  postalCode: '',
  formattedAddress: '',
  googlePlaceId: '',
  latitude: null as number | null,
  longitude: null as number | null,
  isDefault: true,
  saveAddress: true,
})

const addressSaveAttempted = ref(false)
const addressSaveMessage = ref('')
const addressSaveError = ref('')
const addressSaving = ref(false)
const addressHydrating = ref(false)
const activeShippingAddressId = ref<string | number | null>(null)
const isAddressEditing = ref(true)
const addressSearch = ref('')
const addressLookupReady = ref(false)
const addressLookupLoading = ref(false)
const addressLookupError = ref('')
const activeAutocompleteSessionToken = ref<any | null>(null)
const shippingQuoteLoading = ref(false)
const shippingQuoteError = ref('')
const couponCode = ref('')
const paymentPreparing = ref(false)
const paymentSubmitting = ref(false)
const paymentError = ref('')
const paymentFormReady = ref(false)
const paymentPreparedKey = ref('')
const checkoutOrder = ref<CheckoutOrder | null>(null)
const checkoutPaymentIntent = ref<CheckoutPaymentIntent | null>(null)
const stripePaymentFormRef = ref<InstanceType<typeof StripePaymentForm> | null>(null)
const shippingState = reactive<{
  address: CheckoutQuoteAddressPayload | null
  shippingQuoteId: string | null
  normalizedAddress: CheckoutShippingNormalizedAddress | null
  rates: CheckoutShippingRate[]
  selectedRateId: string | null
  selectedRate: CheckoutSelectedRate | null
  totals: CheckoutTotals | null
  expiresAt: string | null
}>({
  address: null,
  shippingQuoteId: null,
  normalizedAddress: null,
  rates: [],
  selectedRateId: null,
  selectedRate: null,
  totals: null,
  expiresAt: null,
})

const selectedCheckoutItemIds = computed(() => {
  const raw = Array.isArray(route.query.items) ? route.query.items[0] : route.query.items

  if (typeof raw !== 'string' || !raw.trim()) {
    return []
  }

  return raw.split(',').map(item => item.trim()).filter(Boolean)
})

const checkoutItems = computed<DesignCartItem[]>(() => {
  const baseItems = selectedCheckoutItemIds.value.length
    ? cartItems.value.filter(item => selectedCheckoutItemIds.value.includes(item.id))
    : cartItems.value

  return baseItems.filter(item => item.quantity > 0)
})

const baseMerchandiseTotals = computed(() => {
  const productCost = checkoutItems.value.reduce((total, item) => total + item.summary.productPrice * item.quantity, 0)
  const customizationCost = checkoutItems.value.reduce((total, item) => total + item.summary.customizationPrice * item.quantity, 0)
  const subtotal = checkoutItems.value.reduce((total, item) => total + item.summary.totalPrice * item.quantity, 0)

  return {
    itemsCount: checkoutItems.value.length,
    unitsCount: checkoutItems.value.reduce((total, item) => total + item.quantity, 0),
    productCost,
    customizationCost,
    subtotal,
    productionCostLabel: formatCurrency(productCost + customizationCost),
  }
})

const hasResolvedAddress = computed(() => Boolean(checkoutForm.googlePlaceId.trim()))
const showAddressEditor = computed(() => isAddressEditing.value || !hasResolvedAddress.value)
const addressHeadline = computed(() => {
  const name = [checkoutForm.firstName, checkoutForm.lastName].filter(Boolean).join(' ').trim()
  const phone = checkoutForm.phoneNumber.trim()
  return [name, phone].filter(Boolean).join(', ')
})
const addressMultiline = computed(() => {
  const formatted = checkoutForm.formattedAddress.trim()

  if (formatted) {
    return formatted
  }

  return [
    checkoutForm.addressLine1,
    checkoutForm.city,
    checkoutForm.state,
    checkoutForm.postalCode,
  ].filter(Boolean).join(', ')
})
const selectedShippingRate = computed(() => {
  if (shippingState.selectedRateId) {
    return shippingState.rates.find(rate => rate.id === shippingState.selectedRateId)
      ?? (shippingState.selectedRate && shippingState.selectedRate.id === shippingState.selectedRateId
        ? {
            ...shippingState.selectedRate,
            estimated_days: null,
          }
        : null)
  }

  return null
})
const isShippingQuoteExpired = computed(() => {
  return shippingState.expiresAt
    ? dayjs(shippingState.expiresAt).isBefore(dayjs())
    : false
})
const shippingQuoteExpiresLabel = computed(() => {
  return shippingState.expiresAt
    ? dayjs(shippingState.expiresAt).format('MMM D, h:mm A')
    : ''
})
const canProceedToPayment = computed(() => {
  return Boolean(
    shippingState.shippingQuoteId
    && shippingState.selectedRateId
    && shippingState.totals
    && !isShippingQuoteExpired.value,
  )
})
const activePaymentKey = computed(() => {
  if (!canProceedToPayment.value) {
    return ''
  }

  return [
    shippingState.shippingQuoteId,
    shippingState.selectedRateId,
    shippingState.totals?.grand_total,
    shippingState.totals?.coupon_code,
  ].filter(Boolean).join(':')
})
const paymentAmountLabel = computed(() => {
  return checkoutPaymentIntent.value?.amount_total
    ? formatMoneyValue(checkoutPaymentIntent.value.amount_total)
    : orderSummary.value.total_label
})
const canSubmitPayment = computed(() => {
  return Boolean(
    checkoutPaymentIntent.value?.client_secret
    && paymentFormReady.value
    && !paymentPreparing.value
    && !paymentSubmitting.value,
  )
})
const paymentButtonLabel = computed(() => {
  if (paymentSubmitting.value) {
    return t('checkout.payment.processing')
  }

  if (paymentPreparing.value) {
    return t('checkout.payment.preparing')
  }

  if (!canProceedToPayment.value) {
    return t('checkout.payment.payNow')
  }

  return t('checkout.payment.payNow')
})
const orderSummary = computed(() => {
  if (shippingState.totals) {
    return {
      items_count: baseMerchandiseTotals.value.itemsCount,
      units_count: baseMerchandiseTotals.value.unitsCount,
      production_cost_label: formatMoneyValue(shippingState.totals.subtotal),
      shipping_label: formatMoneyValue(shippingState.totals.shipping),
      tax_label: formatCurrency(0),
      discount_label: formatMoneyValue(shippingState.totals.discount),
      total_label: formatMoneyValue(shippingState.totals.grand_total),
    }
  }

  return {
    items_count: baseMerchandiseTotals.value.itemsCount,
    units_count: baseMerchandiseTotals.value.unitsCount,
    total_label: formatCurrency(baseMerchandiseTotals.value.subtotal),
    production_cost_label: baseMerchandiseTotals.value.productionCostLabel,
    shipping_label: formatCurrency(0),
    tax_label: formatCurrency(0),
    discount_label: formatCurrency(0),
  }
})

const getStorefrontErrorMessage = (error: unknown, fallback: string) => {
  const storefrontError = error as StorefrontFetchError
  return storefrontError?.data?.message ?? fallback
}

const clearShippingState = () => {
  shippingState.address = null
  shippingState.shippingQuoteId = null
  shippingState.normalizedAddress = null
  shippingState.rates = []
  shippingState.selectedRateId = null
  shippingState.selectedRate = null
  shippingState.totals = null
  shippingState.expiresAt = null
}

const resetPaymentState = () => {
  paymentError.value = ''
  paymentSubmitting.value = false
  paymentFormReady.value = false
  paymentPreparedKey.value = ''
  checkoutOrder.value = null
  checkoutPaymentIntent.value = null
}

const getCheckoutItemQuantity = (item: DesignCartItem) => {
  return item.sizes.reduce((total, size) => total + Math.max(0, Number(size.quantity ?? 0)), 0)
}

const normalizeCheckoutPhone = () => {
  const digits = checkoutForm.phoneNumber.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  return digits.startsWith('1') ? `+${digits}` : `+1${digits}`
}

const prepareStripePayment = async () => {
  const nextPaymentKey = activePaymentKey.value

  if (!nextPaymentKey || paymentPreparing.value) {
    return
  }

  if (paymentPreparedKey.value === nextPaymentKey && checkoutPaymentIntent.value?.client_secret) {
    return
  }

  if (!shippingState.shippingQuoteId) {
    return
  }

  paymentPreparing.value = true
  paymentError.value = ''
  paymentFormReady.value = false
  checkoutOrder.value = null
  checkoutPaymentIntent.value = null

  try {
    const orderResponse = await createOrder({
      shipping_quote_id: shippingState.shippingQuoteId,
      payment_method: 'stripe',
      full_name: [checkoutForm.firstName.trim(), checkoutForm.lastName.trim()].filter(Boolean).join(' ').trim(),
      email: checkoutForm.email.trim(),
      phone: normalizeCheckoutPhone(),
    })

    checkoutOrder.value = orderResponse.data

    const paymentIntentResponse = await createPaymentIntent({
      order_id: orderResponse.data.id,
    })

    checkoutPaymentIntent.value = paymentIntentResponse.data
    paymentPreparedKey.value = nextPaymentKey
  } catch (error) {
    paymentError.value = getStorefrontErrorMessage(error, t('checkout.errors.preparePayment'))
    paymentPreparedKey.value = ''
  } finally {
    paymentPreparing.value = false
  }
}

const handlePaymentFormReady = (ready: boolean) => {
  paymentFormReady.value = ready
}

const handlePaymentFormError = (message: string) => {
  paymentError.value = message
}

const handlePaymentSubmitting = (submitting: boolean) => {
  paymentSubmitting.value = submitting
}

const handlePaymentConfirmed = async () => {
  const orderNumber = checkoutPaymentIntent.value?.order_number ?? checkoutOrder.value?.number

  if (!orderNumber) {
    paymentError.value = t('checkout.errors.missingOrderNumberAfterPayment')
    return
  }

  await navigateTo(`/checkout/result?order=${encodeURIComponent(orderNumber)}`)
}

const submitPayment = async () => {
  if (!checkoutPaymentIntent.value?.client_secret) {
    await prepareStripePayment()
  }

  await nextTick()
  await stripePaymentFormRef.value?.submit()
}

watch(accountEmail, (value) => {
  if (!checkoutForm.email && value) {
    checkoutForm.email = value
  }
}, { immediate: true })

watch(() => accountName.value.firstName, (value) => {
  if (!checkoutForm.firstName && value) {
    checkoutForm.firstName = value
  }
}, { immediate: true })

watch(() => accountName.value.lastName, (value) => {
  if (!checkoutForm.lastName && value) {
    checkoutForm.lastName = value
  }
}, { immediate: true })

watch(accountPhoneNumber, (value) => {
  if (!checkoutForm.phoneNumber && value) {
    checkoutForm.phoneNumber = value
  }
}, { immediate: true })

const fieldErrors = computed(() => {
  const errors: Record<string, string> = {}

  if (!addressSaveAttempted.value) {
    return errors
  }

  if (!checkoutForm.firstName.trim()) {
    errors.firstName = t('checkout.validation.firstName')
  }

  if (!checkoutForm.lastName.trim()) {
    errors.lastName = t('checkout.validation.lastName')
  }

  if (!checkoutForm.phoneNumber.trim()) {
    errors.phoneNumber = t('checkout.validation.phone')
  }

  if (!checkoutForm.email.trim()) {
    errors.email = t('checkout.validation.email')
  }

  if (!checkoutForm.addressLine1.trim()) {
    errors.addressLine1 = t('checkout.validation.streetAddress')
  }

  if (!checkoutForm.googlePlaceId.trim()) {
    errors.addressLookup = t('checkout.validation.addressLookup')
  }

  if (!checkoutForm.city.trim()) {
    errors.city = t('checkout.validation.city')
  }

  if (!checkoutForm.postalCode.trim()) {
    errors.postalCode = t('checkout.validation.postalCode')
  }

  return errors
})

const isAddressValid = computed(() => {
  return Object.keys(fieldErrors.value).length === 0
})

const applyAccountAddress = (address: AccountAddress) => {
  activeShippingAddressId.value = address.id
  checkoutForm.countryCode = address.country_code || 'US'
  checkoutForm.firstName = address.first_name || checkoutForm.firstName
  checkoutForm.lastName = address.last_name || checkoutForm.lastName
  checkoutForm.phoneCountryCode = address.phone_country_code || '+1'
  checkoutForm.phoneNumber = address.phone_number || checkoutForm.phoneNumber
  checkoutForm.email = address.email || checkoutForm.email
  checkoutForm.addressLine1 = address.address_line_1 || ''
  checkoutForm.addressLine2 = address.address_line_2 || ''
  checkoutForm.city = address.city || ''
  checkoutForm.state = address.state || ''
  checkoutForm.stateCode = address.state_code || ''
  checkoutForm.district = address.district || ''
  checkoutForm.county = address.county || ''
  checkoutForm.postalCode = address.postal_code || ''
  checkoutForm.formattedAddress = address.formatted_address || ''
  checkoutForm.googlePlaceId = address.google_place_id || ''
  checkoutForm.latitude = address.latitude
  checkoutForm.longitude = address.longitude
  checkoutForm.isDefault = Boolean(address.is_default)
  addressSearch.value = address.formatted_address || [address.address_line_1, address.city, address.state, address.postal_code].filter(Boolean).join(', ')
}

const buildQuoteAddressPayload = () => {
  const fullName = [checkoutForm.firstName.trim(), checkoutForm.lastName.trim()].filter(Boolean).join(' ').trim()

  return {
    country_code: 'US',
    state: checkoutForm.state.trim(),
    state_code: checkoutForm.stateCode.trim(),
    city: checkoutForm.city.trim(),
    district: checkoutForm.district.trim(),
    county: checkoutForm.county.trim(),
    postal_code: checkoutForm.postalCode.trim(),
    address_line_1: checkoutForm.addressLine1.trim(),
    address_line_2: checkoutForm.addressLine2.trim(),
    formatted_address: checkoutForm.formattedAddress.trim(),
    google_place_id: checkoutForm.googlePlaceId.trim(),
    latitude: checkoutForm.latitude,
    longitude: checkoutForm.longitude,
    full_name: fullName,
    email: checkoutForm.email.trim(),
    phone: checkoutForm.phoneNumber.trim(),
  }
}

const syncNormalizedAddress = (normalized: CheckoutShippingNormalizedAddress | null) => {
  if (!normalized) {
    return
  }

  checkoutForm.countryCode = normalized.country_code || 'US'
  checkoutForm.stateCode = normalized.state_code || checkoutForm.stateCode
  checkoutForm.city = normalized.city || checkoutForm.city
  checkoutForm.postalCode = normalized.postal_code || checkoutForm.postalCode
  checkoutForm.addressLine1 = normalized.address_line_1 || checkoutForm.addressLine1
  checkoutForm.addressLine2 = normalized.address_line_2 || checkoutForm.addressLine2
}

const applySelectedShippingRate = async (rateId: string) => {
  if (!rateId) {
    return
  }

  if (!shippingState.shippingQuoteId || isShippingQuoteExpired.value) {
    await requestAndApplyShippingQuote(rateId)
    return
  }

  shippingQuoteLoading.value = true
  shippingQuoteError.value = ''

  try {
    const response = await selectShippingRate(shippingState.shippingQuoteId, {
      shipping_rate_id: rateId,
    })

    shippingState.selectedRateId = response.data.selected_rate.id
    shippingState.selectedRate = response.data.selected_rate
    shippingState.totals = response.data.totals
  } catch (error) {
    shippingState.selectedRateId = null
    shippingState.selectedRate = null
    shippingState.totals = null
    shippingQuoteError.value = getStorefrontErrorMessage(error, t('checkout.errors.applyShippingRate'))
  } finally {
    shippingQuoteLoading.value = false
  }
}

const requestAndApplyShippingQuote = async (preferredRateId: string | null = shippingState.selectedRateId) => {
  if (!hasResolvedAddress.value || !checkoutItems.value.length) {
    clearShippingState()
    return
  }

  shippingQuoteLoading.value = true
  shippingQuoteError.value = ''

  try {
    const quoteItems = checkoutItems.value.map(item => ({
      ...item,
      quantity: getCheckoutItemQuantity(item),
    }))

    const response = await requestShippingQuote(buildCheckoutQuotePayload({
      items: quoteItems,
      address: buildQuoteAddressPayload(),
      couponCode: couponCode.value.trim() || null,
    }))

    if (!response.data.address.is_valid) {
      clearShippingState()
      shippingQuoteError.value = response.data.address.messages.join(' ').trim() || t('checkout.errors.invalidAddress')
      return
    }

    shippingState.address = buildQuoteAddressPayload()
    shippingState.shippingQuoteId = response.data.shipping_quote_id
    shippingState.normalizedAddress = response.data.address.normalized
    shippingState.rates = Array.isArray(response.data.rates) ? response.data.rates : []
    shippingState.expiresAt = response.data.expires_at
    shippingState.selectedRateId = null
    shippingState.selectedRate = null
    shippingState.totals = null
    syncNormalizedAddress(response.data.address.normalized)

    const resolvedRateId = shippingState.rates.find(rate => rate.id === preferredRateId)?.id
      ?? shippingState.rates[0]?.id
      ?? null

    if (resolvedRateId) {
      await applySelectedShippingRate(resolvedRateId)
    }
  } catch (error) {
    clearShippingState()
    shippingQuoteError.value = getStorefrontErrorMessage(error, t('checkout.errors.loadShippingRates'))
  } finally {
    shippingQuoteLoading.value = false
  }
}

const buildAddressPayload = (): AccountAddressPayload => {
  return {
    first_name: checkoutForm.firstName.trim(),
    last_name: checkoutForm.lastName.trim(),
    email: checkoutForm.email.trim(),
    phone_country_code: checkoutForm.phoneCountryCode,
    phone_number: checkoutForm.phoneNumber.trim(),
    country_code: 'US',
    address_line_1: checkoutForm.addressLine1.trim(),
    address_line_2: checkoutForm.addressLine2.trim(),
    city: checkoutForm.city.trim(),
    state: checkoutForm.state.trim(),
    state_code: checkoutForm.stateCode.trim(),
    district: checkoutForm.district.trim(),
    county: checkoutForm.county.trim(),
    postal_code: checkoutForm.postalCode.trim(),
    formatted_address: checkoutForm.formattedAddress.trim(),
    google_place_id: checkoutForm.googlePlaceId.trim(),
    latitude: checkoutForm.latitude,
    longitude: checkoutForm.longitude,
    is_default: checkoutForm.isDefault,
    save_to_address_book: checkoutForm.saveAddress,
    type: 'shipping',
  }
}

const hydrateSavedShippingAddress = async () => {
  addressHydrating.value = true
  addressSaveError.value = ''

  try {
    const response = await listAddresses({ type: 'shipping' })
    const addresses = Array.isArray(response.data) ? response.data : []
    const address = addresses.find(entry => entry.is_default) ?? addresses[0] ?? null

    if (address) {
      applyAccountAddress(address)
      isAddressEditing.value = false
      await requestAndApplyShippingQuote()
    }
  } catch (error) {
    addressSaveError.value = getStorefrontErrorMessage(error, t('checkout.errors.loadSavedAddresses'))
  } finally {
    addressHydrating.value = false
  }
}

const handleAddressSave = async () => {
  addressSaveAttempted.value = true
  addressSaveMessage.value = ''
  addressSaveError.value = ''

  if (!isAddressValid.value) {
    return
  }

  addressSaving.value = true

  try {
    const payload = buildAddressPayload()
    const response = activeShippingAddressId.value != null
      ? await updateAddress(activeShippingAddressId.value, payload)
      : await createAddress(payload)

    applyAccountAddress(response.data)
    addressSaveMessage.value = response.message
    isAddressEditing.value = false
    await requestAndApplyShippingQuote()
  } catch (error) {
    addressSaveError.value = getStorefrontErrorMessage(error, t('checkout.errors.saveAddress'))
  } finally {
    addressSaving.value = false
  }
}

const resetResolvedAddress = () => {
  checkoutForm.addressLine1 = ''
  checkoutForm.addressLine2 = ''
  checkoutForm.state = ''
  checkoutForm.stateCode = ''
  checkoutForm.city = ''
  checkoutForm.district = ''
  checkoutForm.county = ''
  checkoutForm.postalCode = ''
  checkoutForm.formattedAddress = ''
  checkoutForm.googlePlaceId = ''
  checkoutForm.latitude = null
  checkoutForm.longitude = null
  clearShippingState()
  shippingQuoteError.value = ''
}

const ensureAddressLookupReady = async () => {
  if (addressLookupReady.value || addressLookupLoading.value) {
    return addressLookupReady.value
  }

  if (!googleMapsApiKey.value) {
    addressLookupError.value = t('checkout.errors.googleMapsKeyMissing')
    return false
  }

  addressLookupLoading.value = true
  addressLookupError.value = ''

  try {
    await loadGooglePlacesApi(googleMapsApiKey.value)
    addressLookupReady.value = true
    return true
  } catch (error) {
    addressLookupError.value = error instanceof Error ? error.message : t('checkout.errors.loadAddressLookup')
    return false
  } finally {
    addressLookupLoading.value = false
  }
}

const fetchAddressSuggestions = async (queryString: string, callback: (results: AddressSuggestion[]) => void) => {
  const query = queryString.trim()

  if (!query) {
    callback([])
    return
  }

  const isReady = await ensureAddressLookupReady()

  if (!isReady) {
    callback([])
    return
  }

  const googleApi = getGoogleMapsApi()

  if (!googleApi?.maps?.places?.AutocompleteService) {
    callback([])
    return
  }

  const autocompleteService = new googleApi.maps.places.AutocompleteService()

  if (!activeAutocompleteSessionToken.value) {
    activeAutocompleteSessionToken.value = new googleApi.maps.places.AutocompleteSessionToken()
  }

  autocompleteService.getPlacePredictions({
    input: query,
    componentRestrictions: { country: 'us' },
    types: ['address'],
    sessionToken: activeAutocompleteSessionToken.value,
  }, (predictions: any[] | null, status: string) => {
    if (status !== 'OK' || !Array.isArray(predictions)) {
      callback([])
      return
    }

    callback(predictions.map((prediction) => {
      const mainText = prediction?.structured_formatting?.main_text ?? prediction.description ?? ''
      const secondaryText = prediction?.structured_formatting?.secondary_text ?? ''

      return {
        value: prediction.description ?? '',
        placeId: prediction.place_id ?? '',
        mainText,
        secondaryText,
      }
    }))
  })
}

const handleAddressSelect = async (suggestion: AddressSuggestion) => {
  if (!suggestion.placeId) {
    return
  }

  const isReady = await ensureAddressLookupReady()

  if (!isReady) {
    return
  }

  const placesService = getGooglePlacesService()

  if (!placesService) {
    return
  }

  addressLookupLoading.value = true
  addressLookupError.value = ''

  await new Promise<void>((resolve) => {
    placesService.getDetails({
      placeId: suggestion.placeId,
      fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id'],
      sessionToken: activeAutocompleteSessionToken.value,
    }, (place: any, status: string) => {
      if (status !== 'OK' || !place) {
        addressLookupError.value = t('checkout.errors.loadAddressDetails')
        resolve()
        return
      }

      const parsed = parseGooglePlace(place)
      checkoutForm.addressLine1 = parsed.addressLine1
      checkoutForm.addressLine2 = parsed.addressLine2
      checkoutForm.state = parsed.state
      checkoutForm.stateCode = parsed.stateCode
      checkoutForm.city = parsed.city
      checkoutForm.district = parsed.district
      checkoutForm.county = parsed.county
      checkoutForm.postalCode = parsed.postalCode
      checkoutForm.formattedAddress = parsed.formattedAddress
      checkoutForm.googlePlaceId = parsed.googlePlaceId
      checkoutForm.latitude = parsed.latitude
      checkoutForm.longitude = parsed.longitude
      addressSearch.value = parsed.formattedAddress || suggestion.value
      activeAutocompleteSessionToken.value = null
      resolve()
    })
  })

  addressLookupLoading.value = false
}

watch(addressSearch, (value) => {
  if (!value.trim()) {
    resetResolvedAddress()
  }
})

watch(
  () => checkoutItems.value.map(item => ({
    id: item.id,
    quantity: item.quantity,
    sizes: item.sizes.map(size => ({
      id: size.id,
      quantity: size.quantity,
    })),
  })),
  async (nextItems, previousItems) => {
    if (!previousItems) {
      return
    }

    if (!nextItems.length) {
      clearShippingState()
      shippingQuoteError.value = ''
      return
    }

    if (!showAddressEditor.value && hasResolvedAddress.value) {
      await requestAndApplyShippingQuote()
    }
  },
  { deep: true },
)

watch(isShippingQuoteExpired, (expired) => {
  if (expired && shippingState.shippingQuoteId) {
    shippingQuoteError.value = t('checkout.errors.shippingQuoteExpired')
  }
})

watch(activePaymentKey, async (nextPaymentKey) => {
  if (!nextPaymentKey) {
    resetPaymentState()
    return
  }

  resetPaymentState()
  await prepareStripePayment()
})

const startAddressEdit = () => {
  isAddressEditing.value = true
  addressSaveMessage.value = ''
  addressSaveError.value = ''
  clearShippingState()
  shippingQuoteError.value = ''
}

const selectShippingOption = async (optionId: string) => {
  if (!optionId) {
    return
  }

  if (optionId === shippingState.selectedRateId && !isShippingQuoteExpired.value) {
    return
  }

  await applySelectedShippingRate(optionId)
}

const applyCouponCode = async () => {
  if (showAddressEditor.value || !hasResolvedAddress.value || !checkoutItems.value.length) {
    return
  }

  await requestAndApplyShippingQuote(shippingState.selectedRateId)
}

const checkoutSteps = computed(() => [
  { label: t('checkout.steps.address'), active: true },
  { label: t('checkout.steps.shipping'), active: !showAddressEditor.value },
  { label: t('checkout.steps.payment'), active: canProceedToPayment.value },
  { label: t('checkout.steps.products'), active: false },
])

const loginRedirectHref = computed(() => {
  const selectedIds = checkoutItems.value.map(item => item.id)
  const checkoutPath = selectedIds.length
    ? `/order/checkout?items=${encodeURIComponent(selectedIds.join(','))}`
    : '/order/checkout'

  return `/login?redirect=${encodeURIComponent(checkoutPath)}`
})

onMounted(async () => {
  hydrateAuth()
  await syncCart().catch(() => undefined)

  if (!isAuthenticated.value) {
    await navigateTo(loginRedirectHref.value)
    return
  }

  await syncProfile().catch(() => null)

  if (!isAuthenticated.value) {
    await navigateTo(loginRedirectHref.value)
    return
  }

  checkoutForm.countryCode = 'US'
  checkoutForm.phoneCountryCode = '+1'
  await ensureAddressLookupReady().catch(() => false)
  await hydrateSavedShippingAddress().catch(() => undefined)
})
</script>

<template>
  <main class="min-h-screen bg-[#f7f7f7] text-primary">
    <div class="px-5 pb-12 pt-8 lg:px-8">
      <ClientOnly>
        <div v-if="!cartReady || !authReady">
          <CartPageSkeleton :rows="2" />
        </div>

        <div
          v-else-if="!checkoutItems.length"
          class="mx-auto flex min-h-[calc(100vh-180px)] max-w-[1240px] flex-col items-center justify-center rounded-[24px] bg-white px-6 text-center shadow-[0_20px_60px_rgba(17,19,20,0.04)]"
        >
          <Icon name="ph:shopping-cart-simple-thin" size="72" class="text-primary" />
          <p class="mt-4 text-xl font-medium text-[#8a8f98]">
            {{ t('checkout.empty.title') }}
          </p>
          <NuxtLink
            to="/account/cart"
            class="mt-8 inline-flex min-w-[208px] items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
          >
            {{ t('checkout.empty.backToCart') }}
          </NuxtLink>
        </div>

        <div
          v-else
          class="mx-auto grid max-w-[1240px] gap-8 xl:grid-cols-[minmax(0,1fr)_290px]"
        >
          <section class="min-w-0">
            <h1 class="text-[2.4rem] font-semibold italic leading-none text-primary">
              {{ t('checkout.title') }}
            </h1>

            <div class="mt-5 border-b border-borderSecondary pb-3">
              <div class="grid grid-cols-4 gap-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8a8f98]">
                <div
                  v-for="step in checkoutSteps"
                  :key="step.label"
                  :class="step.active ? 'text-primary' : ''"
                >
                  {{ step.label }}
                </div>
              </div>
            </div>

            <section class="mt-8">
              <div class="border-b border-borderSecondary pb-4">
                <div class="flex items-center justify-between gap-4">
                  <h2 class="text-[2rem] font-semibold leading-none text-primary">
                    {{ t('checkout.address.title') }}
                  </h2>
                  <button
                    v-if="!showAddressEditor"
                    type="button"
                    class="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:opacity-70"
                    @click="startAddressEdit"
                  >
                    <span>{{ t('checkout.address.change') }}</span>
                    <Icon name="ph:caret-right" size="16px" />
                  </button>
                </div>
              </div>

              <div class="mt-6 space-y-5">
                <template v-if="showAddressEditor">
                  <div>
                  <label class="mb-2 block text-sm font-semibold text-primary">{{ t('checkout.address.contactInformation') }}</label>
                  <div class="grid gap-3 md:grid-cols-2">
                    <div>
                      <input
                        v-model="checkoutForm.firstName"
                        type="text"
                        :placeholder="t('checkout.address.placeholders.firstName')"
                        class="h-12 w-full rounded-xl border bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                        :class="fieldErrors.firstName ? 'border-[#f97066]' : 'border-borderSecondary'"
                      >
                      <p
                        v-if="fieldErrors.firstName"
                        class="mt-1 text-xs text-[#f04438]"
                      >
                        {{ fieldErrors.firstName }}
                      </p>
                    </div>
                    <div>
                      <input
                        v-model="checkoutForm.lastName"
                        type="text"
                        :placeholder="t('checkout.address.placeholders.lastName')"
                        class="h-12 w-full rounded-xl border bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                        :class="fieldErrors.lastName ? 'border-[#f97066]' : 'border-borderSecondary'"
                      >
                      <p
                        v-if="fieldErrors.lastName"
                        class="mt-1 text-xs text-[#f04438]"
                      >
                        {{ fieldErrors.lastName }}
                      </p>
                    </div>
                    <div>
                      <input
                        v-model="checkoutForm.phoneNumber"
                        type="text"
                        :placeholder="t('checkout.address.placeholders.phoneNumber')"
                        class="h-12 w-full rounded-xl border bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                        :class="fieldErrors.phoneNumber ? 'border-[#f97066]' : 'border-borderSecondary'"
                      >
                      <p
                        v-if="fieldErrors.phoneNumber"
                        class="mt-1 text-xs text-[#f04438]"
                      >
                        {{ fieldErrors.phoneNumber }}
                      </p>
                    </div>
                    <div>
                      <input
                        v-model="checkoutForm.email"
                        type="email"
                        :placeholder="t('checkout.address.placeholders.email')"
                        class="h-12 w-full rounded-xl border bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                        :class="fieldErrors.email ? 'border-[#f97066]' : 'border-borderSecondary'"
                      >
                      <p
                        v-if="fieldErrors.email"
                        class="mt-1 text-xs text-[#f04438]"
                      >
                        {{ fieldErrors.email }}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="mb-2 block text-sm font-semibold text-primary">{{ t('checkout.address.title') }}</label>
                  <div class="space-y-4">
                    <div>
                      <ElAutocomplete
                        v-model="addressSearch"
                        :fetch-suggestions="fetchAddressSuggestions"
                        :placeholder="t('checkout.address.placeholders.search')"
                        value-key="value"
                        clearable
                        class="block w-full"
                        :debounce="250"
                        :trigger-on-focus="false"
                        :disabled="addressLookupLoading || addressSaving || addressHydrating"
                        @select="handleAddressSelect"
                      >
                        <template #default="{ item }">
                          <div class="flex flex-col py-1">
                            <span class="text-sm font-medium text-primary">{{ item.mainText }}</span>
                            <span class="text-xs text-[#8a8f98]">{{ item.secondaryText }}</span>
                          </div>
                        </template>
                      </ElAutocomplete>
                      <p
                        v-if="fieldErrors.addressLookup"
                        class="mt-1 text-xs text-[#f04438]"
                      >
                        {{ fieldErrors.addressLookup }}
                      </p>
                      <p
                        v-else-if="addressLookupError"
                        class="mt-1 text-xs text-[#f04438]"
                      >
                        {{ addressLookupError }}
                      </p>
                    </div>

                    <div class="grid gap-3 md:grid-cols-2">
                      <div>
                        <input
                          v-model="checkoutForm.addressLine1"
                          type="text"
                          :placeholder="t('checkout.address.placeholders.streetAddress')"
                          class="h-12 w-full rounded-xl border bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                          :class="fieldErrors.addressLine1 ? 'border-[#f97066]' : 'border-borderSecondary'"
                          readonly
                        >
                        <p
                          v-if="fieldErrors.addressLine1"
                          class="mt-1 text-xs text-[#f04438]"
                        >
                          {{ fieldErrors.addressLine1 }}
                        </p>
                      </div>
                      <input
                        v-model="checkoutForm.addressLine2"
                        type="text"
                        :placeholder="t('checkout.address.placeholders.addressLine2')"
                        class="h-12 rounded-xl border border-borderSecondary bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                        readonly
                      >
                    </div>

                    <div class="grid gap-3 md:grid-cols-2">
                      <input
                        v-model="checkoutForm.state"
                        type="text"
                        :placeholder="t('checkout.address.placeholders.state')"
                        class="h-12 rounded-xl border border-borderSecondary bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                        readonly
                      >

                      <div>
                        <input
                          v-model="checkoutForm.city"
                          type="text"
                          :placeholder="t('checkout.address.placeholders.city')"
                          class="h-12 w-full rounded-xl border bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                          :class="fieldErrors.city ? 'border-[#f97066]' : 'border-borderSecondary'"
                          readonly
                        >
                        <p
                          v-if="fieldErrors.city"
                          class="mt-1 text-xs text-[#f04438]"
                        >
                          {{ fieldErrors.city }}
                        </p>
                      </div>
                    </div>

                    <div class="grid gap-3 md:grid-cols-2">
                      <input
                        v-model="checkoutForm.district"
                        type="text"
                        :placeholder="t('checkout.address.placeholders.district')"
                        class="h-12 rounded-xl border border-borderSecondary bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                        readonly
                      >

                      <input
                        v-model="checkoutForm.county"
                        type="text"
                        :placeholder="t('checkout.address.placeholders.county')"
                        class="h-12 rounded-xl border border-borderSecondary bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                        readonly
                      >
                    </div>

                    <div class="grid gap-3 md:grid-cols-2">
                      <div>
                        <input
                          v-model="checkoutForm.postalCode"
                          type="text"
                          :placeholder="t('checkout.address.placeholders.postalCode')"
                          class="h-12 w-full rounded-xl border bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                          :class="fieldErrors.postalCode ? 'border-[#f97066]' : 'border-borderSecondary'"
                          readonly
                        >
                        <p
                          v-if="fieldErrors.postalCode"
                          class="mt-1 text-xs text-[#f04438]"
                        >
                          {{ fieldErrors.postalCode }}
                        </p>
                      </div>

                      <input
                        v-model="checkoutForm.formattedAddress"
                        type="text"
                        :placeholder="t('checkout.address.placeholders.formattedAddress')"
                        class="h-12 rounded-xl border border-borderSecondary bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                        readonly
                      >
                    </div>
                  </div>
                </div>

                <div class="space-y-3">
                  <label class="flex items-center gap-2 text-sm font-medium text-primary">
                    <input
                      v-model="checkoutForm.isDefault"
                      type="checkbox"
                      class="h-4 w-4 rounded border-borderSecondary text-primary focus:ring-primary"
                    >
                    <span>{{ t('checkout.address.default') }}</span>
                  </label>

                  <label class="flex items-center gap-2 text-sm font-medium text-primary">
                    <input
                      v-model="checkoutForm.saveAddress"
                      type="checkbox"
                      class="h-4 w-4 rounded border-borderSecondary text-primary focus:ring-primary"
                    >
                    <span>{{ t('checkout.address.saveAddress') }}</span>
                  </label>
                </div>

                <div class="flex justify-end">
                  <button
                    type="button"
                    class="inline-flex h-12 min-w-[160px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="addressSaving || addressHydrating"
                    @click="handleAddressSave"
                  >
                    {{ addressSaving ? t('checkout.address.saving') : t('checkout.address.save') }}
                  </button>
                </div>

                <p
                  v-if="addressSaveMessage"
                  class="text-sm text-[#686f72]"
                >
                  {{ addressSaveMessage }}
                </p>
                <p
                  v-if="addressSaveError"
                  class="text-sm text-[#f04438]"
                >
                  {{ addressSaveError }}
                </p>
                </template>

                <template v-else>
                  <div class="rounded-[20px] border border-borderSecondary bg-white px-5 py-4">
                    <div class="flex items-start justify-between gap-4">
                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                          <p class="text-sm font-semibold text-primary">
                            {{ addressHeadline }}
                          </p>
                          <span
                            v-if="checkoutForm.isDefault"
                            class="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-white"
                          >
                            {{ t('checkout.address.defaultBadge') }}
                          </span>
                        </div>
                        <p class="mt-2 whitespace-pre-line text-sm text-[#475467]">
                          {{ addressMultiline }}
                        </p>
                      </div>

                      <button
                        type="button"
                        class="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:opacity-70"
                        @click="startAddressEdit"
                      >
                        <Icon name="ph:pencil-simple-line" size="16px" />
                        <span>{{ t('checkout.address.edit') }}</span>
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </section>

            <section class="mt-12 border-t border-borderSecondary pt-6">
              <h2 class="text-[2rem] font-semibold leading-none text-primary">
                {{ t('checkout.shipping.title') }}
              </h2>

              <div
                v-if="showAddressEditor"
                class="mt-6 rounded-[18px] border border-dashed border-borderSecondary bg-white px-5 py-4 text-sm text-[#667085]"
              >
                {{ t('checkout.shipping.saveAddressPrompt') }}
              </div>

              <div
                v-else
                class="mt-6"
              >
                <p class="text-sm font-semibold text-primary">
                  {{ t('checkout.shipping.options') }}
                </p>

                <div
                  v-if="shippingQuoteLoading"
                  class="mt-4 rounded-[18px] border border-borderSecondary bg-white px-5 py-5 text-sm text-[#667085]"
                >
                  {{ t('checkout.shipping.loading') }}
                </div>

                <template v-else>
                  <div class="mt-4 space-y-3">
                    <button
                      v-for="option in shippingState.rates"
                      :key="option.id"
                      type="button"
                      class="w-full rounded-[18px] border bg-white px-5 py-4 text-left transition"
                      :class="shippingState.selectedRateId === option.id ? 'border-primary shadow-[0_12px_30px_rgba(17,19,20,0.06)]' : 'border-borderSecondary hover:border-primary/40'"
                      @click="selectShippingOption(option.id)"
                    >
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex items-start gap-3">
                          <Icon
                            :name="shippingState.selectedRateId === option.id ? 'ph:radio-button-fill' : 'ph:circle'"
                            size="22px"
                            class="mt-0.5 text-primary"
                          />
                          <div>
                            <p class="text-base font-semibold text-primary">
                              {{ option.carrier }} {{ option.service }}
                            </p>
                            <p class="mt-1 text-sm text-[#667085]">
                              <template v-if="option.estimated_days != null">
                                {{ t('checkout.shipping.estimatedDays', { count: option.estimated_days }) }}
                              </template>
                              <template v-else>
                                {{ t('checkout.shipping.rateAvailable') }}
                              </template>
                            </p>
                          </div>
                        </div>

                        <p class="text-xl font-semibold leading-none text-primary">
                          {{ formatMoneyValue(option.amount) }}
                        </p>
                      </div>
                    </button>
                  </div>

                  <div
                    v-if="selectedShippingRate"
                    class="mt-4 rounded-[18px] border border-borderSecondary bg-[#f7f8fa] px-4 py-4"
                  >
                    <div class="grid gap-4 md:grid-cols-4">
                      <div>
                        <p class="text-xs font-medium uppercase tracking-[0.08em] text-[#98a2b3]">
                          {{ t('checkout.shipping.carrier') }}
                        </p>
                        <p class="mt-1 text-lg font-semibold text-primary">
                          {{ selectedShippingRate.carrier }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs font-medium uppercase tracking-[0.08em] text-[#98a2b3]">
                          {{ t('checkout.shipping.service') }}
                        </p>
                        <p class="mt-1 text-lg font-semibold text-primary">
                          {{ selectedShippingRate.service }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs font-medium uppercase tracking-[0.08em] text-[#98a2b3]">
                          {{ t('checkout.shipping.shippingTime') }}
                        </p>
                        <p class="mt-1 text-lg font-semibold text-primary">
                          {{ selectedShippingRate.estimated_days != null ? t('checkout.shipping.days', { count: selectedShippingRate.estimated_days }) : t('checkout.shipping.calculatedAtCarrier') }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs font-medium uppercase tracking-[0.08em] text-[#98a2b3]">
                          {{ t('checkout.shipping.quoteExpires') }}
                        </p>
                        <p class="mt-1 text-lg font-semibold text-primary">
                          {{ shippingQuoteExpiresLabel || t('checkout.shipping.pending') }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p
                    v-if="shippingQuoteError"
                    class="mt-3 text-sm text-[#f04438]"
                  >
                    {{ shippingQuoteError }}
                  </p>

                  <div
                    v-else-if="!shippingState.rates.length"
                    class="mt-3 rounded-[18px] border border-dashed border-borderSecondary bg-white px-5 py-4 text-sm text-[#667085]"
                  >
                    {{ t('checkout.shipping.emptyRates') }}
                  </div>
                </template>
              </div>
            </section>

            <section class="mt-12 border-t border-borderSecondary pt-6">
              <h2 class="text-[2rem] font-semibold leading-none text-primary">
                {{ t('checkout.payment.title') }}
              </h2>

              <div
                v-if="!canProceedToPayment"
                class="mt-6 rounded-[18px] border border-dashed border-borderSecondary bg-white px-5 py-4 text-sm text-[#667085]"
              >
                {{ t('checkout.payment.selectShippingPrompt') }}
              </div>

              <div
                v-else-if="paymentPreparing"
                class="mt-6 rounded-[18px] border border-borderSecondary bg-white px-5 py-5 text-sm text-[#667085]"
              >
                {{ t('checkout.payment.preparingStripe') }}
              </div>

              <div
                v-else
                class="mt-6 space-y-4"
              >
                <StripePaymentForm
                  v-if="checkoutPaymentIntent?.client_secret"
                  ref="stripePaymentFormRef"
                  :client-secret="checkoutPaymentIntent.client_secret"
                  :order-number="checkoutPaymentIntent.order_number"
                  :amount-label="paymentAmountLabel"
                  @ready="handlePaymentFormReady"
                  @submitting="handlePaymentSubmitting"
                  @confirmed="handlePaymentConfirmed"
                  @error="handlePaymentFormError"
                />

                <div
                  v-else
                  class="rounded-[18px] border border-dashed border-borderSecondary bg-white px-5 py-4 text-sm text-[#667085]"
                >
                  {{ t('checkout.payment.waitingIntent') }}
                </div>

                <div
                  v-if="paymentError"
                  class="rounded-[18px] border border-[#fecdca] bg-[#fff5f5] px-5 py-4 text-sm text-[#b42318]"
                >
                  <p>{{ paymentError }}</p>
                  <button
                    type="button"
                    class="mt-3 font-semibold underline decoration-[#b42318]/30 underline-offset-2"
                    @click="prepareStripePayment"
                  >
                    {{ t('checkout.payment.retrySetup') }}
                  </button>
                </div>
              </div>
            </section>
          </section>

          <aside class="xl:sticky xl:top-24 xl:self-start">
            <div class="rounded-[22px] bg-white p-5 shadow-[0_12px_32px_rgba(17,19,20,0.03)]">
              <h2 class="text-xl font-semibold leading-none text-primary">
                {{ t('checkout.summary.title') }}
              </h2>

              <div class="mt-5 flex flex-wrap gap-3">
                <div
                  v-for="item in checkoutItems"
                  :key="item.id"
                  class="relative h-[72px] w-[72px] overflow-hidden rounded-2xl border border-borderSecondary bg-[#f3f3f1]"
                >
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
                    <Icon name="ph:t-shirt-light" size="24px" />
                  </div>
                  <span class="absolute right-1 top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white bg-white px-1 text-[11px] font-semibold text-primary shadow-[0_10px_24px_rgba(17,19,20,0.08)]">
                    {{ item.quantity }}
                  </span>
                </div>
              </div>

              <div class="mt-5 flex gap-2">
                <input
                  v-model="couponCode"
                  type="text"
                  :placeholder="t('checkout.summary.promoCode')"
                  class="h-11 min-w-0 flex-1 rounded-xl border border-borderSecondary bg-white px-4 text-sm text-primary outline-none transition focus:border-primary"
                >
                <button
                  type="button"
                  class="inline-flex h-11 items-center justify-center rounded-xl border border-primary px-5 text-sm font-semibold text-primary transition hover:bg-[#f5f5f3]"
                  :disabled="shippingQuoteLoading || showAddressEditor || !checkoutItems.length"
                  @click="applyCouponCode"
                >
                  {{ t('checkout.summary.apply') }}
                </button>
              </div>

              <div class="mt-5 space-y-3 text-sm text-[#686f72]">
                <div class="flex items-center justify-between gap-4">
                  <span>{{ t('checkout.summary.productionCost') }}</span>
                  <span class="font-medium text-primary">{{ orderSummary.production_cost_label }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span>{{ t('checkout.summary.shipping') }}</span>
                  <span class="font-medium text-primary">{{ orderSummary.shipping_label }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span>{{ t('checkout.summary.tax') }}</span>
                  <span class="font-medium text-primary">{{ orderSummary.tax_label }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span>{{ t('checkout.summary.discount') }}</span>
                  <span class="font-medium text-primary">{{ orderSummary.discount_label }}</span>
                </div>
              </div>

              <div class="mt-6 border-t border-dashed border-borderSecondary pt-5">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-[2rem] font-semibold leading-none text-primary">{{ t('checkout.summary.total') }}</span>
                  <div class="text-right">
                    <p class="text-[2rem] font-semibold leading-none text-primary">
                      {{ orderSummary.total_label }}
                    </p>
                    <p class="mt-1 text-xs text-[#9aa0a8]">
                      {{ t('checkout.summary.units', { count: orderSummary.units_count }) }}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="mt-6 flex h-12 w-full items-center justify-center rounded-2xl text-base font-semibold text-white/90 transition"
                :class="canSubmitPayment ? 'bg-primary hover:opacity-90' : 'cursor-not-allowed bg-[#c8ccd2]'"
                :disabled="!canSubmitPayment"
                @click="submitPayment"
              >
                {{ paymentButtonLabel }}
              </button>

              <p class="mt-4 text-xs leading-5 text-[#b0b4bb]">
                {{ t('checkout.summary.terms') }}
              </p>
            </div>
          </aside>
        </div>

        <template #fallback>
          <CartPageSkeleton :rows="2" />
        </template>
      </ClientOnly>
    </div>
  </main>
</template>
