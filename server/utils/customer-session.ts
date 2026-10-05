import type { H3Event } from 'h3'
import type { AuthUser, BackendTokens, SessionResponse } from '#shared/types/auth'

// Sesion de la tienda: independiente de la del panel (cookie y ruta propias)
const CUSTOMER_REFRESH_COOKIE = 'lb_rt'
const SEVEN_DAYS = 60 * 60 * 24 * 7

const cookieOptions = {
  httpOnly: true,
  secure: !import.meta.dev,
  sameSite: 'strict',
  path: '/api/session',
} as const

export function getCustomerRefreshCookie(event: H3Event) {
  return getCookie(event, CUSTOMER_REFRESH_COOKIE)
}

export function setCustomerRefreshCookie(event: H3Event, refreshToken: string) {
  setCookie(event, CUSTOMER_REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: SEVEN_DAYS })
}

export function clearCustomerRefreshCookie(event: H3Event) {
  deleteCookie(event, CUSTOMER_REFRESH_COOKIE, cookieOptions)
}

/**
 * Tras login o registro: pide el perfil y guarda el refreshToken en cookie.
 * La tienda no valida roles: cualquier usuario es un cliente valido.
 */
export async function startCustomerSession(event: H3Event, tokens: BackendTokens): Promise<SessionResponse> {
  let user: AuthUser
  try {
    user = await callBackend<AuthUser>(event, '/users/me', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })
  }
  catch (error) {
    // Si algo falla despues del login, revocamos la sesion recien emitida
    await callBackend(event, '/auth/logout', {
      method: 'POST',
      body: { refreshToken: tokens.refreshToken },
    }).catch(() => {})
    throw error
  }

  setCustomerRefreshCookie(event, tokens.refreshToken)
  return { accessToken: tokens.accessToken, user }
}

/** Mismo formato de error que el backend: { message, data: { errors } } */
export function validationError(errors: Record<string, string>) {
  return createError({ statusCode: 400, message: 'Errores de validación', data: { errors } })
}
