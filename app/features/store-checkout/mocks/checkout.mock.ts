// Backend de ejemplo del checkout: ordenes y pagos en localStorage para que el flujo
// completo (crear orden, pagar, reintentar, expirar) se pueda probar sin servidor.
// Las reglas imitan FLUJO-CHECKOUT-Y-PAGOS; los mensajes de error son los del backend.
import type { CartLine } from '~/features/store-cart'
import { PAYMENT_WINDOW_MINUTES, TAX_RATE } from '../constants'
import type {
  CheckoutAddress,
  CheckoutPayment,
  CheckoutPaymentMethod,
  CouponPreview,
  Order,
  OrderAccess,
  PaymentsConfig,
  ShippingOption,
  StoreLocation,
} from '../types'

const STORAGE_KEY = 'lb-checkout-mock'

/** Tarjetas de prueba de Stripe que entiende el mock (mismos numeros que en modo test). */
export const MOCK_TEST_CARDS = [
  { number: '4242 4242 4242 4242', result: 'Pago aprobado' },
  { number: '4000 0000 0000 3220', result: 'Pide verificación y tarda en confirmarse' },
  { number: '4000 0000 0000 0002', result: 'Tarjeta rechazada' },
  { number: '4000 0000 0000 9995', result: 'Fondos insuficientes' },
] as const

const CARD_OUTCOMES: Record<string, { status: 'PAID' | 'PROCESSING' | 'FAILED', message?: string }> = {
  '4242424242424242': { status: 'PAID' },
  '4000000000003220': { status: 'PROCESSING' },
  '4000000000000002': { status: 'FAILED', message: 'Tu tarjeta fue rechazada. Prueba con otra tarjeta o contacta a tu banco.' },
  '4000000000009995': { status: 'FAILED', message: 'Tu tarjeta no tiene fondos suficientes.' },
}

// TODO: valores de ejemplo; los reales salen de GET /shipping/options
const SHIPPING_FREE_FROM = 999
const SHIPPING_RATES = [
  { id: 'ship-standard', name: 'Estándar', cost: 99, freeFrom: SHIPPING_FREE_FROM, min: 3, max: 6 },
  { id: 'ship-express', name: 'Express', cost: 189, freeFrom: null, min: 1, max: 2 },
]

// TODO: sucursales de ejemplo; las reales salen de GET /store-locations
const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: 'loc-centro',
    name: 'Sucursal Centro',
    address: 'Av. Juárez 128, Col. Centro, 44100 Guadalajara, Jal.',
    phone: '33 3614 2280',
    schedule: 'Lunes a sábado de 10:00 a 20:00',
  },
  {
    id: 'loc-providencia',
    name: 'Sucursal Providencia',
    address: 'Av. Pablo Neruda 2915, Col. Providencia, 44630 Guadalajara, Jal.',
    phone: '33 3641 0917',
    schedule: 'Lunes a domingo de 11:00 a 21:00',
  },
]

// TODO: no existe endpoint para validar cupones antes de crear la orden
const COUPONS: Record<string, { type: 'PERCENTAGE' | 'FIXED', value: number, max?: number, minOrder?: number, description: string }> = {
  BIENVENIDA10: { type: 'PERCENTAGE', value: 10, max: 300, description: '10 % de descuento, hasta $300' },
  BENDITA150: { type: 'FIXED', value: 150, minOrder: 1200, description: '$150 de descuento en compras desde $1,200' },
}

interface MockPaymentRecord extends CheckoutPayment {
  /** Resultado que "manda el webhook" en la siguiente consulta. */
  outcome: { status: 'PAID' | 'PROCESSING' | 'FAILED', message?: string } | null
  polls: number
}

interface MockOrderRecord extends Order {
  accessToken: string | null
  paymentMethod: CheckoutPaymentMethod | null
}

interface MockDb {
  sequence: number
  orders: Record<string, MockOrderRecord>
  payments: Record<string, MockPaymentRecord>
}

