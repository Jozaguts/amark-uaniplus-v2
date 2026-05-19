import type {
  DesignCartApiItem,
  DesignCartDeleteResponse,
  DesignCartItem,
  DesignCartItemCreatePayload,
  DesignCartItemMutationSizePayload,
  DesignCartItemUpdatePayload,
  DesignCartMergePayload,
  DesignCartSizeAllocation,
  DesignCartResponse,
} from '~~/types/design-cart'
import type { StorefrontFetchError } from '~~/types/storefront'
import {useStorefront} from "~/composables/useStorefront";

const DESIGN_CART_STORAGE_KEY = 'tapstitch-design-cart'
const DESIGN_CART_STORAGE_MODE_KEY = 'tapstitch-design-cart-mode'

type DesignCartMode = 'unknown' | 'guest' | 'auth'

const parseCurrencyValue = (value?: string | null) => {
  const numericValue = Number.parseFloat(String(value ?? '').replace(/[^0-9.-]+/g, ''))
  return Number.isFinite(numericValue) ? numericValue : 0
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

const normalizeCartSizes = (sizes: unknown, fallbackQuantity: number): DesignCartSizeAllocation[] => {
  if (!Array.isArray(sizes) || !sizes.length) {
    return [{
      id: 'default',
      label: 'One Size',
      quantity: Math.max(1, fallbackQuantity || 1),
    }]
  }

  return sizes
    .filter((size): size is DesignCartSizeAllocation => {
      return Boolean(size && typeof size === 'object' && 'id' in size && 'label' in size)
    })
    .map(size => ({
      id: String(size.id),
      label: String(size.label),
      quantity: Math.max(0, Number(size.quantity ?? 0)),
    }))
}

const getCartItemQuantity = (item: Pick<DesignCartItem, 'sizes' | 'quantity'>) => {
  if (Array.isArray(item.sizes) && item.sizes.length) {
    return item.sizes.reduce((total, size) => total + Math.max(0, Number(size.quantity ?? 0)), 0)
  }

  return Math.max(0, Number(item.quantity ?? 0))
}

const createCartIdentityKey = (item: Pick<DesignCartItem, 'source' | 'designId' | 'productHandle' | 'colorId'>) => {
  if (item.source === 'design' && item.designId) {
    return `design:${item.designId}`
  }

  if (item.source === 'product') {
    return `product:${item.productHandle}:${item.colorId}`
  }

  return `blank:${item.productHandle}:${item.colorId}`
}

const normalizeCartItems = (items: unknown): DesignCartItem[] => {
  if (!Array.isArray(items)) {
    return []
  }

  return items.flatMap((item) => {
    if (
      !item
      || typeof item !== 'object'
      || !('id' in item)
      || !('productHandle' in item)
      || !('productName' in item)
      || !('summary' in item)
    ) {
      return []
    }

    const sizes = normalizeCartSizes(
      'sizes' in item ? item.sizes : [],
      Math.max(1, Number('quantity' in item ? item.quantity : 1)),
    )

    return [{
      ...(item as DesignCartItem),
      source: 'source' in item && (item.source === 'design' || item.source === 'blank') ? item.source : 'design',
      sizes,
      quantity: getCartItemQuantity({
        sizes,
        quantity: Number('quantity' in item ? item.quantity : 0),
      }),
    }]
  })
}

const isUnauthorizedError = (error: unknown) => {
  const storefrontError = error as StorefrontFetchError
  return storefrontError?.data?.statusCode === 401 || storefrontError?.data?.statusCode === 403
}

const isNotFoundError = (error: unknown) => {
  const storefrontError = error as StorefrontFetchError
  return storefrontError?.data?.statusCode === 404
}

const mapCartItemToMutationSizes = (item: DesignCartItem): DesignCartItemMutationSizePayload[] => {
  return item.sizes.map(size => ({
    size_id: size.id,
    label: size.label,
    quantity: Math.max(0, Math.round(size.quantity)),
  }))
}

const mapCartItemToCreatePayload = (item: DesignCartItem): DesignCartItemCreatePayload => {
  return {
    source: item.source,
    ...(item.source === 'design' && item.designId ? { design_id: item.designId } : {}),
    product_handle: item.productHandle,
    product_type: item.productType ?? null,
    color_id: item.colorId,
    ...(item.source === 'design' && item.techniqueId ? { technique_id: item.techniqueId } : {}),
    sizes: mapCartItemToMutationSizes(item),
  }
}

const mapRemoteCartItemToLocal = (item: DesignCartApiItem): DesignCartItem => {
  const quantity = Math.max(item.quantity_total, 1)
  const productSubtotal = parseCurrencyValue(item.pricing.product_subtotal)
  const customizationSubtotal = parseCurrencyValue(item.pricing.customization_subtotal)
  const totalSubtotal = parseCurrencyValue(item.pricing.total)

  const unitProductPrice = productSubtotal / quantity
  const unitCustomizationPrice = customizationSubtotal / quantity
  const unitTotalPrice = totalSubtotal / quantity

  return {
    id: item.id,
    source: item.source,
    designId: item.design_id ?? null,
    productId: item.product_id ?? null,
    variantId: item.variant_id ?? null,
    productHandle: item.product_handle,
    productType: item.product_type ?? null,
    productName: item.product_name,
    productSku: item.product_sku,
    designName: item.product_name,
    colorId: item.color.id ?? '',
    colorName: item.color.name ?? null,
    techniqueId: item.technique?.id ?? null,
    techniqueName: item.technique?.name ?? null,
    previewImage: item.preview_image ?? null,
    placementLabels: item.placements ?? [],
    artworkCount: item.placements?.length ?? 0,
    sizes: normalizeCartSizes(
      item.sizes.map(size => ({
        id: size.size_id,
        label: size.label ?? size.size_id,
        quantity: size.quantity,
      })),
      item.quantity_total,
    ),
    quantity,
    summary: {
      productPrice: unitProductPrice,
      customizationPrice: unitCustomizationPrice,
      totalPrice: unitTotalPrice,
      productPriceLabel: formatCurrency(unitProductPrice),
      customizationPriceLabel: formatCurrency(unitCustomizationPrice),
      totalPriceLabel: formatCurrency(unitTotalPrice),
    },
    addedAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export const useDesignCart = () => {
  const storefront = useStorefront()
  const cartItems = useState<DesignCartItem[]>('design-cart-items', () => [])
  const cartReady = useState<boolean>('design-cart-ready', () => false)
  const cartMode = useState<DesignCartMode>('design-cart-mode', () => 'unknown')
  const cartSyncInitialized = useState<boolean>('design-cart-sync-initialized', () => false)
  const cartSyncPending = useState<boolean>('design-cart-sync-pending', () => false)

  const readStoredMode = (): DesignCartMode => {
    if (!import.meta.client) {
      return 'unknown'
    }

    const storedMode = window.localStorage.getItem(DESIGN_CART_STORAGE_MODE_KEY)

    if (storedMode === 'guest' || storedMode === 'auth') {
      return storedMode
    }

    return 'unknown'
  }

  const persistCartSnapshot = (mode = cartMode.value) => {
    if (!import.meta.client) {
      return
    }

    window.localStorage.setItem(DESIGN_CART_STORAGE_KEY, JSON.stringify(cartItems.value))
    window.localStorage.setItem(DESIGN_CART_STORAGE_MODE_KEY, mode)
  }

  const hydrateLocalCart = () => {
    if (!import.meta.client || cartReady.value) {
      return
    }

    try {
      const raw = window.localStorage.getItem(DESIGN_CART_STORAGE_KEY)
      cartItems.value = normalizeCartItems(raw ? JSON.parse(raw) : [])
      cartMode.value = readStoredMode()
    } catch {
      cartItems.value = []
      cartMode.value = 'unknown'
    } finally {
      cartReady.value = true
    }
  }

  const requestRemoteCart = () => {
    return storefront<DesignCartResponse>('/cart')
  }

  const applyRemoteCart = (response: DesignCartResponse) => {
    cartItems.value = (response.data.items ?? []).map(mapRemoteCartItemToLocal)
    cartMode.value = 'auth'
    cartReady.value = true
    persistCartSnapshot('auth')
  }

  const fetchRemoteCart = async () => {
    const response = await requestRemoteCart()
    applyRemoteCart(response)
    return response
  }

  const clearLocalCartStorage = () => {
    if (!import.meta.client) {
      return
    }

    window.localStorage.removeItem(DESIGN_CART_STORAGE_KEY)
    window.localStorage.removeItem(DESIGN_CART_STORAGE_MODE_KEY)
  }

  const clearCartSnapshot = (mode: DesignCartMode = cartMode.value === 'auth' ? 'auth' : 'guest') => {
    cartItems.value = []
    cartMode.value = mode
    cartReady.value = true
    persistCartSnapshot(mode)
  }

  const mergeLocalCartIntoRemote = async (items = cartItems.value) => {
    const validItems = items.filter(item => item.quantity > 0)

    if (!validItems.length) {
      const response = await fetchRemoteCart()
      return response
    }

    const payload: DesignCartMergePayload = {
      items: validItems.map(mapCartItemToCreatePayload),
    }

    await storefront('/cart/merge', {
      method: 'POST',
      body: payload,
    })

    return fetchRemoteCart()
  }

  const resolveCartMode = async (forceRemoteCheck = false): Promise<DesignCartMode> => {
    hydrateLocalCart()

    if (!import.meta.client) {
      cartReady.value = true
      return cartMode.value
    }

    if (cartSyncPending.value) {
      return cartMode.value
    }

    if (!forceRemoteCheck && cartMode.value === 'guest') {
      cartReady.value = true
      return cartMode.value
    }

    cartSyncPending.value = true

    try {
      const localSnapshot = [...cartItems.value]
      const storedMode = readStoredMode()
      const response = await requestRemoteCart()

      cartMode.value = 'auth'
      cartReady.value = true

      if (storedMode === 'guest' && localSnapshot.length) {
        await mergeLocalCartIntoRemote(localSnapshot)
        return 'auth'
      }

      applyRemoteCart(response)
      return 'auth'
    } catch (error) {
      if (isUnauthorizedError(error)) {
        const storedMode = readStoredMode()

        if (storedMode === 'auth') {
          cartItems.value = []
          clearLocalCartStorage()
        }

        cartMode.value = 'guest'
        cartReady.value = true
        persistCartSnapshot('guest')
        return 'guest'
      }

      cartReady.value = true
      throw error
    } finally {
      cartSyncPending.value = false
    }
  }

  hydrateLocalCart()

  if (import.meta.client && !cartSyncInitialized.value) {
    watch(cartItems, () => {
      if (cartMode.value === 'guest') {
        persistCartSnapshot('guest')
      }
    }, { deep: true })

    cartSyncInitialized.value = true
  }

  const fallbackToGuestMode = () => {
    cartMode.value = 'guest'
    cartReady.value = true
    persistCartSnapshot('guest')
  }

  const itemCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + getCartItemQuantity(item), 0)
  })

  const cartSubtotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.summary.totalPrice * getCartItemQuantity(item), 0)
  })

  const upsertLocalCartItem = (item: DesignCartItem) => {
    const incomingKey = createCartIdentityKey(item)
    const existingIndex = cartItems.value.findIndex(entry => createCartIdentityKey(entry) === incomingKey)
    const existingItem = existingIndex >= 0 ? cartItems.value[existingIndex] : null
    const mergedSizes = existingItem
      ? item.sizes.map((size) => {
          const existingSize = existingItem.sizes.find(entry => entry.id === size.id)

          return {
            ...size,
            quantity: Math.max(0, (existingSize?.quantity ?? 0) + size.quantity),
          }
        })
      : item.sizes
    const nextItem = {
      ...item,
      quantity: getCartItemQuantity({
        ...item,
        sizes: mergedSizes,
      }),
      sizes: mergedSizes,
      updatedAt: new Date().toISOString(),
    }

    if (existingIndex === -1) {
      cartItems.value = [nextItem, ...cartItems.value]
      return
    }

    cartItems.value = cartItems.value.map((entry, index) => {
      return index === existingIndex ? { ...entry, ...nextItem } : entry
    })
  }

  const addCartItem = async (item: DesignCartItem) => {
    if (cartMode.value === 'auth') {
      try {
        await storefront('/cart/items', {
          method: 'POST',
          body: mapCartItemToCreatePayload(item),
        })

        await fetchRemoteCart()
        return
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          throw error
        }

        clearLocalCartStorage()
        fallbackToGuestMode()
      }
    }

    upsertLocalCartItem(item)
    fallbackToGuestMode()
  }

  const removeCartItem = async (itemId: string) => {
    if (cartMode.value === 'auth') {
      try {
        await storefront<DesignCartDeleteResponse>(`/cart/items/${itemId}`, {
          method: 'DELETE',
        })

        await fetchRemoteCart()
        return
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          throw error
        }

        clearLocalCartStorage()
        fallbackToGuestMode()
      }
    }

    cartItems.value = cartItems.value.filter(item => item.id !== itemId)
    persistCartSnapshot('guest')
  }

  const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    const item = cartItems.value.find(entry => entry.id === itemId)

    if (!item) {
      return
    }

    const firstSize = item.sizes[0]

    if (!firstSize) {
      return
    }

    await updateCartItemSizeQuantity(itemId, firstSize.id, quantity)
  }

  const updateCartItemSizeQuantity = async (itemId: string, sizeId: string, quantity: number) => {
    const item = cartItems.value.find(entry => entry.id === itemId)

    if (!item) {
      return
    }

    const nextSizes = item.sizes.map((size) => {
      if (size.id !== sizeId) {
        return size
      }

      return {
        ...size,
        quantity: Math.max(0, Math.round(quantity)),
      }
    })

    if (cartMode.value === 'auth') {
      try {
        const payload: DesignCartItemUpdatePayload = {
          sizes: nextSizes.map(size => ({
            size_id: size.id,
            label: size.label,
            quantity: size.quantity,
          })),
        }

        await storefront(`/cart/items/${itemId}`, {
          method: 'PATCH',
          body: payload,
        })

        await fetchRemoteCart()
        return
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          throw error
        }

        clearLocalCartStorage()
        fallbackToGuestMode()
      }
    }

    cartItems.value = cartItems.value.map((entry) => {
      if (entry.id !== itemId) {
        return entry
      }

      const quantityTotal = nextSizes.reduce((total, size) => total + size.quantity, 0)

      return {
        ...entry,
        sizes: nextSizes,
        quantity: quantityTotal,
        updatedAt: new Date().toISOString(),
      }
    })

    persistCartSnapshot('guest')
  }

  const clearCartItems = async (options: { optimistic?: boolean } = {}) => {
    const mode = cartMode.value
    const ids = cartItems.value.map(item => item.id)

    if (options.optimistic) {
      clearCartSnapshot(mode === 'auth' ? 'auth' : 'guest')
    }

    if (mode === 'auth') {
      try {
        for (const id of ids) {
          try {
            await storefront<DesignCartDeleteResponse>(`/cart/items/${id}`, {
              method: 'DELETE',
            })
          } catch (error) {
            if (!isNotFoundError(error)) {
              throw error
            }
          }
        }

        await fetchRemoteCart()
        return
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          throw error
        }

        clearLocalCartStorage()
        fallbackToGuestMode()
      }
    }

    if (!options.optimistic) {
      clearCartSnapshot('guest')
    }
  }

  const handleLoggedOut = () => {
    cartItems.value = []
    cartMode.value = 'guest'
    cartReady.value = true
    clearLocalCartStorage()
    persistCartSnapshot('guest')
  }

  const syncCart = async () => {
    return resolveCartMode(true)
  }

  return {
    cartItems,
    cartReady,
    cartMode,
    itemCount,
    cartSubtotal,
    hydrateCart: hydrateLocalCart,
    resolveCartMode,
    syncCart,
    fetchRemoteCart,
    mergeLocalCartIntoRemote,
    clearCartSnapshot,
    addCartItem,
    removeCartItem,
    updateCartItemQuantity,
    updateCartItemSizeQuantity,
    clearCartItems,
    handleLoggedOut,
  }
}
