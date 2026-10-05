import { useAuthStore } from '../stores/auth.store'
import { getErrorStatus } from '../utils/errors'

type FetchOptions = NonNullable<Parameters<typeof $fetch>[1]>

/**
 * $fetch contra el backend con el accessToken. Ante un 401 refresca el token
 * y reintenta una sola vez; si el refresh falla, el store cierra la sesion.
 */
export function useAuthFetch() {
  const auth = useAuthStore()
  const { public: { apiBase } } = useRuntimeConfig()

  return async function authFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const request = () => {
      const headers = new Headers(options.headers as HeadersInit | undefined)
      if (auth.accessToken) headers.set('Authorization', `Bearer ${auth.accessToken}`)
      return $fetch<T>(path, { baseURL: apiBase, ...options, headers } as FetchOptions) as Promise<T>
    }

    try {
      return await request()
    }
    catch (error) {
      // 403 = sin permisos: no tiene sentido refrescar
      if (getErrorStatus(error) !== 401) throw error
      await auth.refresh()
      return request()
    }
  }
}
