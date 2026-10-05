import { loginSchema } from '#shared/schemas/auth'
import type { BackendTokens, SessionResponse } from '#shared/types/auth'
import { getFieldErrors } from '#shared/utils/validation'

export default defineEventHandler(async (event): Promise<SessionResponse> => {
  const parsed = loginSchema.safeParse(await readBody(event))
  if (!parsed.success) throw validationError(getFieldErrors(parsed.error))

  const tokens = await callBackend<BackendTokens>(event, '/auth/login', {
    method: 'POST',
    body: parsed.data,
  })
  return startCustomerSession(event, tokens)
})
