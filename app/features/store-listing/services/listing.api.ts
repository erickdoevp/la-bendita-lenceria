import type { PublicFetch, StoreCategory } from '~/features/store-catalog'
import { collectCategoryIds, getMockCatalog } from '~/features/store-catalog'
import { LISTING_QUERY_KEYS, USE_LISTING_MOCKS } from '../constants'
import { runListingQuery } from '../mocks/listing-engine'
import type { ListingQuery, ListingResult } from '../types'

/** Simula la latencia de red para poder ver los estados de carga. */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function createListingApi(publicFetch: PublicFetch) {
  return {
    /**
     * Productos publicados de una categoria (y sus descendientes) con filtros,
     * orden, pagina y facetas para pintar los filtros con conteos.
     * TODO: endpoint real, p. ej. GET /products/search?categoryId=&talla=&color=&precio=&oferta=&orden=&page=&size=
     * El backend pagina en base 0: convertir query.page - 1 al llamar y sumar 1 al responder.
     */
    search: async (query: ListingQuery, category: StoreCategory): Promise<ListingResult> => {
      if (USE_LISTING_MOCKS) {
        await delay(300)
        return runListingQuery(getMockCatalog(), collectCategoryIds(category), query)
      }

      return publicFetch<ListingResult>('/products/search', {
        query: {
          categoryId: query.categoryId,
          [LISTING_QUERY_KEYS.sizes]: query.sizes.join(',') || undefined,
          [LISTING_QUERY_KEYS.colors]: query.colors.join(',') || undefined,
          [LISTING_QUERY_KEYS.price]: query.price ?? undefined,
          [LISTING_QUERY_KEYS.onSale]: query.onSale || undefined,
          sort: query.sort,
          page: query.page - 1,
          size: query.pageSize,
        },
      })
    },
  }
}
