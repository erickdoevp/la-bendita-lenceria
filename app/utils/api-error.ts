export interface ApiErrorInfo {
  status: number | null
  message: string
  fieldErrors: Record<string, string>
}

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

const NETWORK_MESSAGE = 'No pudimos conectar con el servidor. Intenta de nuevo.'
const DEFAULT_CONFLICT = 'Ya existe un registro con esos datos o está en uso.'

/**
 * Normaliza los errores del backend (ver CREACION-DE-ARTICULO, sec. 2).
 * El 409 trae el texto crudo de Postgres, por eso se sustituye por uno legible.
 */
export function parseApiError(error: unknown, options: { conflict?: string } = {}): ApiErrorInfo {
  const e = (error ?? {}) as ErrorLike
  const status = e.response?.status ?? e.statusCode ?? e.status ?? null

  if (!status || status >= 500) {
    return { status, message: NETWORK_MESSAGE, fieldErrors: {} }
  }
  if (status === 409) {
    return { status, message: options.conflict ?? DEFAULT_CONFLICT, fieldErrors: {} }
  }

  return {
    status,
    message: e.data?.message ?? 'No se pudo completar la solicitud.',
    fieldErrors: e.data?.errors ?? e.data?.data?.errors ?? {},
  }
}
