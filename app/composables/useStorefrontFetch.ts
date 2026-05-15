import { useFetch, type UseFetchOptions } from 'nuxt/app'
import type { StorefrontFetchError } from '@/types/storefront'

export function useStorefrontFetch<T>(
    url: string | (() => string),
    options: UseFetchOptions<T> = {},
) {
    const { $storefront } = useNuxtApp()

    return useFetch<T, StorefrontFetchError>(url, {
        ...options,
        $fetch: $storefront as typeof $fetch,
    })
}
