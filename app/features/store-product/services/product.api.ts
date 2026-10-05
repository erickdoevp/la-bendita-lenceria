import type { PublicFetch, StoreProduct } from '~/features/store-catalog'
import { RELATED_LIMIT, REVIEWS_PAGE_SIZE, USE_PRODUCT_MOCKS } from '../constants'
import { findMockProduct, findMockRelated } from '../mocks/product-detail.mock'
import type { ReviewsPage, StoreProductDetail } from '../types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Endpoints publicos del detalle.
 * TODO al integrar:
 * - GET /products/slug/{slug} -> mapear ProductDetailResponseDto (variants, images por colorId)
 * - GET /reviews/product/{id}?page=&size= (Spring pagina en base 0)
 * - GET /products/{id}/related o reutilizar /products/search por categoria
 */
export function createProductApi(publicFetch: PublicFetch) {
  return {
    /** null cuando no existe o no esta publicado (la pagina responde 404). */
    bySlug: async (slug: string): Promise<StoreProductDetail | null> => {
      if (USE_PRODUCT_MOCKS) {
        await delay(200)
        const bundle = findMockProduct(slug)
        return bundle ? structuredClone(bundle.detail) : null
      }
      try {
        return await publicFetch<StoreProductDetail>(`/products/slug/${encodeURIComponent(slug)}`)
      }
      catch (error) {
        if (parseApiError(error).status === 404) return null
        throw error
      }
    },

    related: async (productId: string, limit = RELATED_LIMIT): Promise<StoreProduct[]> => {
      if (USE_PRODUCT_MOCKS) {
        await delay(250)
        return findMockRelated(productId, limit)
      }
      return publicFetch<StoreProduct[]>(`/products/${productId}/related`, { query: { size: limit } })
    },

    /** Resenas aprobadas, mas recientes primero. `page` en base 1. */
    reviews: async (productId: string, slug: string, page: number, size = REVIEWS_PAGE_SIZE): Promise<ReviewsPage> => {
      if (USE_PRODUCT_MOCKS) {
        await delay(250)
        const all = findMockProduct(slug)?.reviews ?? []
        const totalPages = Math.max(1, Math.ceil(all.length / size))
        return {
          items: all.slice((page - 1) * size, page * size),
          page,
          totalPages,
          totalItems: all.length,
        }
      }
      const raw = await publicFetch<RawPage<ReviewsPage['items'][number]>>(`/reviews/product/${productId}`, {
        query: { page: page - 1, size },
      })
      const result = toPage(raw)
      return { items: result.items, page: result.page + 1, totalPages: result.totalPages, totalItems: result.totalElements }
    },
  }
}
