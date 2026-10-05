import { TAX_RATE } from '../constants'
import type { CheckoutTotals, Order } from '../types'

const round = (value: number) => Math.round(value * 100) / 100

/** IVA contenido: los precios ya lo incluyen, solo se desglosa. */
const containedTax = (total: number) => round(total - total / (1 + TAX_RATE))

/** Estimado antes de crear la orden: total = subtotal - descuento + envio (seccion 5.1). */
export function estimateTotals(subtotal: number, discount: number, shipping: number | null): CheckoutTotals {
  const total = round(Math.max(0, subtotal - discount) + (shipping ?? 0))
  return { subtotal, discount, shipping, total, tax: containedTax(total) }
}

/** Con la orden creada, los importes del backend mandan. */
export const orderTotals = (order: Order): CheckoutTotals => ({
  subtotal: order.subtotal,
  discount: order.discountAmount,
  shipping: order.shippingCost,
  total: order.total,
  tax: order.taxAmount,
})

export function deliveryEstimate(min: number, max: number) {
  if (min === max) return min === 1 ? '1 día hábil' : `${min} días hábiles`
  return `${min} a ${max} días hábiles`
}

/** "4242 4242 4242 4242" mientras se escribe. */
export const formatCardNumber = (value: string) => value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')

/** "12 / 28" mientras se escribe. */
export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits
}

/** Algoritmo de Luhn: descarta numeros mal escritos antes de "mandarlos". */
export function isValidCardNumber(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 13) return false
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
  }
  return sum % 10 === 0
}
