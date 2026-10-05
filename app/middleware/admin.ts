import { AUTH_ROUTES, useAuthStore } from '~/features/auth'

// Solo UX: la seguridad real la aplica el backend con @PreAuthorize(ROLE_ADMIN)
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  await auth.restoreSession()

  if (!auth.isAuthenticated || !auth.isAdmin) {
    return navigateTo({ path: AUTH_ROUTES.login, query: { redirect: to.fullPath } })
  }
})
