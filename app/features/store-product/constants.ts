import type { ReviewFit } from './types'

/** Mientras no exista el endpoint publico, el detalle sale del catalogo de ejemplo. */
export const USE_PRODUCT_MOCKS = true

/** Parametros en la URL: el color y la talla elegidos se pueden compartir. */
export const PRODUCT_QUERY_KEYS = {
  color: 'color',
  size: 'talla',
} as const

/** Con este stock o menos se avisa que quedan pocas piezas. */
export const LOW_STOCK_THRESHOLD = 3

export const MAX_QUANTITY = 10

export const REVIEWS_PAGE_SIZE = 4

export const RELATED_LIMIT = 8

export const FIT_LABELS: Record<ReviewFit, string> = {
  small: 'Le quedó chica',
  true: 'Talla exacta',
  large: 'Le quedó grande',
}

// TODO: confirmar con la politica real (mismos valores de ejemplo que el inicio)
export const PRODUCT_SERVICE_NOTES = [
  { icon: 'ph:truck', text: 'Envío gratis en compras desde $999' },
  { icon: 'ph:arrows-clockwise', text: 'Cambio de talla sin costo durante 30 días' },
  { icon: 'ph:package', text: 'Empaque discreto, sin el nombre de la tienda' },
] as const
