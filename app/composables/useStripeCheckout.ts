import type {
  CheckoutOrderCreatePayload,
  CheckoutOrderCreateResponse,
  CheckoutOrderDetailResponse,
  CheckoutOrderListResponse,
  CheckoutPaymentIntentPayload,
  CheckoutPaymentIntentResponse,
  CheckoutPaymentStatusResponse,
} from '~~/types/checkout'

export const useStripeCheckout = () => {
  const storefront = useStorefront()

  return {
    createOrder(payload: CheckoutOrderCreatePayload) {
      return storefront<CheckoutOrderCreateResponse>('/orders', {
        method: 'POST',
        body: payload,
      })
    },
    createPaymentIntent(payload: CheckoutPaymentIntentPayload) {
      return storefront<CheckoutPaymentIntentResponse>('/checkout/payment-intent', {
        method: 'POST',
        body: payload,
      })
    },
    getPaymentStatus(orderNumber: string) {
      return storefront<CheckoutPaymentStatusResponse>(`/orders/${orderNumber}/payment-status`)
    },
    getOrder(orderNumber: string) {
      return storefront<CheckoutOrderDetailResponse>(`/orders/${encodeURIComponent(orderNumber)}`)
    },
    listOrders(options: { page?: number } = {}) {
      return storefront<CheckoutOrderListResponse>('/orders', {
        query: {
          ...(options.page ? { page: options.page } : {}),
        },
      })
    },
    cancelOrder(orderNumber: string) {
      return storefront(`/orders/${encodeURIComponent(orderNumber)}/cancel`, {
        method: 'POST',
      })
    },
  }
}
