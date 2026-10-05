import type { LoginRequest } from '#shared/schemas/auth'
import type { AuthUser, RefreshResponse, SessionResponse } from '#shared/types/auth'

/**
 * Login, refresh y logout pasan por el BFF de Nuxt (/api/auth/*), que guarda
 * el refreshToken en una cookie httpOnly. /users/me va directo al backend.
 */
export function createAuthApi(apiBase: string) {
  return {
    login: (credentials: LoginRequest) =>
      $fetch<SessionResponse>('/api/auth/login', { method: 'POST', body: credentials }),

    refresh: () =>
      $fetch<RefreshResponse>('/api/auth/refresh', { method: 'POST' }),

    logout: () =>
      $fetch('/api/auth/logout', { method: 'POST' }),

    me: (accessToken: string) =>
      $fetch<AuthUser>('/users/me', {
        baseURL: apiBase,
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
  }
}
