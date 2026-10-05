import { defineStore } from 'pinia'
import { useProductsApi } from '../services'
import type { ProductStatus } from '../types'

/** Listado del panel. En store para conservar filtros y pagina al volver de "Nuevo articulo". */
export const useProductsListStore = defineStore('products-list', () => {
  const api = useProductsApi()
  const list = reactive(createPagedList(
    query => api.list(query),
    { name: '', status: '' as ProductStatus | '', categoryId: '' },
    20,
  ))

  return { list }
})
