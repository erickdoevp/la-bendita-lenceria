import type { CategoryRef, Color, Size } from '~/features/catalog'
import type { RichTextDoc } from '~/utils/rich-text'

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

/** Variante en edicion: una combinacion unica talla + color. */
export interface VariantDraft {
  /** `${colorId}:${sizeId}` */
  key: string
  sizeId: string
  colorId: string
  sku: string
  priceAdjustment: number | string
  costPrice: number | string
  initialStock: number | string
  image: File | null
}

export interface VariantCreateRequest {
  sizeId: string
  colorId: string
  sku: string | null
  priceAdjustment: number
  costPrice: number
  initialStock: number
}

/** Parte "data" del multipart de POST /products. */
export interface ProductCreateRequest {
  name: string
  slug?: string
  description?: RichTextDoc
  basePrice: number
  categoryId: string
  taxConfigId?: string | null
  status: ProductStatus
  variants: VariantCreateRequest[]
}

export interface ProductVariant {
  id: string
  size: Size
  color: Color
  sku: string
  priceAdjustment: number
  costPrice: number
  imageUrl: string | null
  overrideImageUrl: string | null
  active: boolean
  availableStock: number
}

export interface ProductImage {
  id: string
  url: string
  altText: string | null
  position: number
  colorId: string | null
  colorName: string | null
  colorHex: string | null
  isPrimary: boolean
}

/** ProductDetailResponseDto. */
export interface ProductDetail {
  id: string
  name: string
  slug: string
  description: unknown
  basePrice: number
  category: CategoryRef
  taxConfigId: string | null
  taxName: string | null
  taxRate: number | null
  variants: ProductVariant[]
  images: ProductImage[]
  status: ProductStatus
  averageRating: number | null
  reviewCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Fila de GET /products/admin. Variantes e imagenes son opcionales por si el
 * backend responde con un DTO resumido en vez del detalle completo.
 */
export type ProductListItem = Pick<ProductDetail, 'id' | 'name' | 'slug' | 'basePrice' | 'category' | 'status' | 'updatedAt'>
  & Partial<Pick<ProductDetail, 'variants' | 'images'>>
