import { defineStore } from 'pinia'
import { useCartStore } from '~/features/store-cart'
import { PAYMENT_WINDOW_MINUTES } from '../constants'
import { useCheckoutApi } from '../services'
import type { CheckoutPayment, Order, OrderAccess } from '../types'
import { orderAccess, readActiveOrderId, rememberGuestOrder, writeActiveOrderId } from '../utils/order-storage'

/**
 * Orden en curso del checkout. Crear la orden aparta el stock y vacia la bolsa
 * (seccion 4.3), asi que desde ese momento el resumen sale de la orden, no del carrito,
 * y un pago rechazado se reintenta sobre la misma orden (seccion 9).
 */
export const useCheckoutStore = defineStore('store-checkout', () => {
  const api = useCheckoutApi()
  const cart = useCartStore()

  const order = ref<Order | null>(null)
  const access = ref<OrderAccess | null>(null)
  const payment = ref<CheckoutPayment | null>(null)

  const isGuestOrder = computed(() => access.value?.kind === 'guest')
  const isPending = computed(() => order.value?.status === 'PENDING_PAYMENT')

  /**
   * Fin de la ventana para pagar con tarjeta (seccion 10). Transferencia, efectivo y
   * pagos en proceso no expiran.
   */
  const expiresAt = computed(() => {
    if (!order.value || !isPending.value) return null
    if (payment.value && (payment.value.method !== 'CARD' || payment.value.status === 'PROCESSING')) return null
    const minutes = isGuestOrder.value ? PAYMENT_WINDOW_MINUTES.guest : PAYMENT_WINDOW_MINUTES.customer
    // createdAt es LocalDateTime sin zona: se lee como hora local (supone servidor y clienta en la misma zona)
    return new Date(order.value.createdAt).getTime() + minutes * 60_000
  })

  function track(next: Order, nextAccess: OrderAccess) {
    order.value = next
    access.value = nextAccess
    writeActiveOrderId(next.id)
  }

  /** Recien creada: el accessToken de invitada se guarda antes que nada (seccion 14.1). */
  async function adopt(created: Order & { accessToken?: string | null }) {
    const { accessToken, ...next } = created
    if (accessToken) rememberGuestOrder(next.id, accessToken)
    track(next, accessToken ? { kind: 'guest', orderId: next.id, accessToken } : { kind: 'customer', orderId: next.id })
    payment.value = null
    await cart.syncWithOrder('created')
  }

  /**
   * Retoma una orden: la de ?pedido= (desde "Mis pedidos") o la que quedo en esta pestana.
   * Devuelve null si no hay ninguna o ya no espera pago.
   */
  async function resume(orderId?: string | null) {
    const id = orderId ?? readActiveOrderId()
    if (!id) return null
    if (order.value?.id === id) return order.value

    const nextAccess = orderAccess(id)
    try {
      const found = await api.getOrder(nextAccess)
      if (found.status !== 'PENDING_PAYMENT') {
        // Expiro o se cancelo mientras no estaba: las piezas ya regresaron a la bolsa
        if (found.status === 'CANCELLED') await cart.syncWithOrder('canceled')
        forget()
        return null
      }
      track(found, nextAccess)
      return found
    }
    catch {
      forget()
      return null
    }
  }

  /** Vuelve a leer la orden (p. ej. al vencer la ventana). */
  async function refresh() {
    if (!access.value) return null
    order.value = await api.getOrder(access.value)
    return order.value
  }

  /** Cancela para editar entrega o cupon: el stock se libera y la bolsa regresa. */
  async function cancel() {
    if (!access.value) return
    await api.cancelOrder(access.value)
    forget()
    await cart.syncWithOrder('canceled')
  }

  function setPayment(next: CheckoutPayment | null) {
    payment.value = next
  }

  function forget() {
    order.value = null
    access.value = null
    payment.value = null
    writeActiveOrderId(null)
  }

  return {
    order,
    access,
    payment,
    isGuestOrder,
    isPending,
    expiresAt,
    adopt,
    resume,
    refresh,
    cancel,
    setPayment,
    forget,
  }
})
