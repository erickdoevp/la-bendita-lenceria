// Contrato del detalle publico de producto. Deriva de ProductDetailResponseDto
// (variantes talla x color con stock, imagenes por color) y de las resenas aprobadas.
import type { StoreProduct } from '~/features/store-catalog'

export interface ProductColorOption {
  /** Slug para la URL: "azul-marino". */
  key: string
  name: string
  hex: string
}

export interface ProductGalleryImage {
  id: string
  url: string
  alt: string
  /** null = foto general que aplica a todos los colores. */
  colorKey: string | null
}

/** Una combinacion vendible talla + color. */
export interface ProductVariantOption {
  id: string
  sku: string
  colorKey: string
  size: string
  /** Unidades disponibles (availableStock). */
  stock: number
  /** Precio final de la variante (basePrice + priceAdjustment). */
  price: number
}

export interface ProductRating {
  /** Sin redondear. */
  average: number
  count: number
}

export interface StoreProductDetail {
  id: string
  name: string
  slug: string
  /** Precio base; la variante elegida puede ajustarlo. */
  price: number
  compareAtPrice: number | null
  isNew: boolean
  categoryId: string
  /** Parrafos de la descripcion (texto plano extraido del rich text). */
  description: string[]
  /** Puntos clave que se leen de un vistazo. */
  highlights: string[]
  materials: string
  care: string[]
  colors: ProductColorOption[]
  /** En el orden de la guia de tallas. */
  sizes: string[]
  /** "brasier" usa contorno + copa; "letra" usa XS a XXL. */
  sizeSystem: 'brasier' | 'letra'
  images: ProductGalleryImage[]
  variants: ProductVariantOption[]
  rating: ProductRating | null
}

export type ReviewFit = 'small' | 'true' | 'large'

export interface ProductReview {
  id: string
  /** Nombre corto: "Mariana G." */
  author: string
  rating: number
  title: string | null
  body: string | null
  /** yyyy-MM-dd */
  createdAt: string
  verifiedPurchase: boolean
  sizePurchased: string | null
  fit: ReviewFit | null
}

export interface ReviewsPage {
  items: ProductReview[]
  /** Base 1. */
  page: number
  totalPages: number
  totalItems: number
}

export type { StoreProduct }
