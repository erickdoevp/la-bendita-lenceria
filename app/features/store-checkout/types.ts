// Contrato del checkout (ver FLUJO-CHECKOUT-Y-PAGOS). La orden es el mismo
// OrderResponseDto del panel; el pago agrega el clientSecret de Stripe.
import type { Order } from '~/features/orders'

export type { Order }

export type DeliveryMode = 'shipping' | 'pickup'

export type CheckoutPaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY'

/** PaymentStatus visto desde el checkout (seccion 11). */
export type CheckoutPaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'

/** GET /public/payments/config */
export interface PaymentsConfig {
  publishableKey: string
  currency: string
  country: string
}

/** GET /shipping/options?subtotalAfterDiscount= */
export interface ShippingOption {
  id: string
  name: string
  /** Ya resuelto para este pedido; el backend lo recalcula al crear la orden. */
  cost: number
  free: boolean
  freeFrom: number | null
  estimatedDaysMin: number
  estimatedDaysMax: number
}

/** GET /store-locations (solo activas). */
export interface StoreLocation {
  id: string
  name: string
  address: string
  phone: string | null
  schedule: string | null
}

/** Direccion en linea: la del invitado o la copia que guarda la orden. */
export interface CheckoutAddress {
  recipientName: string
  phone: string
  street: string
  exteriorNumber: string
  interiorNumber: string | null
  colonia: string
  cp: string
  municipio: string
  estado: string
}

/** POST /orders (con sesion). */
export interface CustomerOrderRequest {
  pickup: boolean
  shippingAddressId?: string
  shippingConfigId?: string
  pickupLocationId?: string
  couponCode: string | null
  notes: string | null
}

/** POST /public/orders (invitada): sin cupones, direccion en linea. */
export interface GuestOrderRequest {
  guestToken: string
  email: string
  name: string
  phone: string
  pickup: boolean
  shippingAddress?: CheckoutAddress
  shippingConfigId?: string
  pickupLocationId?: string
  notes: string | null
  turnstileToken: string
}

/** POST /public/orders responde la orden mas su credencial de un solo uso. */
export interface GuestOrderResponse extends Order {
  accessToken: string
}

/** PaymentResponseDto de POST/GET /payments/order/{id}. */
export interface CheckoutPayment {
  id: string
  orderId: string
  orderNumber: string
  method: CheckoutPaymentMethod
  status: CheckoutPaymentStatus
  amount: number
  currency: string
  stripePaymentIntentId: string | null
  /** Solo con CARD; se pide en cada montaje, no se guarda. */
  stripeClientSecret: string | null
  attemptCount: number
  failureMessage: string | null
  paidAt: string | null
}

/**
 * Como se consulta una orden ya creada: la clienta con su orderId,
 * la invitada con el accessToken que solo llega al crearla.
 */
export type OrderAccess =
  | { kind: 'customer', orderId: string }
  | { kind: 'guest', orderId: string, accessToken: string }

/** Vista previa del cupon antes de crear la orden. */
export interface CouponPreview {
  code: string
  /** null = el backend aun no puede calcularlo; se ve al crear la orden. */
  discountAmount: number | null
  description: string | null
}

/** Totales que se muestran antes de crear la orden (el backend recalcula todo). */
export interface CheckoutTotals {
  subtotal: number
  discount: number
  /** null = falta elegir envio. */
  shipping: number | null
  total: number
  /** IVA contenido en el total: informativo, no se suma. */
  tax: number
}
