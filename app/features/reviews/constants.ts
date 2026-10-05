import type { ReviewFilters, ReviewSort } from './types'

export const REVIEW_ROUTES = {
  moderation: '/admin/reviews',
} as const

/** Varios "sort" se mandan como parametros repetidos (?sort=rating,asc&sort=createdAt,desc). */
export const REVIEW_SORTS: Record<ReviewSort, { label: string, value: string[] }> = {
  recent: { label: 'Más recientes', value: ['createdAt,desc'] },
  lowest: { label: 'Peor valoradas', value: ['rating,asc', 'createdAt,desc'] },
  highest: { label: 'Mejor valoradas', value: ['rating,desc', 'createdAt,desc'] },
}

export function emptyReviewFilters(): ReviewFilters {
  return { approved: '', rating: '', verifiedPurchase: '', productId: '', sort: 'recent' }
}
