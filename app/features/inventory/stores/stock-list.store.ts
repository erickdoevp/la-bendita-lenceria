import { defineStore } from 'pinia'
import type { ProductStatus } from '~/features/products'
import { useInventoryApi } from '../services'

/** Listado de existencias por variante. En store para conservar filtros y pagina al volver del detalle. */
export const useStockListStore = defineStore('inventory-stock-list', () => {
  const api = useInventoryApi()
  const list = reactive(createPagedList(
    query => api.listVariants(query),
    { productName: '', sku: '', status: '' as ProductStatus | '' },
    20,
  ))

  return { list }
})
