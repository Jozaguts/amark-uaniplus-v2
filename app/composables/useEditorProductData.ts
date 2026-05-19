import type { EditorProduct, EditorProductQuery, EditorProductResponse } from '~~/types/editor-product'
import type { StorefrontFetchError } from '~~/types/storefront'

export const useEditorProductData = async (options: {
  identifier: Ref<string> | ComputedRef<string>
  type?: Ref<string | undefined> | ComputedRef<string | undefined>
  by?: Ref<string | undefined> | ComputedRef<string | undefined>
  keyPrefix?: string
  server?: boolean
}) => {
  const storefront = useStorefront()
  const detailQuery = computed<EditorProductQuery>(() => {
    return options.by?.value === 'sku'
      ? { by: 'sku' }
      : {}
  })

  return useAsyncData<EditorProduct | null>(
    () => `${options.keyPrefix ?? 'editor-product'}-${options.type?.value ?? 'fashion'}-${options.identifier.value}-${detailQuery.value.by ?? 'slug'}`,
    async () => {
      if (!options.identifier.value) {
        return null
      }

      const productType = options.type?.value || 'fashion'

      try {
        const response = await storefront<EditorProductResponse>(`/products/${productType}/${options.identifier.value}`, {
          query: detailQuery.value,
        })

        return response.data
      } catch (error) {
        const storefrontError = error as StorefrontFetchError

        if (storefrontError?.data?.statusCode === 404) {
          return null
        }

        throw error
      }
    },
    {
      default: () => null,
      server: options.server ?? true,
      watch: [options.identifier, detailQuery, ...(options.type ? [options.type] : [])],
    },
  )
}
