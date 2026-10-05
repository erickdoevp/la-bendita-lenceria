import { defineStore } from 'pinia'
import type { Order } from '~/features/orders'
import { ORDERS_PAGE_SIZE } from '../constants'
import { useMyOrdersApi } from '../services'

/** "Mis pedidos": listado paginado, los mas recientes primero. */
export const useMyOrdersStore = defineStore('customer-orders', () => {
  const api = useMyOrdersApi()
  const list = reactive(createPagedList(query => api.list(query), {}, ORDERS_PAGE_SIZE))

  /** Refleja en el listado un cambio hecho desde el detalle (p. ej. cancelar). */
  function replace(order: Order) {
    if (!list.data) return
    list.data = { ...list.data, items: list.data.items.map(o => (o.id === order.id ? order : o)) }
  }

  function $reset() {
    list.data = null
  }

  return { list, replace, $reset }
})
