// Contrato del listado publico de productos por categoria.
import type { StoreColor, StoreProduct } from '~/features/store-catalog'

export type ListingSort = 'relevance' | 'newest' | 'price-asc' | 'price-desc' | 'best-selling'

/** Clave de un rango de precio predefinido (ver PRICE_RANGES). */
export type PriceRangeKey = 'hasta-500' | '500-900' | '900-1300' | 'desde-1300'

/** Filtros que viven en la URL (?talla=S,M&color=negro&precio=500-900&oferta=1&orden=newest&pagina=2). */
export interface ListingFilters {
  sizes: string[]
  colors: string[]
  price: PriceRangeKey | null
  onSale: boolean
}

export interface ListingQuery extends ListingFilters {
  /** Categoria actual: el listado incluye sus descendientes. */
  categoryId: string
  sort: ListingSort
  /** Base 1, como se muestra en la URL. */
  page: number
  pageSize: number
}

export interface FacetOption {
  value: string
  label: string
  /** Productos que quedarian si se activa esta opcion junto con los demas filtros. */
  count: number
}

export interface ColorFacetOption extends FacetOption {
  hex: string
}

/** Opciones disponibles en la categoria actual, con conteos. */
export interface ListingFacets {
  sizes: FacetOption[]
  colors: ColorFacetOption[]
  prices: FacetOption[]
  onSaleCount: number
}

export interface ListingResult {
  products: StoreProduct[]
  /** Base 1. */
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  facets: ListingFacets
}

export type { StoreColor, StoreProduct }
