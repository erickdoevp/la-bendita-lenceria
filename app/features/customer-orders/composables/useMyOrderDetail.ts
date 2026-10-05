import { canRequestInvoice, useInvoicesApi } from '~/features/invoices'
import type { Invoice } from '~/features/invoices'
import type { Order, Payment } from '~/features/orders'
import { useMyOrdersApi } from '../services'
import { useMyOrdersStore } from '../stores/my-orders.store'

/** Pedido + pago + facturas, cargados en paralelo. */
export function useMyOrderDetail(orderId: string) {
  const api = useMyOrdersApi()
  const invoicesApi = useInvoicesApi()
  const list = useMyOrdersStore()

  const order = ref<Order | null>(null)
  const payment = ref<Payment | null>(null)
  const invoices = ref<Invoice[]>([])
  const pending = ref(true)
  const error = ref<{ status: number | null, message: string } | null>(null)

  const canInvoice = computed(() => Boolean(order.value && canRequestInvoice(order.value.status, invoices.value)))
  const canPay = computed(() => order.value?.status === 'PENDING_PAYMENT')

  async function load() {
    pending.value = true
    error.value = null
    try {
      const [o, p, i] = await Promise.all([
        api.get(orderId),
        // El pago y las facturas son complementarios: si fallan, el detalle se muestra igual
        api.payment(orderId).catch(() => null),
        invoicesApi.forOrder(orderId).catch(() => []),
      ])
      order.value = o
      payment.value = p
      invoices.value = i
    }
    catch (e) {
      const info = parseApiError(e)
      error.value = { status: info.status, message: info.message }
    }
    finally {
      pending.value = false
    }
  }

  async function cancel() {
    const updated = await api.cancel(orderId)
    order.value = updated
    list.replace(updated)
    payment.value = await api.payment(orderId).catch(() => payment.value)
  }

  function addInvoice(invoice: Invoice) {
    invoices.value = [invoice, ...invoices.value]
  }

  function replaceInvoice(invoice: Invoice) {
    invoices.value = invoices.value.map(i => (i.id === invoice.id ? invoice : i))
  }

  return { order, payment, invoices, pending, error, canInvoice, canPay, load, cancel, addInvoice, replaceInvoice }
}
