import { CUSTOMER_AUTH_ROUTES, useCustomerAuthStore } from '~/features/customer-auth'

// Solo UX: el backend responde 401 sin token y 403 si el recurso no es del cliente
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const auth = useCustomerAuthStore()
  await auth.restoreSession()

  if (!auth.isAuthenticated) {
    return navigateTo({ path: CUSTOMER_AUTH_ROUTES.login, query: { redirect: to.fullPath } })
  }
})
