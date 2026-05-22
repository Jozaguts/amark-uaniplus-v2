import type {
  CheckoutQuoteAddressPayload,
  CheckoutQuotePayload,
  CheckoutRateSelectionResponse,
  CheckoutShippingQuoteResponse,
  CheckoutShippingRateSelectionPayload,
} from '~~/types/checkout'
import type { DesignCartItem } from '~~/types/design-cart'

const normalizePhoneForQuote = (value: string) => {
  const digits = value.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  return digits.startsWith('1')
    ? `+${digits}`
    : `+1${digits}`
}

const toOptionalInteger = (value: unknown) => {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const parsed = Number.parseInt(value, 10)
    return Number.isInteger(parsed) ? parsed : null
  }

  return null
}

export const buildCheckoutQuotePayload = (options: {
  items: DesignCartItem[]
  address: Omit<CheckoutQuoteAddressPayload, 'full_name' | 'email' | 'phone'> & {
    full_name: string
    email: string
    phone: string
  }
  shippingOptionId?: string | null
  couponCode?: string | null
}): CheckoutQuotePayload => {
  return {
    address: {
      ...options.address,
      phone: normalizePhoneForQuote(options.address.phone),
    },
    shipping_option_id: options.shippingOptionId ?? null,
    coupon_code: options.couponCode ?? null,
    items: options.items.map((item) => {
      const sizes = item.sizes.map(size => ({
        id: size.id,
        label: size.label,
        quantity: size.quantity,
      }))

      const productId = toOptionalInteger(item.productId)
      const variantId = toOptionalInteger(item.variantId)

      return {
        cart_item_id: item.id,
        source: item.source,
        design_id: item.designId ?? null,
        product_handle: item.productHandle,
        product_type: item.productType ?? null,
        variant: {
          color: item.colorId
            ? {
                id: item.colorId,
                name: item.colorName ?? null,
              }
            : null,
          sizes,
        },
        customization: {
          technique: item.techniqueId
            ? {
                id: item.techniqueId,
                name: item.techniqueName ?? null,
              }
            : null,
          provider_options: {},
        },
        ...(productId != null ? { product_id: productId } : {}),
        ...(variantId != null ? { variant_id: variantId } : {}),
      }
    }),
  }
}

export const useCheckoutQuote = () => {
  const storefront = useStorefront()

  return {
    requestLegacyCheckoutQuote(payload: CheckoutQuotePayload) {
      return storefront('/checkout/quote', {
        method: 'POST',
        body: payload,
      })
    },
    requestShippingQuote(payload: CheckoutQuotePayload) {
      return storefront<CheckoutShippingQuoteResponse>('/v1/checkout/shipping/quotes', {
        method: 'POST',
        body: payload,
      })
    },
    selectShippingRate(shippingQuoteId: string, payload: CheckoutShippingRateSelectionPayload) {
      return storefront<CheckoutRateSelectionResponse>(`/v1/checkout/shipping/quotes/${shippingQuoteId}/select-rate`, {
        method: 'POST',
        body: payload,
      })
    },
  }
}
