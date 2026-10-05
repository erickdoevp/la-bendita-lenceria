import { useCartStore } from '~/features/store-cart'
import { PAYMENT_POLL_INTERVAL_MS, PAYMENT_POLL_MAX_ATTEMPTS } from '../constants'
import { useCheckoutApi } from '../services'
import { useCheckoutStore } from '../stores/checkout.store'
import type { CheckoutPayment, Order } from '../types'
import { orderAccess } from '../utils/order-storage'

/**
 * paid: pagada. manual: transferencia o efectivo, espera a que el equipo la confirme.
 * slow: se agotaron las consultas sin respuesta; el cobro pudo salir bien (seccion 8).
 */
export type OrderResultState = 'loading' | 'checking' | 'paid' | 'manual' | 'failed' | 'canceled' | 'slow' | 'not-found'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Pantalla de resultado. La verdad del cobro la tiene el backend (lo marca el webhook
 * de Stripe), no el navegador: se consulta GET /payments/order/{id} hasta ver un estado final.
 */
export function useOrderResult(orderId: () => string | null) {
  const api = useCheckoutApi()
  const checkout = useCheckoutStore()
  const cart = useCartStore()

  const state = ref<OrderResultState>('loading')
  const order = ref<Order | null>(null)
  const payment = ref<CheckoutPayment | null>(null)
  const isGuest = ref(false)
  let active = true

  async function poll() {
    const id = orderId()
    if (!id) {
      state.value = 'not-found'
      return
    }
    const access = orderAccess(id)
    isGuest.value = access.kind === 'guest'

    try {
      order.value = await api.getOrder(access)
    }
    catch {
      state.value = 'not-found'
      return
    }

    state.value = 'checking'
    for (let attempt = 0; attempt < PAYMENT_POLL_MAX_ATTEMPTS && active; attempt++) {
      try {
        payment.value = await api.getPayment(access)
      }
      catch {
        payment.value = null
      }
      const status = payment.value?.status

      if (status === 'PAID') {
        order.value = await api.getOrder(access).catch(() => order.value)
        state.value = 'paid'
        checkout.forget()
        return
      }
      if (payment.value && payment.value.method !== 'CARD' && status === 'PENDING') {
        state.value = 'manual'
        checkout.forget()
        return
      }
      if (status === 'FAILED') {
        state.value = 'failed'
        return
      }
      if (status === 'CANCELED' || order.value?.status === 'CANCELLED') {
        state.value = 'canceled'
        checkout.forget()
        await cart.syncWithOrder('canceled')
        return
      }
      // PENDING o PROCESSING: el webhook aun no llega
      await delay(PAYMENT_POLL_INTERVAL_MS)
    }
    if (active) state.value = 'slow'
  }

  function retry() {
    state.value = 'loading'
    void poll()
  }

  onMounted(poll)
  onBeforeUnmount(() => {
    active = false
  })

  return { state, order, payment, isGuest, retry }
}
