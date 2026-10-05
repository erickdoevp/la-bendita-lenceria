import { createHomeApi } from './home.api'

export function useHomeApi() {
  const { public: { apiBase } } = useRuntimeConfig()
  return createHomeApi((path, options) => $fetch(path, { baseURL: apiBase, ...options }))
}
