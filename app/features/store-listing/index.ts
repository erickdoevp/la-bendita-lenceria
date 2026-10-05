// API publica del feature store-listing (listado de productos por categoria).
// Fuera del feature, importa solo desde aqui.
export { default as CategoryListingView } from './components/CategoryListingView.vue'
export { useListingQuery } from './composables/useListingQuery'
export { LISTING_PAGE_SIZE, LISTING_QUERY_KEYS, SORT_OPTIONS } from './constants'
export type { ListingFacets, ListingFilters, ListingQuery, ListingResult, ListingSort } from './types'
