import { loginSchema } from '#shared/schemas/auth'
import type { AuthUser, BackendTokens, SessionResponse } from '#shared/types/auth'
import { isAdminUser } from '#shared/utils/auth'
import { getFieldErrors } from '#shared/utils/validation'

export default defineEventHandler(async (event): Promise<SessionResponse> => {
  // Mismo formato de error que el backend: { message, data: { errors } }
  const parsed = loginSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Errores de validación',
      data: { errors: getFieldErrors(parsed.error) },
    })
  }

  const tokens = await callBackend<BackendTokens>(event, '/auth/login', {
    method: 'POST',
    body: parsed.data,
  })

  // Si algo falla despues del login, revocamos la sesion recien emitida
  const revoke = () => callBackend(event, '/auth/logout', {
    method: 'POST',
    body: { refreshToken: tokens.refreshToken },
  }).catch(() => {})

  let user: AuthUser
  try {
    user = await callBackend<AuthUser>(event, '/users/me', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })
  }
  catch (error) {
    await revoke()
    throw error
  }

  if (!isAdminUser(user)) {
    await revoke()
    throw createError({ statusCode: 403, message: 'No tienes acceso al panel.' })
  }

  setRefreshCookie(event, tokens.refreshToken)
  return { accessToken: tokens.accessToken, user }
})
