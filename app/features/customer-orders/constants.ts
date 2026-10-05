/**
 * Pantalla de pago del checkout (FLUJO-CHECKOUT-Y-PAGOS, seccion 6).
 * TODO(checkout): ajustar cuando exista la ruta; POST /payments/order/{id} es seguro repetirlo.
 */
export const CHECKOUT_PAYMENT_ROUTE = (orderId: string) => `/checkout/pago/${orderId}`

export const ORDERS_PAGE_SIZE = 10