function read(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as MockDb
  }
  catch {
    // Datos corruptos: se arranca de cero
  }
  return { sequence: 42, orders: {}, payments: {} }
}

function write(db: MockDb) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  }
  catch {
    // Sin almacenamiento el mock solo dura lo que dure la pagina
  }
}

/** Error con la forma que lee parseApiError: { statusCode, data: { message } }. */
function apiError(status: number, message: string) {
  return Object.assign(new Error(message), { statusCode: status, data: { message } })
}

const round = (value: number) => Math.round(value * 100) / 100
/** LocalDateTime como el backend: hora local, sin zona. */
function now() {
  const date = new Date()
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 19)
}
const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function couponDiscount(code: string, subtotal: number) {
  const coupon = COUPONS[code]
  if (!coupon) throw apiError(400, 'Este cupón no existe o ya venció.')
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    throw apiError(400, `Este cupón aplica en compras desde ${formatMoney(coupon.minOrder)}.`)
  }
  const raw = coupon.type === 'PERCENTAGE' ? subtotal * coupon.value / 100 : coupon.value
  return { discount: round(Math.min(raw, coupon.max ?? raw, subtotal)), description: coupon.description }
}

function findOrder(db: MockDb, access: OrderAccess) {
  const order = db.orders[access.orderId]
  if (!order || (access.kind === 'guest' && order.accessToken !== access.accessToken)) {
    throw apiError(404, 'No encontramos este pedido.')
  }
  return order
}

/** La orden con tarjeta sin pagar se cancela sola al vencer la ventana (seccion 10). */
function expireIfNeeded(db: MockDb, order: MockOrderRecord) {
  if (order.status !== 'PENDING_PAYMENT' || order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'CASH_ON_DELIVERY') return
  const payment = db.payments[order.id]
  if (payment?.status === 'PROCESSING') return
  const minutes = order.userId ? PAYMENT_WINDOW_MINUTES.customer : PAYMENT_WINDOW_MINUTES.guest
  if (Date.now() < new Date(order.createdAt).getTime() + minutes * 60_000) return
  cancel(db, order, 'Expiró la ventana de pago.')
}

function cancel(db: MockDb, order: MockOrderRecord, reason: string) {
  order.status = 'CANCELLED'
  order.adminNotes = reason
  order.updatedAt = now()
  const payment = db.payments[order.id]
  if (payment && payment.status !== 'PAID') payment.status = 'CANCELED'
}

/** Aplica el resultado pendiente, como si el webhook de Stripe hubiera llegado. */
function settle(db: MockDb, payment: MockPaymentRecord) {
  const order = db.orders[payment.orderId]
  payment.polls++
  if (!payment.outcome || !order) return
  // El primer vistazo aun no ve el webhook; PROCESSING tarda un par de consultas mas
  const wait = payment.outcome.status === 'PROCESSING' ? 3 : 1
  if (payment.polls < wait) {
    if (payment.outcome.status === 'PROCESSING') payment.status = 'PROCESSING'
    return
  }
  if (payment.outcome.status === 'FAILED') {
    payment.status = 'FAILED'
    payment.failureMessage = payment.outcome.message ?? 'El pago fue rechazado.'
  }
  else {
    payment.status = 'PAID'
    payment.paidAt = now()
    order.status = 'CONFIRMED'
    order.updatedAt = now()
  }
  payment.outcome = null
}

const publicPayment = ({ outcome: _o, polls: _p, ...payment }: MockPaymentRecord): CheckoutPayment => payment
const publicOrder = ({ accessToken: _a, paymentMethod: _m, ...order }: MockOrderRecord): Order => order

export interface MockOrderInput {
  lines: CartLine[]
  pickup: boolean
  address: CheckoutAddress | null
  shippingConfigId: string | null
  pickupLocationId: string | null
  couponCode: string | null
  notes: string | null
  customer: { userId: string } | null
  guest: { email: string, name: string, phone: string } | null
}

