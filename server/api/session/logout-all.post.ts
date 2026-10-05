// Cierra la sesion en todos los dispositivos del cliente
export default defineEventHandler(async (event) => {
  const refreshToken = getCustomerRefreshCookie(event)
  if (!refreshToken) {
    throw createError({ statusCode: 401, message: 'No hay una sesión activa.' })
  }

  try {
    await callBackend(event, '/auth/logout-all', {
      method: 'POST',
      body: { refreshToken },
    })
  }
  catch (error) {
    // 401 = la sesion ya no existia; ante un fallo de red se conserva para reintentar
    if ((error as { statusCode?: number }).statusCode !== 401) throw error
  }

  clearCustomerRefreshCookie(event)
  setResponseStatus(event, 204)
  return null
})
