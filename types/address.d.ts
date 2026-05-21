export type AccountAddressType = 'shipping' | 'billing'

export type AccountAddressPayload = {
  first_name: string
  last_name: string
  email: string
  phone_country_code: string
  phone_number: string
  country_code: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  state_code: string
  district: string
  county: string
  postal_code: string
  formatted_address: string
  google_place_id: string
  latitude: number | null
  longitude: number | null
  is_default: boolean
  save_to_address_book: boolean
  type: AccountAddressType
}

export type AccountAddress = AccountAddressPayload & {
  id: string | number
  created_at?: string | null
  updated_at?: string | null
}

export type AccountAddressListQuery = {
  type?: AccountAddressType
}

export type AccountAddressListResponse = {
  data: AccountAddress[]
}

export type AccountAddressResponse = {
  message: string
  data: AccountAddress
}

export type AccountAddressDeleteResponse = {
  message: string
}
