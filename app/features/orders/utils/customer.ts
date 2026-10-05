import type { Order, ShippingAddress } from '../types'

export function isGuest(order: Order) {
  return !order.userId
}

/** OrderResponse no trae el nombre del cliente registrado: se usa el destinatario. */
export function customerName(order: Order) {
  if (isGuest(order)) return order.guestName ?? order.guestEmail ?? 'Invitado'
  return order.shippingAddress?.recipientName ?? 'Cliente registrado'
}

export function addressLines(address: ShippingAddress) {
  const number = address.interiorNumber
    ? `${address.exteriorNumber} int. ${address.interiorNumber}`
    : address.exteriorNumber
  return [
    `${address.street} ${number}`,
    `Col. ${address.colonia}, C.P. ${address.cp}`,
    `${address.municipio}, ${address.estado}`,
  ]
}

export function itemsCount(order: Order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}
