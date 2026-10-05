import type { BadgeProps } from '@nuxt/ui'
import type {
  OrderFilters,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  RefundReason,
  ShipmentStatus,
} from './types'

export const ORDER_ROUTES = {
  list: '/admin/orders',
  detail: (orderId: string) => `/admin/orders/${orderId}`,
} as const

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  CONFIRMED: 'Pagada',
  PROCESSING: 'En preparación',
  SHIPPED: 'Enviada',
  READY_FOR_PICKUP: 'Lista para recoger',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, BadgeProps['color']> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'primary',
  PROCESSING: 'primary',
  SHIPPED: 'neutral',
  READY_FOR_PICKUP: 'neutral',
  DELIVERED: 'success',
  CANCELLED: 'neutral',
  REFUNDED: 'error',
}

/** Pestanas del listado: las de trabajo pendiente primero. */
export const ORDER_TABS: { status: OrderStatus | '', label: string }[] = [
  { status: '', label: 'Todas' },
  { status: 'PENDING_PAYMENT', label: 'Por pagar' },
  { status: 'CONFIRMED', label: 'Por preparar' },
  { status: 'PROCESSING', label: 'En preparación' },
  { status: 'SHIPPED', label: 'En camino' },
  { status: 'READY_FOR_PICKUP', label: 'Para recoger' },
  { status: 'DELIVERED', label: 'Entregadas' },
  { status: 'CANCELLED', label: 'Canceladas' },
  { status: 'REFUNDED', label: 'Reembolsadas' },
]

/**
 * Transiciones que acepta PATCH /orders/{id}/status (seccion 6.2).
 * SHIPPED, READY_FOR_PICKUP, DELIVERED y CONFIRMED tienen su propio endpoint.
 * Mandar el mismo estado siempre se acepta: sirve para editar adminNotes.
 */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['CANCELLED', 'REFUNDED'],
  SHIPPED: ['CANCELLED', 'REFUNDED'],
  READY_FOR_PICKUP: ['CANCELLED', 'REFUNDED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: ['REFUNDED'],
  REFUNDED: [],
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: 'Tarjeta',
  BANK_TRANSFER: 'Transferencia',
  CASH_ON_DELIVERY: 'Contra entrega',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  PARTIALLY_REFUNDED: 'Reembolso parcial',
  REFUNDED: 'Reembolsado',
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, BadgeProps['color']> = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'error',
  PARTIALLY_REFUNDED: 'warning',
  REFUNDED: 'error',
}

export const REFUND_REASON_LABELS: Record<RefundReason, string> = {
  requested_by_customer: 'Lo pidió la clienta',
  duplicate: 'Cobro duplicado',
  fraudulent: 'Fraude',
}

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: 'Por recolectar',
  IN_TRANSIT: 'En tránsito',
  OUT_FOR_DELIVERY: 'En reparto',
  DELIVERED: 'Entregado',
  FAILED: 'Entrega fallida',
  RETURNED: 'Devuelto',
}

export const CARRIER_SUGGESTIONS = ['Estafeta', 'DHL', 'FedEx', 'Paquetexpress', 'Redpack', '99 Minutos', 'Correos de México']

export function emptyOrderFilters(): OrderFilters {
  return { status: '', orderNumber: '', userId: '', dateFrom: '', dateTo: '' }
}
