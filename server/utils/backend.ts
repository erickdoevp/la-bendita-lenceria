import type { H3Event } from 'h3'
import type { BackendError } from '#shared/types/auth'

type FetchOptions = NonNullable<Parameters<typeof $fetch>[1]>

interface FetchErrorLike {
  response?: { status: number }
  data?: unknown
}

/** Llama al backend y convierte sus errores en errores H3 con el mismo status. */
export async function callBackend<T>(event: H3Event, path: string, options: FetchOptions = {}): Promise<T> {
  const { public: { apiBase } } = useRuntimeConfig(event)
  try {
    return await $fetch<T>(path, { baseURL: apiBase, ...options } as FetchOptions) as T
  }
  catch (error) {
    throw toH3Error(error)
  }
}

function toH3Error(error: unknown) {
  const { response, data } = (error ?? {}) as FetchErrorLike
  if (!response) {
    return createError({ statusCode: 502, message: 'No se pudo conectar con el servidor.' })
  }

  // Los 401 de Spring Security pueden venir sin body: se decide por el status
  const body = (data && typeof data === 'object' ? data : {}) as Partial<BackendError>
  return createError({
    statusCode: response.status,
    message: body.message ?? 'No se pudo completar la solicitud.',
    data: body.errors ? { errors: body.errors } : undefined,
  })
}
