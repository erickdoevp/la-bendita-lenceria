/** Mientras no exista el endpoint del carrito, la bolsa vive en localStorage con datos de ejemplo. */
export const USE_CART_MOCKS = true

/** Donde se guarda la bolsa de ejemplo; no se usa con el backend real. */
export const CART_MOCK_STORAGE_KEY = 'lb-cart-mock'

// TODO: confirmar con la politica real (mismo valor que el anuncio de la tienda)
export const FREE_SHIPPING_THRESHOLD = 999

/** Tope por linea aunque haya mas stock. */
export const MAX_LINE_QUANTITY = 10

/** Con este stock o menos se avisa en la linea que quedan pocas piezas. */
export const CART_LOW_STOCK_THRESHOLD = 3

/** Tiempo para deshacer al quitar una pieza. */
export const UNDO_REMOVE_MS = 6000
