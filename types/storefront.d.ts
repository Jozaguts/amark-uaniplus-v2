import type { FetchError } from 'ofetch'

export type StorefrontValidationErrors = Record<string, string[]>

export type StorefrontErrorData = {
    message: string
    statusCode: number
    code?: string
    errors?: StorefrontValidationErrors
}

export type StorefrontFetchError = FetchError<StorefrontErrorData>

declare module '#app' {
    interface NuxtApp {
        $storefront: typeof $fetch
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $storefront: typeof $fetch
    }
}

export {}
