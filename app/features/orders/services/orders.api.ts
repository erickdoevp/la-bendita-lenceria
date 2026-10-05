import type { useAuthFetch } from '~/features/auth'
import type {
  Order,
  OrderFilters,
  OrderStatusRequest,
  Payment,
  RefundRequest,
  Shipment,
  ShipmentCreateRequest,
  ShipmentStatusRequest,
} from '../types'

type AuthFetch = ReturnType<typeof useAuthFetch>

export type OrderListQuery = Partial<OrderFilters> & {
  page?: number
  size?: number
  sort?: string
}

/** Quita filtros vacios para no mandar "status=" al backend. */
function cleanQuery(query: object) {
  return Object.fromEntries(Object.entries(query).filter(([, v]) => v !== '' && v != null))
}

/** 404 es un estado normal (sin pago iniciado, sin envio): se devuelve null. */
async function orNull<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request
  }
  catch (error) {
    if (parseApiError(error).status === 404) return null
    throw error
  }
}

export function createOrdersApi(authFetch: AuthFetch) {
  return {
    // Ordenes
    list: (query: OrderListQuery) =>
      authFetch<RawPage<Order>>('/orders', { query: cleanQuery(query) }).then(toPage),
    get: (orderId: string) => authFetch<Order>(`/orders/${orderId}`),
    updateStatus: (orderId: string, body: OrderStatusRequest) =>
      authFetch<Order>(`/orders/${orderId}/status`, { method: 'PATCH', body }),

    // Pago
    payment: (orderId: string) => orNull(authFetch<Payment>(`/payments/admin/order/${orderId}`)),
    confirmPayment: (paymentId: string) =>
      authFetch<Payment>(`/payments/${paymentId}/confirm`, { method: 'PATCH' }),
    failPayment: (paymentId: string) =>
      authFetch<Payment>(`/payments/${paymentId}/fail`, { method: 'PATCH' }),
    refundPayment: (paymentId: string, body: RefundRequest) =>
      authFetch<Payment>(`/payments/${paymentId}/refund`, { method: 'PATCH', body }),

    // Envio a domicilio
    shipment: (orderId: string) => orNull(authFetch<Shipment>(`/shipments/order/${orderId}`)),
    createShipment: (body: ShipmentCreateRequest) =>
      authFetch<Shipment>('/shipments', { method: 'POST', body }),
    updateShipmentStatus: (shipmentId: string, body: ShipmentStatusRequest) =>
      authFetch<Shipment>(`/shipments/${shipmentId}/status`, { method: 'PATCH', body }),

    // Recogida en tienda (204 sin body)
    markReadyForPickup: (orderId: string) =>
      authFetch<null>(`/shipments/pickup/${orderId}/ready`, { method: 'PATCH' }),
    markCollected: (orderId: string) =>
      authFetch<null>(`/shipments/pickup/${orderId}/collected`, { method: 'PATCH' }),
  }
}
