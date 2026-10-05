import type { CheckoutPaymentMethod } from './types'

/** Mientras no se conecte el backend, ordenes, pagos y opciones de envio son de ejemplo. */
export const USE_CHECKOUT_MOCKS = true

/** IVA incluido en los precios; solo para desglosarlo. */
export const TAX_RATE = 0.16

/** Polling tras confirmar el pago: cada 2 s, ~1 min (seccion 8). */
export const PAYMENT_POLL_INTERVAL_MS = 2000
export const PAYMENT_POLL_MAX_ATTEMPTS = 30

/**
 * Ventana para pagar con tarjeta antes de que la orden expire (seccion 10).
 * TODO: el backend aun no expone expiresAt; se calcula createdAt + estos minutos.
 */
export const PAYMENT_WINDOW_MINUTES = { customer: 30, guest: 15 } as const

/** Orden en curso de esta pestana, para retomarla al recargar o al volver de 3D Secure. */
export const ACTIVE_ORDER_KEY = 'lb-checkout-active-order'

/** accessToken de los pedidos de invitada: llega una sola vez y no se puede recuperar. */
export const GUEST_ORDERS_KEY = 'lb-guest-orders'

export const PAYMENT_METHODS: Record<CheckoutPaymentMethod, { label: string, description: string, icon: string }> = {
  CARD: {
    label: 'Tarjeta de crédito o débito',
    description: 'Visa, Mastercard y American Express.',
    icon: 'ph:credit-card-bold',
  },
  BANK_TRANSFER: {
    label: 'Transferencia bancaria',
    description: 'Te damos los datos al confirmar. Enviamos cuando se refleje el pago.',
    icon: 'ph:bank-bold',
  },
  CASH_ON_DELIVERY: {
    label: 'Efectivo al recibir',
    description: 'Pagas al momento de la entrega.',
    icon: 'ph:money-bold',
  },
}

/** La invitada solo puede pagar con tarjeta (seccion 14.3). */
export const GUEST_PAYMENT_METHODS: CheckoutPaymentMethod[] = ['CARD']
export const CUSTOMER_PAYMENT_METHODS: CheckoutPaymentMethod[] = ['CARD', 'BANK_TRANSFER', 'CASH_ON_DELIVERY']

/** Mensajes 422 que significan que el carrito cambio (seccion 12). */
export const CART_CONFLICT_PATTERN = /stock insuficiente|carrito está vacío/i
