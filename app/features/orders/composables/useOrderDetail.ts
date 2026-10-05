import { useOrdersApi } from '../services'
import type { Order, Payment, Shipment } from '../types'
import { orderActions } from '../utils/actions'

/**
 * Detalle de una orden: la orden, su pago y su envio se cargan en paralelo.
 * Tras cualquier accion se recarga todo: los endpoints de envio, recogida y
 * pago no siempre devuelven la orden (los de recogida responden 204).
 */
export function useOrderDetail(orderId: string) {
  const api = useOrdersApi()
  const order = ref<Order | null>(null)
  const payment = ref<Payment | null>(null)
  const shipment = ref<Shipment | null>(null)
  const pending = ref(false)
  const error = ref<ApiErrorInfo | null>(null)
  const paymentError = ref<string | null>(null)
  const shipmentError = ref<string | null>(null)
  let requestId = 0

  async function load() {
    const id = ++requestId
    pending.value = true
    error.value = null

    const [orderResult, paymentResult, shipmentResult] = await Promise.allSettled([
      api.get(orderId),
      api.payment(orderId),
      api.shipment(orderId),
    ])
    if (id !== requestId) return

    if (orderResult.status === 'fulfilled') order.value = orderResult.value
    else error.value = parseApiError(orderResult.reason)

    paymentError.value = paymentResult.status === 'rejected' ? parseApiError(paymentResult.reason).message : null
    if (paymentResult.status === 'fulfilled') payment.value = paymentResult.value

    shipmentError.value = shipmentResult.status === 'rejected' ? parseApiError(shipmentResult.reason).message : null
    if (shipmentResult.status === 'fulfilled') shipment.value = shipmentResult.value

    pending.value = false
  }

  const actions = computed(() =>
    order.value ? orderActions({ order: order.value, payment: payment.value, shipment: shipment.value }) : [],
  )

  return { order, payment, shipment, pending, error, paymentError, shipmentError, actions, load }
}
