import { getSafeAdminRedirect, useAuthStore } from '~/features/auth'

// Si ya hay sesion, el login no tiene sentido: manda al panel
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  await auth.restoreSession()

  if (auth.isAuthenticated && auth.isAdmin) {
    return navigateTo(getSafeAdminRedirect(to.query.redirect), { replace: true })
  }
})
