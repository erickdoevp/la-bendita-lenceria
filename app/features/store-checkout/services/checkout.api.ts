import type { CustomerFetch } from '~/features/customer-auth'
import type { PublicFetch } from '~/features/store-catalog'
import { USE_CHECKOUT_MOCKS } from '../constants'
import { checkoutMock } from '../mocks/checkout.mock'
import type { MockOrderInput } from '../mocks/checkout.mock'
import type {
  CheckoutPayment,
  CheckoutPaymentMethod,
  CouponPreview,
  CustomerOrderRequest,
  GuestOrderRequest,
  GuestOrderResponse,
  Order,
  OrderAccess,
  PaymentsConfig,
  ShippingOption,
  StoreLocation,
} from '../types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function mock<T>(run: () => T, ms = 300): Promise<T> {
  await delay(ms)
  return structuredClone(run())
}

/** Ruta de orden y pago segun quien consulta (secciones 11 y 14.4). */
const orderPath = (access: OrderAccess) =>
  access.kind === 'customer' ? `/orders/me/${access.orderId}` : `/public/orders/${access.accessToken}`
const paymentPath = (access: OrderAccess) =>
  access.kind === 'customer' ? `/payments/order/${access.orderId}` : `/public/payments/order/${access.accessToken}`

/**
 * Endpoints del checkout (FLUJO-CHECKOUT-Y-PAGOS). Con USE_CHECKOUT_MOCKS todo sale
 * de checkout.mock. `mockInput` solo lo usa el mock: el backend lee el carrito del servidor.
 */
export function createCheckoutApi(publicFetch: PublicFetch, customerFetch: CustomerFetch) {
  const fetchFor = (access: OrderAccess) => (access.kind === 'customer' ? customerFetch : publicFetch)

  return {
    /** Llave publicable de Stripe; nunca se fija en el front (seccion 3). */
    paymentsConfig: (): Promise<PaymentsConfig> =>
      USE_CHECKOUT_MOCKS ? mock(checkoutMock.config, 0) : publicFetch<PaymentsConfig>('/public/payments/config'),

    /** Hay que volver a pedirlas al aplicar o quitar un cupon (seccion 5.0). */
    shippingOptions: (subtotalAfterDiscount: number): Promise<ShippingOption[]> =>
      USE_CHECKOUT_MOCKS
        ? mock(() => checkoutMock.shippingOptions(subtotalAfterDiscount), 250)
        : publicFetch<ShippingOption[]>('/shipping/options', { query: { subtotalAfterDiscount: subtotalAfterDiscount.toFixed(2) } }),

    storeLocations: (): Promise<StoreLocation[]> =>
      USE_CHECKOUT_MOCKS ? mock(checkoutMock.storeLocations, 200) : publicFetch<StoreLocation[]>('/store-locations'),

    /**
     * TODO: el backend no tiene endpoint para validar un cupon antes de crear la orden.
     * Sin el, se acepta el codigo y el descuento aparece al crear la orden (o el 400 si no aplica).
     */
    previewCoupon: async (code: string, subtotal: number): Promise<CouponPreview> =>
      USE_CHECKOUT_MOCKS
        ? mock(() => checkoutMock.previewCoupon(code, subtotal), 400)
        : { code, discountAmount: null, description: null },

    createCustomerOrder: (body: CustomerOrderRequest, mockInput: MockOrderInput): Promise<Order> =>
      USE_CHECKOUT_MOCKS
        ? mock(() => checkoutMock.createOrder(mockInput), 700)
        : customerFetch<Order>('/orders', { method: 'POST', body }),

    /** La respuesta trae el accessToken una sola vez: hay que guardarlo antes de seguir. */
    createGuestOrder: (body: GuestOrderRequest, mockInput: MockOrderInput): Promise<GuestOrderResponse> =>
      USE_CHECKOUT_MOCKS
        ? mock(() => checkoutMock.createOrder(mockInput) as GuestOrderResponse, 700)
        : publicFetch<GuestOrderResponse>('/public/orders', { method: 'POST', body }),

    getOrder: (access: OrderAccess): Promise<Order> =>
      USE_CHECKOUT_MOCKS ? mock(() => checkoutMock.getOrder(access), 250) : fetchFor(access)<Order>(orderPath(access)),

    /** Solo en PENDING_PAYMENT; el backend libera el stock y regresa el carrito. */
    cancelOrder: (access: OrderAccess): Promise<Order> =>
      USE_CHECKOUT_MOCKS
        ? mock(() => checkoutMock.cancelOrder(access), 400)
        : fetchFor(access)<Order>(`${orderPath(access)}/cancel`, { method: 'PATCH' }),

    /** Idempotente: se llama en cada intento en vez de guardar el clientSecret (seccion 6). */
    initiatePayment: (access: OrderAccess, method: CheckoutPaymentMethod): Promise<CheckoutPayment> =>
      USE_CHECKOUT_MOCKS
        ? mock(() => checkoutMock.initiatePayment(access, method), 400)
        : fetchFor(access)<CheckoutPayment>(paymentPath(access), { method: 'POST', body: { method } }),

    /** Fuente de verdad del cobro: se consulta hasta ver PAID o FAILED (seccion 8). */
    getPayment: (access: OrderAccess): Promise<CheckoutPayment> =>
      USE_CHECKOUT_MOCKS ? mock(() => checkoutMock.getPayment(access), 200) : fetchFor(access)<CheckoutPayment>(paymentPath(access)),
  }
}

export type CheckoutApi = ReturnType<typeof createCheckoutApi>
