/**
 * Pantalla de pago del checkout (FLUJO-CHECKOUT-Y-PAGOS, seccion 6): retoma la orden
 * pendiente; POST /payments/order/{id} es seguro repetirlo.
 */
export const CHECKOUT_PAYMENT_ROUTE = (orderId: string) => `/pagar?pedido=${encodeURIComponent(orderId)}`

export const ORDERS_PAGE_SIZE = 10
