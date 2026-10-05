import { defineStore } from 'pinia'
import { useInvoicesApi } from '../services'
import type { Invoice, InvoiceStatus } from '../types'

/** "Mis facturas": listado paginado con filtro por estado. */
export const useInvoicesStore = defineStore('customer-invoices', () => {
  const api = useInvoicesApi()
  const list = reactive(createPagedList(
    query => api.listMine(query),
    { status: '' as InvoiceStatus | '' },
  ))

  async function cancel(id: string) {
    const invoice = await api.cancelMine(id)
    replace(invoice)
    // Con un filtro activo la factura cancelada ya no pertenece a la pestaña
    if (list.filters.status) void list.load()
    return invoice
  }

  function replace(invoice: Invoice) {
    if (!list.data) return
    list.data = { ...list.data, items: list.data.items.map(i => (i.id === invoice.id ? invoice : i)) }
  }

  function $reset() {
    list.data = null
    list.filters.status = ''
  }

  return { list, cancel, $reset }
})
