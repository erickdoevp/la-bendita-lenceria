import { useCustomerAuthStore } from '../stores/customer-auth.store'

type FetchOptions = NonNullable<Parameters<typeof $fetch>[1]>

/**
 * $fetch contra el backend con el accessToken del cliente. Ante un 401 refresca
 * el token y reintenta una sola vez; si el refresh falla, el store cierra la sesion.
 */
export function useCustomerFetch() {
  const auth = useCustomerAuthStore()
  const { public: { apiBase } } = useRuntimeConfig()

  return async function customerFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const request = () => {
      const headers = new Headers(options.headers as HeadersInit | undefined)
      if (auth.accessToken) headers.set('Authorization', `Bearer ${auth.accessToken}`)
      return $fetch<T>(path, { baseURL: apiBase, ...options, headers } as FetchOptions) as Promise<T>
    }

    try {
      return await request()
    }
    catch (error) {
      // 403 = recurso ajeno: no tiene sentido refrescar ni reintentar
      if (parseApiError(error).status !== 401) throw error
      await auth.refresh()
      return request()
    }
  }
}

export type CustomerFetch = ReturnType<typeof useCustomerFetch>
