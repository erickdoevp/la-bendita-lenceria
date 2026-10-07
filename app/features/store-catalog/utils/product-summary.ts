import { NEW_PRODUCT_DAYS } from '../constants'
import type { ProductSummaryDto, StoreProduct } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * publishedAt no trae zona; se lee como hora local. Para una ventana de dias
 * la diferencia de husos no importa.
 */
function isRecent(publishedAt: string, now = Date.now()) {
  const published = new Date(publishedAt).getTime()
  return Number.isFinite(published) && now - published < NEW_PRODUCT_DAYS * DAY_MS
}

/** ProductSummaryDto -> StoreProduct. El resumen no trae colores, oferta ni segunda foto. */
export function toStoreProduct(dto: ProductSummaryDto): StoreProduct {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    // basePrice ya incluye IVA
    price: dto.basePrice,
    compareAtPrice: null,
    categoryName: dto.category?.name ?? '',
    imageUrl: dto.primaryImageUrl ?? null,
    hoverImageUrl: null,
    colors: [],
    isNew: isRecent(dto.publishedAt),
    averageRating: dto.averageRating,
    reviewCount: dto.reviewCount ?? 0,
  }
}
