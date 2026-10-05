export default defineEventHandler(async (event) => {
  const refreshToken = getCustomerRefreshCookie(event)
  if (refreshToken) {
    // Idempotente en el backend; un fallo de red no debe impedir cerrar sesion
    await callBackend(event, '/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    }).catch(() => {})
  }

  clearCustomerRefreshCookie(event)
  setResponseStatus(event, 204)
  return null
})
