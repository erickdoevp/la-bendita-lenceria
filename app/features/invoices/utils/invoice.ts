import type { Invoice } from '../types'

/** Estados de orden que se pueden facturar (ya pagadas y no canceladas). */
const INVOICEABLE_ORDER_STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'READY_FOR_PICKUP', 'DELIVERED']

/** PENDING o STAMPED: una orden solo puede tener una factura vigente. */
export function isActiveInvoice(invoice: Pick<Invoice, 'status'>) {
  return invoice.status !== 'CANCELLED'
}

export function canRequestInvoice(orderStatus: string, invoices: Pick<Invoice, 'status'>[]) {
  return INVOICEABLE_ORDER_STATUSES.includes(orderStatus) && !invoices.some(isActiveInvoice)
}
