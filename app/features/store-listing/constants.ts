import type { ListingSort, PriceRangeKey } from './types'

/** Mientras no exista el endpoint publico, el listado filtra un catalogo de ejemplo. */
export const USE_LISTING_MOCKS = true

export const LISTING_PAGE_SIZE = 12

export const LISTING_DATA_KEY = 'store-listing'

/** Nombres de los parametros en la URL (en espanol porque son visibles). */
export const LISTING_QUERY_KEYS = {
  sizes: 'talla',
  colors: 'color',
  price: 'precio',
  onSale: 'oferta',
  sort: 'orden',
  page: 'pagina',
} as const

export const SORT_OPTIONS: { value: ListingSort, label: string }[] = [
  { value: 'relevance', label: 'Destacados' },
  { value: 'newest', label: 'Lo más nuevo' },
  { value: 'best-selling', label: 'Más vendidos' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
]

export const DEFAULT_SORT: ListingSort = 'relevance'

export const PRICE_RANGES: { value: PriceRangeKey, label: string, min: number, max: number }[] = [
  { value: 'hasta-500', label: 'Hasta $500', min: 0, max: 500 },
  { value: '500-900', label: '$500 a $900', min: 500, max: 900 },
  { value: '900-1300', label: '$900 a $1,300', min: 900, max: 1300 },
  { value: 'desde-1300', label: 'Más de $1,300', min: 1300, max: Number.POSITIVE_INFINITY },
]

/** Orden de las tallas en los filtros: letras primero, luego tallas de brasier. */
export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '32A', '32B', '32C', '34A', '34B', '34C', '34D', '36B', '36C', '36D', '38C', '38D']
