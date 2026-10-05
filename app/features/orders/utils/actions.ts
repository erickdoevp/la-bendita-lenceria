import { STATUS_TRANSITIONS } from '../constants'
import type { Order, OrderAction, OrderStatus, Payment, Shipment } from '../types'

export interface OrderContext {
  order: Order
  payment: Payment | null
  shipment: Shipment | null
}

/** Estados desde los que se surte: crear envio o marcar lista para recoger. */
const FULFILLABLE: OrderStatus[] = ['CONFIRMED', 'PROCESSING']

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return STATUS_TRANSITIONS[from].includes(to)
}

export function refundableAmount(payment: Payment | null) {
  if (!payment || (payment.status !== 'PAID' && payment.status !== 'PARTIALLY_REFUNDED')) return 0
  return Math.max(0, Math.round((payment.amount - payment.refundedAmount) * 100) / 100)
}

/** Pago que el admin confirma a mano: transferencia o contra entrega todavia pendiente. */
export function isManualPaymentPending(payment: Payment | null) {
  return Boolean(payment && payment.method !== 'CARD' && payment.status === 'PENDING')
}

/**
 * Acciones disponibles, derivadas de la tabla de transiciones (6.2) y de los
 * botones sugeridos por estado. Nunca un <select> libre con todos los estados.
 */
export function orderActions({ order, payment, shipment }: OrderContext): OrderAction[] {
  const { status, pickup } = order
  const actions: OrderAction[] = []

  if (status === 'PENDING_PAYMENT' && isManualPaymentPending(payment)) {
    actions.push('confirm-payment')
  }
  if (canTransition(status, 'PROCESSING')) actions.push('process')
  if (FULFILLABLE.includes(status)) {
    if (pickup) actions.push('ready')
    else if (!shipment) actions.push('ship')
  }
  if (status === 'READY_FOR_PICKUP') actions.push('collected')
  if (shipment && status === 'SHIPPED') actions.push('shipment-status')

  // El reembolso pasa por el pago: devuelve el dinero en Stripe y el stock
  if (status !== 'PENDING_PAYMENT' && refundableAmount(payment) > 0) actions.push('refund')
  if (canTransition(status, 'CANCELLED')) actions.push('cancel')
  if (status === 'PENDING_PAYMENT' && isManualPaymentPending(payment)) actions.push('fail-payment')

  actions.push('notes')
  return actions
}

/** Acciones destructivas: van separadas y piden confirmacion. */
export const DANGER_ACTIONS: OrderAction[] = ['refund', 'cancel', 'fail-payment']
