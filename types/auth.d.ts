export type StorefrontAuthAccount = Record<string, unknown> & {
  id?: string | number
  email?: string | null
  name?: string | null
  full_name?: string | null
  userName?: string | null
  firstName?: string | null
  lastName?: string | null
  role?: string | null
  avatar_url?: string | null
  date_of_birth?: string | null
  address?: string | null
  gender?: string | null
  phone?: string | null
  about?: string | null
}

export type StorefrontAuthResponse = {
  message: string
  data: StorefrontAuthAccount
}

export type StorefrontLogoutResponse = {
  message: string
}

export type StorefrontProfileResponse = {
  data: StorefrontAuthAccount
}
