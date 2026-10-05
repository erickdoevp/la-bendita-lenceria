import type { BackendTokens, RefreshResponse } from '#shared/types/auth'

export default defineEventHandler(async (event): Promise<RefreshResponse> => {
  const refreshToken = getCustomerRefreshCookie(event)
  if (!refreshToken) {
    throw createError({ statusCode: 401, message: 'No hay una sesión activa.' })
  }

  try {
    const tokens = await callBackend<BackendTokens>(event, '/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    })
    // Rotacion: el refreshToken anterior queda revocado
    setCustomerRefreshCookie(event, tokens.refreshToken)
    return { accessToken: tokens.accessToken }
  }
  catch (error) {
    if ((error as { statusCode?: number }).statusCode === 401) {
      clearCustomerRefreshCookie(event)
    }
    throw error
  }
})
