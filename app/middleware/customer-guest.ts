import { getSafeStoreRedirect, useCustomerAuthStore } from '~/features/customer-auth'

// /login y /registro con sesion activa: manda a donde iba o a /cuenta
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const auth = useCustomerAuthStore()
  await auth.restoreSession()

  if (auth.isAuthenticated) {
    return navigateTo(getSafeStoreRedirect(to.query.redirect), { replace: true })
  }
})
