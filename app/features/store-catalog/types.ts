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
