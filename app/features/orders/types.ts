// Contrato con /api/v1/orders, /payments y /shipments (ver ORDENES-DETALLE-Y-GESTION).

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface ShippingAddress {
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

export interface OrderItem {
  id: string
  variantId: string
  sku: string
  productName: string
  colorName: string
  sizeName: string
  imageUrl: string | null
  quantity: number
  unitPrice: number
  /** unitPrice * quantity */
  subtotal: number
  taxRate: number
  /** IVA de la linea, ya con descuento. */
  taxAmount: number
}

/** OrderResponse: mismo objeto en todos los endpoints de orden. */
export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  /** Tipo de entrega: no inferirlo de shippingAddress. */
  pickup: boolean

  /** null en invitado. */
  userId: string | null
  guestEmail: string | null
  guestName: string | null
  guestPhone: string | null

  shippingAddress: ShippingAddress | null
  shippingConfigId: string | null
  shippingConfigName: string | null

  pickupLocationId: string | null
  pickupLocationName: string | null
  /** Se genera al marcar READY_FOR_PICKUP. */
  pickupCode: string | null

  /** Suma de lineas, antes de descuento. */
  subtotal: number
  discountAmount: number
  shippingCost: number
  taxRate: number
  /** IVA contenido en el total: informativo, no se suma. */
  taxAmount: number
  /** subtotal - descuento + envio */
  total: number

  couponId: string | null
  couponCode: string | null

  /** Nota del cliente. */
  notes: string | null
  /** Nota interna; al cancelar queda aqui el motivo. */
  adminNotes: string | null

  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'PARTIALLY_REFUNDED' | 'REFUNDED'

export interface Payment {
  id: string
  orderId: string
  orderNumber: string
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  refundedAmount: number
  currency: string
  stripePaymentIntentId: string | null
  attemptCount: number
  failureMessage: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export type RefundReason = 'requested_by_customer' | 'duplicate' | 'fraudulent'

export type ShipmentStatus = 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RETURNED'

export interface Shipment {
  id: string
  orderId: string
  orderNumber: string
  carrier: string
  trackingNumber: string
  trackingUrl: string | null
  status: ShipmentStatus
  shippedAt: string | null
  /** yyyy-MM-dd */
  estimatedDeliveryAt: string | null
  deliveredAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderFilters {
  status: OrderStatus | ''
  orderNumber: string
  userId: string
  /** yyyy-MM-dd */
  dateFrom: string
  /** yyyy-MM-dd, inclusivo */
  dateTo: string
}

export interface OrderStatusRequest {
  status: OrderStatus
  adminNotes?: string
}

export interface ShipmentCreateRequest {
  orderId: string
  carrier: string
  trackingNumber: string
  trackingUrl?: string
  estimatedDeliveryAt?: string
  notes?: string
}

export interface ShipmentStatusRequest {
  status: ShipmentStatus
  notes?: string
}

export interface RefundRequest {
  /** Omitir = todo lo pendiente. */
  amount?: number
  reason: RefundReason
}

/** Acciones del detalle; cada una abre su modal. */
export type OrderAction =
  | 'process'
  | 'ship'
  | 'shipment-status'
  | 'ready'
  | 'collected'
  | 'confirm-payment'
  | 'fail-payment'
  | 'refund'
  | 'cancel'
  | 'notes'
