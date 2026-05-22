import type {
  DesignCartCustomizationPayload,
  DesignCartItemMutationSizePayload,
  DesignCartVariantPayload,
} from '~~/types/design-cart'

export type CheckoutQuoteAddressPayload = {
  country_code: 'US'
  state: string
  state_code: string
  city: string
  district: string
  county: string
  postal_code: string
  address_line_1: string
  address_line_2: string
  formatted_address: string
  google_place_id: string
  latitude: number | null
  longitude: number | null
  full_name: string
  email: string
  phone: string
}

export type CheckoutQuoteItemPayload = {
  cart_item_id: string
  source: 'design' | 'blank' | 'product'
  design_id?: string | null
  product_id?: number
  variant_id?: number | null
  product_handle: string
  product_type?: string | null
  variant: DesignCartVariantPayload
  customization: DesignCartCustomizationPayload
}

export type CheckoutQuotePayload = {
  address: CheckoutQuoteAddressPayload
  items: CheckoutQuoteItemPayload[]
  shipping_option_id?: string | null
  coupon_code?: string | null
}

export type CheckoutShippingNormalizedAddress = {
  country_code: string
  state_code: string
  city: string
  postal_code: string
  address_line_1: string
  address_line_2: string
}

export type CheckoutShippingQuoteAddress = {
  is_valid: boolean
  normalized: CheckoutShippingNormalizedAddress
  messages: string[]
}

export type CheckoutShippingRate = {
  id: string
  carrier: string
  service: string
  amount: string
  currency: string
  estimated_days: number | null
}

export type CheckoutShippingQuoteResponse = {
  data: {
    shipping_quote_id: string
    currency: string
    address: CheckoutShippingQuoteAddress
    rates: CheckoutShippingRate[]
    expires_at: string
  }
}

export type CheckoutShippingRateSelectionPayload = {
  shipping_rate_id: string
}

export type CheckoutSelectedRate = {
  id: string
  carrier: string
  service: string
  amount: string
  currency: string
}

export type CheckoutTotals = {
  subtotal: string
  shipping: string
  discount: string
  grand_total: string
  currency: string
  coupon_code: string | null
}

export type CheckoutRateSelectionResponse = {
  data: {
    shipping_quote_id: string
    selected_rate: CheckoutSelectedRate
    totals: CheckoutTotals
  }
}

export type CheckoutOrderStatus =
  | 'awaiting_payment'
  | 'payment_processing'
  | 'paid'
  | 'payment_failed'
  | 'cancelled'

export type CheckoutPaymentStatus =
  | 'requires_payment_method'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'canceled'

export type CheckoutOrderCreatePayload = {
  shipping_quote_id: string
  payment_method: 'stripe'
  full_name?: string
  email?: string
  phone?: string
}

export type CheckoutOrder = {
  id: number
  number: string
  status: CheckoutOrderStatus
  order_status: string
  frontend_order_status?: string | null
  frontend_order_status_label?: string | null
  fulfillment?: CheckoutOrderFulfillment | null
  payment_provider: 'stripe' | string
  payment_status: CheckoutPaymentStatus
  payment_method: 'stripe' | string
  currency: string
  paid_at: string | null
  payment_failure_message: string
  subtotal: number
  shipping_amount: number
  discount_amount: number
  total: number
}

export type CheckoutOrderCreateResponse = {
  message: string
  data: CheckoutOrder
}

export type CheckoutPaymentIntentPayload = {
  order_id?: number
  shipping_quote_id?: string
}

export type CheckoutPaymentIntent = {
  order_id: number
  order_number: string
  status: CheckoutOrderStatus
  payment_status: CheckoutPaymentStatus
  currency: string
  amount_total: string
  stripe_payment_intent_id: string
  client_secret: string
}

export type CheckoutPaymentIntentResponse = {
  data: CheckoutPaymentIntent
}

export type CheckoutPaymentStatusData = {
  order_id: number
  order_number: string
  status: CheckoutOrderStatus
  payment_status: CheckoutPaymentStatus
  payment_provider: 'stripe' | string
  paid_at: string | null
  payment_failure_message: string
}

export type CheckoutPaymentStatusResponse = {
  data: CheckoutPaymentStatusData
}

export type CheckoutOrderListItem = {
  id: number
  number: string
  status: CheckoutOrderStatus | string
  order_status?: string | null
  frontend_order_status?: string | null
  frontend_order_status_label?: string | null
  fulfillment?: CheckoutOrderFulfillment | null
  payment_status: CheckoutPaymentStatus | string
  payment_provider?: string | null
  currency: string
  total: number | string
  created_at: string
  updated_at?: string | null
  customer_name?: string | null
  product_name?: string | null
  product_sku?: string | null
  preview_image?: string | null
  items_count?: number | null
  units_count?: number | null
}

export type CheckoutOrderListResponse = {
  data: CheckoutOrderListItem[]
  meta?: {
    current_page?: number
    page?: number
    per_page?: number
    total?: number
    last_page?: number
  }
}

export type CheckoutOrderFulfillment = Record<string, unknown> & {
  status?: string | null
  label?: string | null
  frontend_status?: string | null
  frontend_label?: string | null
  timeline?: CheckoutOrderTimelineStep[] | null
}

export type CheckoutOrderTimelineStep = Record<string, unknown> & {
  status?: string | null
  label?: string | null
  frontend_status?: string | null
  frontend_label?: string | null
  frontend_order_status?: string | null
  frontend_order_status_label?: string | null
  completed?: boolean | null
  completed_at?: string | null
  date?: string | null
}

export type CheckoutOrderDetailSize = {
  size_id?: string | null
  label?: string | null
  quantity?: number | null
}

export type CheckoutOrderDetailItem = Record<string, unknown> & {
  id?: string | number | null
  product_name?: string | null
  product_sku?: string | null
  product_handle?: string | null
  preview_image?: string | null
  color?: {
    id?: string | null
    name?: string | null
  } | null
  technique?: {
    id?: string | null
    name?: string | null
  } | null
  placements?: string[] | null
  sizes?: CheckoutOrderDetailSize[] | null
  quantity?: number | null
  quantity_total?: number | null
  total?: string | number | null
  pricing?: {
    product_subtotal?: string | null
    customization_subtotal?: string | null
    total?: string | null
  } | null
}

export type CheckoutOrderAddress = Record<string, unknown> & {
  full_name?: string | null
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  phone_number?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  state?: string | null
  state_code?: string | null
  postal_code?: string | null
  country_code?: string | null
  formatted_address?: string | null
}

export type CheckoutOrderShipment = Record<string, unknown> & {
  status?: string | null
  carrier?: string | null
  service?: string | null
  tracking_number?: string | null
  tracking_url?: string | null
  shipping_amount?: string | number | null
  estimated_days?: number | null
}

export type CheckoutOrderDetail = CheckoutOrder & Record<string, unknown> & {
  items?: CheckoutOrderDetailItem[] | null
  timeline?: CheckoutOrderTimelineStep[] | null
  shipment?: CheckoutOrderShipment | null
  shipments?: CheckoutOrderShipment[] | null
  shipping_address?: CheckoutOrderAddress | null
  billing_address?: CheckoutOrderAddress | null
  customer?: {
    name?: string | null
    email?: string | null
    phone?: string | null
  } | null
  created_at?: string | null
  updated_at?: string | null
}

export type CheckoutOrderDetailResponse = {
  data: CheckoutOrderDetail
}
