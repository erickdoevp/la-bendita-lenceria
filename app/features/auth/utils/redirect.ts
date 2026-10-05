import { AUTH_ROUTES } from '../constants'

/** Solo permite volver a rutas internas del panel (evita open redirects). */
export function getSafeAdminRedirect(value: unknown): string {
  if (typeof value === 'string' && value.startsWith(AUTH_ROUTES.home) && !value.startsWith(AUTH_ROUTES.login)) {
    return value
  }
  return AUTH_ROUTES.home
}
