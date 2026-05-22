import type { ProductDetail, ProductOption } from '~/types/product-detail'
import type { StorefrontFetchError } from '~~/types/storefront'

type ProductCartPayload = {
  source: 'product'
  product_handle: string
  product_type?: string
  variant: {
    color: {
      id: string
      name?: string | null
    } | null
    sizes: {
      id: string
      label: string
      quantity: number
    }[]
  }
  customization: {
    technique: {
      id: string
      name?: string | null
    } | null
    provider_options: Record<string, unknown>
  }
}

type PendingProductCartAction = {
  payload: ProductCartPayload
  returnTo: string
}

const PENDING_PRODUCT_CART_ACTION_KEY = 'uandiplus-pending-product-cart-action'

function parseProductTypeFromUrl(url?: string | null): string | undefined {
  if (!url)
    return undefined

  try {
    const parsedUrl = new URL(url, 'http://uandiplus.local')
    const type = parsedUrl.searchParams.get('type')

    return type || undefined
  } catch {
    return undefined
  }
}

function resolveProductType(product: ProductDetail): string | undefined {
  return product.product_type
    || product.catalog_type
    || parseProductTypeFromUrl(product.design_url)
    || undefined
}

function selectedOption(options: ProductOption[] = [], preferredValue?: string): ProductOption | null {
  if (!options.length)
    return null

  return options.find(option => option.value === preferredValue && option.is_available !== false)
    ?? options.find(option => option.is_selected && option.is_available !== false)
    ?? options.find(option => option.is_available !== false)
    ?? null
}

function isUnauthorizedError(error: unknown) {
  const storefrontError = error as StorefrontFetchError

  return storefrontError?.data?.statusCode === 401 || storefrontError?.data?.statusCode === 403
}

export function useProductCart() {
  const storefront = useStorefront()
  const { hydrateAuth, isAuthenticated, syncProfile } = useStorefrontAuth()
  const { syncCart } = useDesignCart()

  function buildProductCartPayload(
    product: ProductDetail,
    options: {
      colorValue?: string
      sizeValue?: string
      techniqueId?: string
    } = {},
  ): ProductCartPayload {
    const selectedColor = selectedOption(product.options?.colors, options.colorValue)
    const selectedSize = selectedOption(product.options?.sizes, options.sizeValue)
    const productType = resolveProductType(product)
    const payload: ProductCartPayload = {
      source: 'product',
      product_handle: product.slug,
      ...(productType ? { product_type: productType } : {}),
      variant: {
        color: selectedColor
          ? {
              id: selectedColor.value,
              name: selectedColor.label,
            }
          : null,
        sizes: selectedSize
          ? [{
              id: selectedSize.value,
              label: selectedSize.label,
              quantity: 1,
            }]
          : [],
      },
      customization: {
        technique: null,
        provider_options: {},
      },
    }

    if (options.techniqueId) {
      const technique = product.techniques?.find(t => t.id === options.techniqueId)
      payload.customization.technique = {
        id: options.techniqueId,
        name: technique?.name ?? technique?.label ?? null,
      }
    }

    return payload
  }

  function persistPendingProductCartAction(action: PendingProductCartAction) {
    if (!import.meta.client)
      return

    window.localStorage.setItem(PENDING_PRODUCT_CART_ACTION_KEY, JSON.stringify(action))
  }

  function readPendingProductCartAction(): PendingProductCartAction | null {
    if (!import.meta.client)
      return null

    try {
      const rawAction = window.localStorage.getItem(PENDING_PRODUCT_CART_ACTION_KEY)

      return rawAction ? JSON.parse(rawAction) as PendingProductCartAction : null
    } catch {
      return null
    }
  }

  function clearPendingProductCartAction() {
    if (!import.meta.client)
      return

    window.localStorage.removeItem(PENDING_PRODUCT_CART_ACTION_KEY)
  }

  async function submitProductCartPayload(payload: ProductCartPayload) {
    const response = await storefront('/cart/items', {
      method: 'POST',
      body: payload,
    })

    await syncCart().catch(() => 'guest')

    return response
  }

  async function ensureAuthenticated() {
    hydrateAuth()

    if (isAuthenticated.value)
      return true

    const profile = await syncProfile().catch(() => null)

    return Boolean(profile || isAuthenticated.value)
  }

  async function replayPendingProductCartAction() {
    const action = readPendingProductCartAction()

    if (!action)
      return null

    await submitProductCartPayload(action.payload)
    clearPendingProductCartAction()

    return action
  }

  async function addProductToCart(
    product: ProductDetail,
    options: {
      colorValue?: string
      sizeValue?: string
      techniqueId?: string
      returnTo: string
    },
  ) {
    const payload = buildProductCartPayload(product, options)
    const isLoggedIn = await ensureAuthenticated()

    if (!isLoggedIn) {
      persistPendingProductCartAction({
        payload,
        returnTo: options.returnTo,
      })

      await navigateTo({
        path: '/login',
        query: {
          redirect: options.returnTo,
        },
      })

      return { status: 'redirected' as const }
    }

    try {
      await submitProductCartPayload(payload)
    } catch (error) {
      if (!isUnauthorizedError(error))
        throw error

      persistPendingProductCartAction({
        payload,
        returnTo: options.returnTo,
      })

      await navigateTo({
        path: '/login',
        query: {
          redirect: options.returnTo,
        },
      })

      return { status: 'redirected' as const }
    }

    return { status: 'added' as const }
  }

  async function buyProductNow(
    product: ProductDetail,
    options: {
      colorValue?: string
      sizeValue?: string
      techniqueId?: string
    } = {},
  ) {
    const checkoutPath = '/order/checkout'
    const payload = buildProductCartPayload(product, options)
    const isLoggedIn = await ensureAuthenticated()

    if (!isLoggedIn) {
      persistPendingProductCartAction({ payload, returnTo: checkoutPath })
      await navigateTo({ path: '/login', query: { redirect: checkoutPath } })
      return { status: 'redirected' as const }
    }

    try {
      await submitProductCartPayload(payload)
    } catch (error) {
      if (!isUnauthorizedError(error))
        throw error

      persistPendingProductCartAction({ payload, returnTo: checkoutPath })
      await navigateTo({ path: '/login', query: { redirect: checkoutPath } })
      return { status: 'redirected' as const }
    }

    await navigateTo(checkoutPath)
    return { status: 'checkout' as const }
  }

  return {
    addProductToCart,
    buyProductNow,
    buildProductCartPayload,
    clearPendingProductCartAction,
    persistPendingProductCartAction,
    readPendingProductCartAction,
    replayPendingProductCartAction,
    submitProductCartPayload,
  }
}

export type { ProductCartPayload }
