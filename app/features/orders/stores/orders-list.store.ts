import { defineStore } from 'pinia'
import { emptyOrderFilters } from '../constants'
import { useOrdersApi } from '../services'

/** Listado de ordenes. En store para conservar pestana, filtros y pagina al volver del detalle. */
export const useOrdersListStore = defineStore('orders-list', () => {
  const api = useOrdersApi()
  const list = reactive(createPagedList(query => api.list(query), emptyOrderFilters(), 20))

  return { list }
})
