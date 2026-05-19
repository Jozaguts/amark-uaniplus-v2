export default defineNuxtRouteMiddleware(async (to) => {
  // The storefront session cookie belongs to the tenant API. On a hard reload,
  // SSR only receives cookies for the frontend host, so server-side validation
  // can falsely fail and redirect an authenticated user to login.
  if (import.meta.server)
    return

  const { hydrateAuth, isAuthenticated, syncProfile } = useStorefrontAuth()

  hydrateAuth()

  const profile = await syncProfile().catch(() => null)

  if (profile || isAuthenticated.value)
    return

  return navigateTo({
    path: '/login',
    query: {
      redirect: to.fullPath,
    },
  })
})
