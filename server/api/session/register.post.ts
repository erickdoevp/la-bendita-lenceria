import { registerSchema } from '#shared/schemas/auth'
import type { BackendTokens, SessionResponse } from '#shared/types/auth'
import { getFieldErrors } from '#shared/utils/validation'

// 201 del backend: el usuario queda logueado igual que en el login
export default defineEventHandler(async (event): Promise<SessionResponse> => {
  const parsed = registerSchema.safeParse(await readBody(event))
  if (!parsed.success) throw validationError(getFieldErrors(parsed.error))

  const tokens = await callBackend<BackendTokens>(event, '/auth/register', {
    method: 'POST',
    body: parsed.data,
  })
  const session = await startCustomerSession(event, tokens)
  setResponseStatus(event, 201)
  return session
})
