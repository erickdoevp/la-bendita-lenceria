import { defineStore } from 'pinia'
import { emptyMovementFilters } from '../constants'
import { useInventoryApi } from '../services'

/** Kardex general (todas las variantes): reporte y auditoria de movimientos. */
export const useMovementsStore = defineStore('inventory-movements', () => {
  const api = useInventoryApi()
  const list = reactive(createPagedList(query => api.movements(query), emptyMovementFilters(), 20))

  return { list }
})
