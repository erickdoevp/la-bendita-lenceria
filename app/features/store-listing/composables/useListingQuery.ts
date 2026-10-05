import type { ListingSort, PriceRangeKey } from '../types'
import { countActiveFilters, parseListingQuery, serializeListingQuery, type ListingUrlState } from '../utils/query'

/**
 * Estado de filtros, orden y pagina guardado en la URL: se puede compartir,
 * recargar y volver atras sin perderlo.
 */
export function useListingQuery() {
  const route = useRoute()
  const state = computed(() => parseListingQuery(route.query))
  const activeCount = computed(() => countActiveFilters(state.value))

  function update(patch: Partial<ListingUrlState>, options: { keepPage?: boolean } = {}) {
    // Cualquier cambio de filtro u orden vuelve a la primera pagina
    const next = { ...state.value, ...patch, page: options.keepPage ? (patch.page ?? state.value.page) : 1 }
    return navigateTo({ path: route.path, query: serializeListingQuery(next) })
  }

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter(v => v !== value) : [...list, value]

  return {
    state,
    activeCount,
    toggleSize: (size: string) => update({ sizes: toggle(state.value.sizes, size) }),
    toggleColor: (color: string) => update({ colors: toggle(state.value.colors, color) }),
    setPrice: (price: PriceRangeKey | null) => update({ price: state.value.price === price ? null : price }),
    setOnSale: (onSale: boolean) => update({ onSale }),
    setSort: (sort: ListingSort) => update({ sort }),
    setPage: (page: number) => update({ page }, { keepPage: true }),
    clearFilters: () => update({ sizes: [], colors: [], price: null, onSale: false }),
  }
}

export type ListingQueryControls = ReturnType<typeof useListingQuery>
