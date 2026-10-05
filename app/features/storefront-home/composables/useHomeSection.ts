import { HOME_DATA_KEYS } from '../constants'
import { useHomeApi } from '../services'

/**
 * Cada seccion pide sus datos por separado. Con lazy el SSR igual los resuelve,
 * pero en navegacion del cliente la pagina se pinta al instante con skeletons.
 */
function useHomeSection<T>(key: string, fetcher: (api: ReturnType<typeof useHomeApi>) => Promise<T>) {
  const api = useHomeApi()
  const { data, status, error, refresh } = useAsyncData(key, () => fetcher(api), { lazy: true })

  return {
    data,
    loading: computed(() => status.value === 'pending' || status.value === 'idle'),
    errorMessage: computed(() => (error.value ? parseApiError(error.value).message : null)),
    refresh,
  }
}

export const useLatestProducts = () => useHomeSection(HOME_DATA_KEYS.latest, api => api.latestProducts())
export const useFeaturedCategories = () => useHomeSection(HOME_DATA_KEYS.categories, api => api.featuredCategories())
export const useHomeCollections = () => useHomeSection(HOME_DATA_KEYS.collections, api => api.collections())

/** El hero no es lazy: debe llegar renderizado desde el servidor (LCP). */
export async function useHomeHero() {
  const api = useHomeApi()
  const { data } = await useAsyncData(HOME_DATA_KEYS.hero, () => api.hero())
  return data
}
