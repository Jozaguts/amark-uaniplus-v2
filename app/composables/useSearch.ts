import type { SearchResponse, SearchResult } from '~/types/search'

export function useSearch() {
  const { $storefront } = useNuxtApp()

  const query = ref('')
  const results = ref<SearchResult[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  const performSearch = async (q: string) => {
    if (q.length < 2) {
      results.value = []
      return
    }

    pending.value = true
    error.value = null

    try {
      const response = await $storefront<SearchResponse>('/search', {
        query: { q, limit: 10 },
      })
      results.value = response.data ?? []
    }
    catch {
      error.value = 'search_failed'
      results.value = []
    }
    finally {
      pending.value = false
    }
  }

  const debouncedSearch = useDebounceFn(performSearch, 300)

  watch(query, (q) => {
    if (q.length < 2) {
      results.value = []
      return
    }
    debouncedSearch(q)
  })

  const clear = () => {
    query.value = ''
    results.value = []
    error.value = null
    pending.value = false
  }

  return { query, results, pending, error, clear }
}
