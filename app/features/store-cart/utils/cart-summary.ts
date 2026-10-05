import { FREE_SHIPPING_THRESHOLD } from '../constants'
import type { CartLine, CartSummary } from '../types'

/** Totales de la bolsa. El envio y los cupones se calculan al pagar. */
export function summarizeCart(lines: CartLine[]): CartSummary {
  let itemCount = 0
  let subtotal = 0
  let savings = 0
  for (const line of lines) {
    itemCount += line.quantity
    subtotal += line.unitPrice * line.quantity
    if (line.compareAtPrice && line.compareAtPrice > line.unitPrice) {
      savings += (line.compareAtPrice - line.unitPrice) * line.quantity
    }
  }
  return {
    itemCount,
    subtotal,
    savings,
    remainingForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    freeShippingProgress: Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD),
  }
}

export const piecesLabel = (count: number) => `${count} ${count === 1 ? 'pieza' : 'piezas'}`
