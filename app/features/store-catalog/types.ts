// Modelos de la tienda publica. Se derivan de los DTOs del backend
// (ProductDetail, CollectionProduct, CategoryNode) al integrar los servicios.

export interface StoreColor {
  name: string
  hex: string
}

/** Resumen de producto para tarjetas y carruseles. */
export interface StoreProduct {
  id: string
  name: string
  slug: string
  /** Precio final en MXN. */
  price: number
  /** Precio anterior si esta en oferta. */
  compareAtPrice: number | null
  categoryName: string
  imageUrl: string | null
  /** Segunda foto que aparece al pasar el cursor. */
  hoverImageUrl: string | null
  colors: StoreColor[]
  isNew: boolean
  /** null = sin resenas. */
  averageRating?: number | null
  reviewCount?: number
}

/** Producto publicado tal cual llega en los listados publicos (GET /products). */
export interface ProductSummaryDto {
  id: string
  name: string
  slug: string
  /** Precio final con IVA incluido: se muestra tal cual. */
  basePrice: number
  category: { id: string, name: string, slug: string }
  /** null = IVA global. Solo informativo: el desglose sale en la orden (taxAmount). */
  taxConfigId: string | null
  taxName: string | null
  taxRate: number | null
  primaryImageUrl: string | null
  averageRating: number | null
  reviewCount: number
  status: 'PUBLISHED'
  /** ISO local sin zona: hora del servidor. */
  publishedAt: string
}

/** Nodo tal cual lo devuelve GET /categories/tree (raices con hijas anidadas). */
export interface CategoryTreeDto {
  id: string
  name: string
  slug: string
  /** Documento TipTap o null. */
  description: unknown
  imageUrl: string | null
  active: boolean
  children: CategoryTreeDto[]
  createdAt: string
  updatedAt: string
}

/**
 * Nodo del arbol publico de categorias (deriva de CategoryTreeDto de GET /categories/tree).
 * Raiz (Lenceria) -> subcategoria (Brasieres) -> tipo (Push up): maximo 3 niveles.
 */
export interface StoreCategory {
  id: string
  name: string
  slug: string
  /** Texto plano para la cabecera del listado. */
  summary: string | null
  imageUrl: string | null
  children: StoreCategory[]
}

/** Categoria resuelta desde la URL, con su camino desde la raiz. */
export interface ResolvedCategory {
  category: StoreCategory
  /** [raiz, ..., categoria actual] */
  trail: StoreCategory[]
  /** Ruta publica: /lenceria/brasieres/push-up */
  path: string
}
