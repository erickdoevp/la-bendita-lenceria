// Contrato con /api/v1/reviews (ver RESENAS.txt).

/** ReviewResponse. */
export interface Review {
  id: string
  productId: string
  productName: string
  productSlug: string
  productImageUrl: string | null
  userId: string
  /** Nombre de usuario, no el correo. */
  username: string
  /** Entero 1..5 */
  rating: number
  title: string | null
  body: string | null
  /** Se calcula solo al crear: tenia una orden DELIVERED con el producto. */
  verifiedPurchase: boolean
  approved: boolean
  createdAt: string
  updatedAt: string
}

export interface ReviewStats {
  productId: string
  /** Sin redondear; 0 si no hay resenas aprobadas. */
  averageRating: number
  reviewCount: number
  /** Siempre trae las claves "5" a "1". */
  ratingDistribution: Record<string, number>
}

export type BooleanFilter = '' | 'true' | 'false'

export type ReviewSort = 'recent' | 'lowest' | 'highest'

export interface ReviewFilters {
  approved: BooleanFilter
  /** "1".."5" o vacio */
  rating: string
  verifiedPurchase: BooleanFilter
  productId: string
  sort: ReviewSort
}

export type ModerationTab = 'pending' | 'all'
