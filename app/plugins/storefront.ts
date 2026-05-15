import type { StorefrontErrorData } from '@/types/storefront'

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    return Object.prototype.toString.call(value) === '[object Object]'
}

const normalizeStorefrontError = (status: number, statusText: string, data: unknown): StorefrontErrorData => {
    if (isPlainObject(data)) {
        const message = typeof data.message === 'string' && data.message
            ? data.message
            : statusText || 'Request failed'

        return {
            message,
            statusCode: typeof data.statusCode === 'number' ? data.statusCode : status,
            code: typeof data.code === 'string' ? data.code : undefined,
            errors: isPlainObject(data.errors) ? data.errors as Record<string, string[]> : undefined,
        }
    }

    return {
        message: statusText || 'Request failed',
        statusCode: status,
    }
}

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const apiBase = String(config.public.apiBase)
    const baseURL = import.meta.server && apiBase.startsWith('/')
        ? `${useRequestURL().origin}${apiBase}`
        : apiBase

    const storefront = $fetch.create({
        baseURL,
        credentials: 'include',
        retry: 0,
        onRequest({ options }) {
            const headers = new Headers(options.headers ?? {})
            headers.set('accept', 'application/json')
            headers.delete('authorization')

            const isFormData = options.body instanceof FormData
            const canSetJsonContentType = options.body
                && !isFormData
                && !(options.body instanceof URLSearchParams)
                && !(options.body instanceof Blob)
                && !(options.body instanceof ArrayBuffer)
                && !headers.has('content-type')

            if (canSetJsonContentType) {
                headers.set('content-type', 'application/json')
            }

            if (options.query instanceof URLSearchParams) {
                options.query.delete('tenant_id')
            } else if (isPlainObject(options.query) && 'tenant_id' in options.query) {
                const nextQuery = { ...options.query }
                delete nextQuery.tenant_id
                options.query = nextQuery
            }

            if (import.meta.server) {
                const { cookie } = useRequestHeaders(['cookie'])

                if (cookie && !headers.has('cookie')) {
                    headers.set('cookie', cookie)
                }
            }

            options.headers = headers
        },
        onResponseError({ response }) {
            response._data = normalizeStorefrontError(
                response.status,
                response.statusText,
                response._data,
            )
        },
    })

    return {
        provide: {
            storefront,
        },
    }
})
