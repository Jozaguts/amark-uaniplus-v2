import type {
  StorefrontAuthAccount,
  StorefrontAuthResponse,
  StorefrontLogoutResponse,
  StorefrontProfileResponse,
} from '~~/types/auth'
import type { StorefrontFetchError } from '~~/types/storefront'

const STOREFRONT_AUTH_STORAGE_KEY = 'uandiplus-storefront-auth-account'

const getDisplayNameFromAccount = (account: StorefrontAuthAccount | null) => {
  if (!account)
    return ''

  const firstName = typeof account.firstName === 'string' ? account.firstName.trim() : ''
  const lastName = typeof account.lastName === 'string' ? account.lastName.trim() : ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  if (fullName)
    return fullName

  if (typeof account.name === 'string' && account.name.trim())
    return account.name.trim()

  if (typeof account.userName === 'string' && account.userName.trim())
    return account.userName.trim()

  if (typeof account.email === 'string' && account.email.trim())
    return account.email.trim()

  return ''
}

const isUnauthorizedError = (error: unknown) => {
  const storefrontError = error as StorefrontFetchError

  return storefrontError?.data?.statusCode === 401 || storefrontError?.data?.statusCode === 403
}

const extractProfileAccount = (payload: unknown): StorefrontAuthAccount | null => {
  if (!payload || typeof payload !== 'object')
    return null

  if ('data' in payload && payload.data && typeof payload.data === 'object')
    return payload.data as StorefrontAuthAccount

  return payload as StorefrontAuthAccount
}

export const useStorefrontAuth = () => {
  const storefront = useStorefront()
  const { syncCart, handleLoggedOut } = useDesignCart()
  const account = useState<StorefrontAuthAccount | null>('storefront-auth-account', () => null)
  const authReady = useState<boolean>('storefront-auth-ready', () => false)
  const authHydrated = useState<boolean>('storefront-auth-hydrated', () => false)

  const persistAccount = () => {
    if (!import.meta.client)
      return

    if (account.value) {
      window.localStorage.setItem(STOREFRONT_AUTH_STORAGE_KEY, JSON.stringify(account.value))
      return
    }

    window.localStorage.removeItem(STOREFRONT_AUTH_STORAGE_KEY)
  }

  const hydrateAuth = () => {
    if (!import.meta.client || authHydrated.value) {
      authReady.value = true
      return
    }

    try {
      const raw = window.localStorage.getItem(STOREFRONT_AUTH_STORAGE_KEY)
      account.value = raw ? JSON.parse(raw) as StorefrontAuthAccount : null
    } catch {
      account.value = null
    } finally {
      authHydrated.value = true
      authReady.value = true
    }
  }

  const setAuthenticatedAccount = (nextAccount: StorefrontAuthAccount | null) => {
    account.value = nextAccount
    authReady.value = true
    authHydrated.value = true
    persistAccount()
  }

  const resolveGoogleRedirectUri = () => {
    if (!import.meta.client)
      return undefined

    return `${window.location.origin}/auth/google/callback`
  }

  if (import.meta.client && !authHydrated.value)
    hydrateAuth()

  const isAuthenticated = computed(() => Boolean(account.value))
  const displayName = computed(() => getDisplayNameFromAccount(account.value))

  const fetchProfile = async () => {
    const response = await storefront<StorefrontProfileResponse | StorefrontAuthAccount>('/account/profile')

    return extractProfileAccount(response)
  }

  const syncProfile = async () => {
    try {
      const profile = await fetchProfile()

      if (profile)
        setAuthenticatedAccount(profile)

      return profile
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setAuthenticatedAccount(null)
        return null
      }

      throw error
    }
  }

  const finalizeAuthenticatedRequest = async (response: StorefrontAuthResponse) => {
    const profileAccount = await syncProfile().catch(() => null)
    setAuthenticatedAccount(profileAccount ?? response.data)
    await syncCart().catch(() => 'guest')

    return response
  }

  const loginWithCredentials = async (email: string, password: string) => {
    const response = await storefront<StorefrontAuthResponse>('/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    })

    return finalizeAuthenticatedRequest(response)
  }

  const registerWithCredentials = async (email: string, password: string) => {
    const response = await storefront<StorefrontAuthResponse>('/auth/register', {
      method: 'POST',
      body: {
        email,
        password,
      },
    })

    return finalizeAuthenticatedRequest(response)
  }

  const authenticateWithGoogleCode = async (code: string, redirectUri = resolveGoogleRedirectUri()) => {
    const response = await storefront<StorefrontAuthResponse>('/auth/google', {
      method: 'POST',
      body: redirectUri
        ? {
            code,
            redirect_uri: redirectUri,
          }
        : { code },
    })

    return finalizeAuthenticatedRequest(response)
  }

  const logout = async () => {
    try {
      await storefront<StorefrontLogoutResponse>('/auth/logout', {
        method: 'POST',
        body: {},
      })
    } finally {
      setAuthenticatedAccount(null)
      handleLoggedOut()
    }
  }

  return {
    account,
    authReady,
    isAuthenticated,
    displayName,
    hydrateAuth,
    setAuthenticatedAccount,
    fetchProfile,
    syncProfile,
    loginWithCredentials,
    registerWithCredentials,
    authenticateWithGoogleCode,
    logout,
  }
}
