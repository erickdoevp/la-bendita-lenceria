import type { ResolvedCategory } from '~/features/store-catalog'
import { LISTING_DATA_KEY, LISTING_PAGE_SIZE } from '../constants'
import { useListingApi } from '../services'
import type { ListingQuery } from '../types'
import type { ListingUrlState } from '../utils/query'

/**
 * Productos de la categoria actual. Se vuelve a pedir al cambiar de categoria,
 * filtros, orden o pagina; mientras tanto se conservan los resultados anteriores.
 */
export async function useCategoryListing(resolved: Ref<ResolvedCategory>, state: Ref<ListingUrlState>) {
  const api = useListingApi()

  const query = computed<ListingQuery>(() => ({
    ...state.value,
    categoryId: resolved.value.category.id,
    pageSize: LISTING_PAGE_SIZE,
  }))

  const { data, status, error, refresh } = await useAsyncData(
    LISTING_DATA_KEY,
    () => api.search(query.value, resolved.value.category),
    { watch: [query] },
  )

  return {
    result: data,
    /** Primera carga sin datos: se muestran skeletons. */
    initialLoading: computed(() => status.value === 'pending' && !data.value),
    /** Cambio de filtros con datos previos: la cuadricula se atenua. */
    refreshing: computed(() => status.value === 'pending' && Boolean(data.value)),
    errorMessage: computed(() => (error.value ? parseApiError(error.value).message : null)),
    refresh,
  }
}