export const checkoutMock = {
  config: (): PaymentsConfig => ({ publishableKey: 'pk_test_mock', currency: 'MXN', country: 'MX' }),

  shippingOptions: (subtotalAfterDiscount: number): ShippingOption[] =>
    SHIPPING_RATES.map((rate) => {
      const free = rate.freeFrom !== null && subtotalAfterDiscount >= rate.freeFrom
      return {
        id: rate.id,
        name: rate.name,
        cost: free ? 0 : rate.cost,
        free,
        freeFrom: rate.freeFrom,
        estimatedDaysMin: rate.min,
        estimatedDaysMax: rate.max,
      }
    }),

  storeLocations: (): StoreLocation[] => STORE_LOCATIONS,

  previewCoupon(code: string, subtotal: number): CouponPreview {
    const { discount, description } = couponDiscount(code, subtotal)
    return { code, discountAmount: discount, description }
  },

  createOrder(input: MockOrderInput): Order & { accessToken: string | null } {
    if (!input.lines.length) throw apiError(422, 'El carrito está vacío.')
    const short = input.lines.find(line => line.quantity > line.stock)
    if (short) throw apiError(422, `Stock insuficiente para: ${short.name} talla ${short.size}. Disponible: ${short.stock}`)
    if (input.guest && input.couponCode) throw apiError(400, 'Inicia sesión para usar cupones.')

    const db = read()
    const subtotal = round(input.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0))
    const discount = input.couponCode ? couponDiscount(input.couponCode, subtotal).discount : 0

    let shippingCost = 0
    let shippingName: string | null = null
    if (!input.pickup) {
      const option = checkoutMock.shippingOptions(subtotal - discount).find(o => o.id === input.shippingConfigId)
      if (!option) throw apiError(422, 'El método de envío no está disponible.')
      shippingCost = option.cost
      shippingName = option.name
    }
    const location = input.pickup ? STORE_LOCATIONS.find(l => l.id === input.pickupLocationId) : null
    if (input.pickup && !location) throw apiError(422, 'El punto de recogida no está disponible.')

    const total = round(subtotal - discount + shippingCost)
    const taxOf = (amount: number) => round(amount - amount / (1 + TAX_RATE))
    db.sequence++
    const created = now()
    const order: MockOrderRecord = {
      id: id('ord'),
      orderNumber: `LB-2026-${String(db.sequence).padStart(5, '0')}`,
      status: 'PENDING_PAYMENT',
      pickup: input.pickup,
      userId: input.customer?.userId ?? null,
      guestEmail: input.guest?.email ?? null,
      guestName: input.guest?.name ?? null,
      guestPhone: input.guest?.phone ?? null,
      shippingAddress: input.pickup ? null : input.address,
      shippingConfigId: input.pickup ? null : input.shippingConfigId,
      shippingConfigName: shippingName,
      pickupLocationId: location?.id ?? null,
      pickupLocationName: location?.name ?? null,
      pickupCode: null,
      subtotal,
      discountAmount: discount,
      shippingCost,
      taxRate: TAX_RATE,
      taxAmount: taxOf(total),
      total,
      couponId: input.couponCode ? `coupon-${input.couponCode}` : null,
      couponCode: input.couponCode,
      notes: input.notes,
      adminNotes: null,
      items: input.lines.map(line => ({
        id: id('item'),
        variantId: line.variantId,
        sku: `${line.slug.slice(0, 6).toUpperCase()}-${line.size}`,
        productName: line.name,
        colorName: line.colorName ?? '',
        sizeName: line.size,
        imageUrl: line.imageUrl,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: round(line.unitPrice * line.quantity),
        taxRate: TAX_RATE,
        taxAmount: taxOf(line.unitPrice * line.quantity),
      })),
      createdAt: created,
      updatedAt: created,
      accessToken: input.guest ? id('gat') : null,
      paymentMethod: null,
    }
    db.orders[order.id] = order
    write(db)
    return { ...publicOrder(order), accessToken: order.accessToken }
  },

  getOrder(access: OrderAccess): Order {
    const db = read()
    const order = findOrder(db, access)
    expireIfNeeded(db, order)
    write(db)
    return publicOrder(order)
  },

  cancelOrder(access: OrderAccess): Order {
    const db = read()
    const order = findOrder(db, access)
    if (order.status !== 'PENDING_PAYMENT') throw apiError(422, 'Solo se pueden cancelar pedidos pendientes de pago.')
    cancel(db, order, 'Cancelado por la clienta.')
    write(db)
    return publicOrder(order)
  },

  /** POST /payments/order/{id}: idempotente (seccion 6). */
  initiatePayment(access: OrderAccess, method: CheckoutPaymentMethod): CheckoutPayment {
    const db = read()
    const order = findOrder(db, access)
    expireIfNeeded(db, order)
    if (access.kind === 'guest' && method !== 'CARD') throw apiError(400, 'Los pedidos sin cuenta solo se pueden pagar con tarjeta.')

    const current = db.payments[order.id]
    if (current?.status === 'PAID') return publicPayment(current)
    if (current?.status === 'PROCESSING') throw apiError(422, 'El pago está siendo procesado. Espera unos segundos.')
    if (order.status !== 'PENDING_PAYMENT') {
      write(db)
      throw apiError(422, 'Solo se puede iniciar pago en órdenes con estado PENDING_PAYMENT.')
    }

    // Mismo intento vivo y mismo metodo: se devuelve el mismo clientSecret
    if (current && current.status === 'PENDING' && current.method === method) return publicPayment(current)

    const attempt = (current?.attemptCount ?? 0) + 1
    const intentId = method === 'CARD' ? `pi_mock_${order.id}_${attempt}` : null
    const payment: MockPaymentRecord = {
      id: current?.id ?? id('pay'),
      orderId: order.id,
      orderNumber: order.orderNumber,
      method,
      status: 'PENDING',
      amount: order.total,
      currency: 'MXN',
      stripePaymentIntentId: intentId,
      stripeClientSecret: intentId ? `${intentId}_secret_mock` : null,
      attemptCount: attempt,
      failureMessage: null,
      paidAt: null,
      outcome: null,
      polls: 0,
    }
    db.payments[order.id] = payment
    order.paymentMethod = method
    write(db)
    return publicPayment(payment)
  },

  getPayment(access: OrderAccess): CheckoutPayment {
    const db = read()
    const order = findOrder(db, access)
    const payment = db.payments[order.id]
    if (!payment) throw apiError(404, 'Este pedido todavía no tiene un pago iniciado.')
    settle(db, payment)
    expireIfNeeded(db, order)
    write(db)
    return publicPayment(payment)
  },

  /**
   * Lo que haria stripe.confirmPayment: con la tarjeta de prueba decide el resultado.
   * El rechazo se informa al instante; el exito lo confirma "el webhook" al consultar.
   */
  confirmCard(clientSecret: string, cardNumber: string): { error: string | null } {
    const db = read()
    const payment = Object.values(db.payments).find(p => p.stripeClientSecret === clientSecret)
    if (!payment || payment.status !== 'PENDING') return { error: 'El pago ya no está disponible. Recarga la página.' }
    const outcome = CARD_OUTCOMES[cardNumber] ?? { status: 'PAID' as const }
    payment.polls = 0
    if (outcome.status === 'FAILED') {
      payment.status = 'FAILED'
      payment.failureMessage = outcome.message ?? null
      payment.outcome = null
    }
    else {
      payment.outcome = outcome
    }
    write(db)
    return { error: outcome.status === 'FAILED' ? outcome.message ?? 'El pago fue rechazado.' : null }
  },
}
