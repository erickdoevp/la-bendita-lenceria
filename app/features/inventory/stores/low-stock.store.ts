import { defineStore } from 'pinia'
import { useInventoryApi } from '../services'
import type { Inventory } from '../types'

/** Alertas de stock bajo. El backend las ordena por disponible ascendente: agotadas primero. */
export const useLowStockStore = defineStore('inventory-low-stock', () => {
  const api = useInventoryApi()
  const items = ref<Inventory[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  const outOfStock = computed(() => items.value.filter(i => i.availableStock <= 0))
  const runningLow = computed(() => items.value.filter(i => i.availableStock > 0))

  async function load() {
    pending.value = true
    error.value = null
    try {
      items.value = await api.lowStock()
    }
    catch (e) {
      error.value = parseApiError(e).message
    }
    finally {
      pending.value = false
    }
  }

  return { items, outOfStock, runningLow, pending, error, load }
})
