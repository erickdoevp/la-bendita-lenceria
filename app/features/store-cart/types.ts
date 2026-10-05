// Contrato del carrito de la tienda. Se derivara de CartResponseDto al integrar
// (GET /cart, con token de invitado o sesion de la clienta).

/** Una variante (talla + color) dentro de la bolsa. */
export interface CartLine {
  /** Id de la linea en el carrito, no de la variante. */
  id: string
  variantId: string
  productId: string
  slug: string
  name: string
  imageUrl: string | null
  colorName: string | null
  colorHex: string | null
  size: string
  /** Precio unitario final en MXN. */
  unitPrice: number
  /** Precio anterior si la variante esta en oferta. */
  compareAtPrice: number | null
  quantity: number
  /** Unidades disponibles; limita la cantidad que se puede pedir. */
  stock: number
}

export interface Cart {
  id: string
  lines: CartLine[]
}

/**
 * Lo que manda la pagina de producto al agregar. El backend solo necesita
 * variantId y quantity; el resto es la foto de la linea para mostrarla al instante
 * (y para que los datos de ejemplo funcionen sin servidor).
 */
export interface AddToCartInput {
  variantId: string
  quantity: number
  line: Omit<CartLine, 'id' | 'variantId' | 'quantity'>
}

export interface CartSummary {
  itemCount: number
  subtotal: number
  /** Diferencia contra el precio anterior de las piezas en oferta. */
  savings: number
  /** Cuanto falta para el envio gratis; 0 si ya se alcanzo. */
  remainingForFreeShipping: number
  /** 0 a 1, para la barra de progreso. */
  freeShippingProgress: number
}
