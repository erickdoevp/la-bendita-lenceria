import { createCategoriesApi } from './categories.api'

export type { PublicFetch } from './categories.api'

/** $fetch contra el backend sin sesion: catalogo publico. */
export function usePublicFetch() {
  const { public: { apiBase } } = useRuntimeConfig()
  return <T>(path: string, options?: Parameters<typeof $fetch>[1]) =>
    $fetch<T>(path, { baseURL: apiBase, ...options }) as Promise<T>
}

export function useCategoriesApi() {
  return createCategoriesApi(usePublicFetch())
}
