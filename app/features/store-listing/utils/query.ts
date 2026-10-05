import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import { DEFAULT_SORT, LISTING_QUERY_KEYS as K, PRICE_RANGES, SORT_OPTIONS } from '../constants'
import type { ListingFilters, ListingSort, PriceRangeKey } from '../types'

export interface ListingUrlState extends ListingFilters {
  sort: ListingSort
  page: number
}

type QueryValue = LocationQuery[string] | undefined

const first = (value: QueryValue) => (Array.isArray(value) ? value[0] : value) ?? ''

/** "S,M" -> ["S", "M"], sin vacios ni repetidos. */
const list = (value: QueryValue) =>
  [...new Set(first(value).split(',').map(v => v.trim()).filter(Boolean))]

/** Lee la URL tolerando valores manipulados: lo invalido se ignora. */
export function parseListingQuery(query: LocationQuery): ListingUrlState {
  const sort = first(query[K.sort]) as ListingSort
  const price = first(query[K.price]) as PriceRangeKey
  const page = Number.parseInt(first(query[K.page]), 10)

  return {
    sizes: list(query[K.sizes]),
    colors: list(query[K.colors]),
    price: PRICE_RANGES.some(r => r.value === price) ? price : null,
    onSale: first(query[K.onSale]) === '1',
    sort: SORT_OPTIONS.some(o => o.value === sort) ? sort : DEFAULT_SORT,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

/** Solo escribe lo que difiere del valor por defecto para mantener URLs limpias. */
export function serializeListingQuery(state: ListingUrlState): LocationQueryRaw {
  return {
    [K.sizes]: state.sizes.length ? state.sizes.join(',') : undefined,
    [K.colors]: state.colors.length ? state.colors.join(',') : undefined,
    [K.price]: state.price ?? undefined,
    [K.onSale]: state.onSale ? '1' : undefined,
    [K.sort]: state.sort === DEFAULT_SORT ? undefined : state.sort,
    [K.page]: state.page > 1 ? String(state.page) : undefined,
  }
}

export const countActiveFilters = (state: ListingFilters) =>
  state.sizes.length + state.colors.length + (state.price ? 1 : 0) + (state.onSale ? 1 : 0)
