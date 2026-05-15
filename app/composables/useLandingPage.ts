import type { MaybeRefOrGetter } from 'vue'
import type {
  LandingPage,
  LandingPageResponse,
  LandingSection,
} from '~/types/landing-page'
import { toValue } from 'vue'

function activeSections(sections: LandingSection[] = []): LandingSection[] {
  return sections
    .filter(section => section.is_active !== false)
    .map(section => ({
      ...section,
      items: [...(section.items ?? [])].sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0)),
    }))
    .sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0))
}

export function useLandingPage(scope: MaybeRefOrGetter<string>) {
  const { locale } = useI18n()
  const normalizedScope = computed(() => toValue(scope))

  const { data, error, pending, refresh } = useStorefrontFetch<LandingPageResponse>(
    () => `/storefront/landing-pages/${normalizedScope.value}`,
    {
      key: computed(() => `landing-page:${normalizedScope.value}:${locale.value}`),
      query: computed(() => ({ locale: locale.value })),
      default: () => ({ data: null }),
      immediate: Boolean(normalizedScope.value),
      watch: [normalizedScope, locale],
    },
  )

  const landingPage = computed<LandingPage | null>(() => {
    if (!normalizedScope.value || !data.value?.data || data.value.data.is_active === false)
      return null

    return {
      ...data.value.data,
      sections: activeSections(data.value.data.sections),
    }
  })

  return {
    error,
    landingPage,
    pending,
    refresh,
  }
}
