export function useStorefront() {
  const { $storefront } = useNuxtApp()

  return $storefront
}
