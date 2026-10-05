import { createHomeApi } from './home.api'
import type { PublicFetch } from './home.api'

// $fetch sin rutas tipadas de Nitro: con un path dinamico TS se queda sin pila comparandolas
const untypedFetch = $fetch as unknown as PublicFetch

export function useHomeApi() {
  const { public: { apiBase } } = useRuntimeConfig()
  return createHomeApi((path, options) => untypedFetch(path, { baseURL: apiBase, ...options }))
}
