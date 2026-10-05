import { CUSTOMER_AUTH_ROUTES } from '../constants'

const AUTH_PAGES: string[] = [CUSTOMER_AUTH_ROUTES.login, CUSTOMER_AUTH_ROUTES.register]

/** Solo rutas internas de la tienda (evita open redirects y volver al login). */
export function getSafeStoreRedirect(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return CUSTOMER_AUTH_ROUTES.account
  }
  const path = value.split(/[?#]/)[0] ?? ''
  if (path.startsWith('/admin') || AUTH_PAGES.includes(path)) return CUSTOMER_AUTH_ROUTES.account
  return value
}
