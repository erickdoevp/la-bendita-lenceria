import type { CustomerFetch } from '~/features/customer-auth'
import type { Order, Payment } from '~/features/orders'

export function createMyOrdersApi(customerFetch: CustomerFetch) {
  return {
    list: (query: { page: number, size: number }) =>
      customerFetch<RawPage<Order>>('/orders/me', { query: { ...query, sort: 'createdAt,desc' } }).then(toPage),
    get: (orderId: string) => customerFetch<Order>(`/orders/me/${orderId}`),
    /** Solo PENDING_PAYMENT; el carrito recupera sus productos. */
    cancel: (orderId: string) => customerFetch<Order>(`/orders/me/${orderId}/cancel`, { method: 'PATCH' }),
    /** 404 = todavia no se inicio el pago: es un estado normal. */
    payment: async (orderId: string): Promise<Payment | null> => {
      try {
        return await customerFetch<Payment>(`/payments/order/${orderId}`)
      }
      catch (error) {
        if (parseApiError(error).status === 404) return null
        throw error
      }
    },
  }
}
