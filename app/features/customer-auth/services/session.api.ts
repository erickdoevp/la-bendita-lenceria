import type { LoginRequest, RegisterRequest } from '#shared/schemas/auth'
import type { AuthUser, RefreshResponse, SessionResponse } from '#shared/types/auth'

/**
 * Login, registro, refresh y logout pasan por el BFF (/api/session/*), que guarda
 * el refreshToken en una cookie httpOnly. El resto va directo al backend.
 */
export function createSessionApi(apiBase: string) {
  const bearer = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` })

  return {
    login: (credentials: LoginRequest) =>
      $fetch<SessionResponse>('/api/session/login', { method: 'POST', body: credentials }),

    register: (body: RegisterRequest) =>
      $fetch<SessionResponse>('/api/session/register', { method: 'POST', body }),

    refresh: () =>
      $fetch<RefreshResponse>('/api/session/refresh', { method: 'POST' }),

    logout: () =>
      $fetch('/api/session/logout', { method: 'POST' }),

    logoutAll: () =>
      $fetch('/api/session/logout-all', { method: 'POST' }),

    me: (accessToken: string) =>
      $fetch<AuthUser>('/users/me', { baseURL: apiBase, headers: bearer(accessToken) }),

    /** Une el carrito de invitado con el de la cuenta (FLUJO-CHECKOUT-Y-PAGOS 4.2). */
    mergeCart: (accessToken: string, guestToken: string) =>
      $fetch('/cart/merge', {
        baseURL: apiBase,
        method: 'POST',
        query: { guestToken },
        headers: bearer(accessToken),
      }),
  }
}
