export const CUSTOMER_AUTH_ROUTES = {
  login: '/login',
  register: '/registro',
  account: '/cuenta',
  home: '/',
} as const

/**
 * Marca (no secreta) de que hay sesion en este navegador. El refreshToken va en
 * cookie httpOnly que JS no puede leer: sin la marca no se intenta el refresh
 * y los visitantes no generan un 401 en cada carga.
 */
export const SESSION_HINT_KEY = 'lb-customer-session'

/** Token del carrito de invitado; lo escribe el carrito (FLUJO-CHECKOUT-Y-PAGOS 4.2). */
export const GUEST_CART_TOKEN_KEY = 'lb-guest-cart-token'

/** Avisos que el login muestra al llegar con ?notice=... */
export const LOGIN_NOTICES = {
  'password-changed': 'Contraseña actualizada. Inicia sesión de nuevo.',
  'logged-out-all': 'Cerraste sesión en todos tus dispositivos.',
  'session-expired': 'Tu sesión terminó. Inicia sesión de nuevo.',
} as const

export type LoginNotice = keyof typeof LOGIN_NOTICES
