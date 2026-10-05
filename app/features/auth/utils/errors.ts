export interface AuthErrorInfo {
  status: number | null
  message: string
  fieldErrors: Record<string, string>
}

const NETWORK_MESSAGE = 'No pudimos conectar con el servidor. Intenta de nuevo.'

interface ErrorLike {
  statusCode?: number
  status?: number
  response?: { status?: number }
  data?: {
    message?: string
    errors?: Record<string, string>
    data?: { errors?: Record<string, string> }
  }
}

export function getErrorStatus(error: unknown): number | null {
  const e = (error ?? {}) as ErrorLike
  return e.response?.status ?? e.statusCode ?? e.status ?? null
}

/** Normaliza errores del BFF (formato H3) y del backend (formato Spring). */
export function parseAuthError(error: unknown): AuthErrorInfo {
  const status = getErrorStatus(error)
  if (!status || status >= 500) {
    return { status, message: NETWORK_MESSAGE, fieldErrors: {} }
  }

  const body = (error as ErrorLike).data
  return {
    status,
    message: body?.message ?? 'No se pudo completar la solicitud.',
    fieldErrors: body?.data?.errors ?? body?.errors ?? {},
  }
}
