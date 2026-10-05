import type { useAuthFetch } from '~/features/auth'
import type { Review, ReviewStats } from '../types'

type AuthFetch = ReturnType<typeof useAuthFetch>

export interface ReviewListQuery {
  approved?: string
  productId?: string
  rating?: string
  verifiedPurchase?: string
  page?: number
  size?: number
  sort?: string | string[]
}

/** Quita filtros vacios: un "rating=" invalido responde 400. */
function cleanQuery(query: object) {
  return Object.fromEntries(Object.entries(query).filter(([, v]) => v !== '' && v != null))
}

export function createReviewsApi(authFetch: AuthFetch) {
  return {
    // Cola de moderacion: las mas viejas primero (default del backend)
    pending: (query: { page?: number, size?: number }) =>
      authFetch<RawPage<Review>>('/reviews/pending', { query }).then(toPage),
    list: (query: ReviewListQuery) =>
      authFetch<RawPage<Review>>('/reviews/admin', { query: cleanQuery(query) }).then(toPage),
    // Publico: solo cuenta resenas aprobadas
    stats: (productId: string) => authFetch<ReviewStats>(`/reviews/product/${productId}/stats`),
    approve: (reviewId: string) =>
      authFetch<Review>(`/reviews/${reviewId}/approve`, { method: 'PATCH' }),
    // Rechazar = borrar: no hay rechazo sin borrar
    remove: (reviewId: string) => authFetch<null>(`/reviews/${reviewId}`, { method: 'DELETE' }),
  }
}
