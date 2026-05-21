import type {
  AccountAddressDeleteResponse,
  AccountAddressListQuery,
  AccountAddressListResponse,
  AccountAddressPayload,
  AccountAddressResponse,
} from '~~/types/address'

export const useAccountAddresses = () => {
  const storefront = useStorefront()

  return {
    listAddresses(query: AccountAddressListQuery = {}) {
      return storefront<AccountAddressListResponse>('/account/addresses', {
        query,
      })
    },
    getAddress(addressId: string | number) {
      return storefront<AccountAddressResponse>(`/account/addresses/${addressId}`)
    },
    createAddress(payload: AccountAddressPayload) {
      return storefront<AccountAddressResponse>('/account/addresses', {
        method: 'POST',
        body: payload,
      })
    },
    updateAddress(addressId: string | number, payload: AccountAddressPayload) {
      return storefront<AccountAddressResponse>(`/account/addresses/${addressId}`, {
        method: 'PATCH',
        body: payload,
      })
    },
    deleteAddress(addressId: string | number) {
      return storefront<AccountAddressDeleteResponse>(`/account/addresses/${addressId}`, {
        method: 'DELETE',
      })
    },
    setDefaultAddress(addressId: string | number) {
      return storefront<AccountAddressResponse>(`/account/addresses/${addressId}/default`, {
        method: 'POST',
        body: {},
      })
    },
  }
}
