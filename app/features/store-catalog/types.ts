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
}

/**
 * Nodo del arbol publico de categorias (deriva de CategoryNode de GET /categories/tree).
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
