import { emptyMovementFilters } from '../constants'
import { useInventoryApi } from '../services'
import type { Inventory, VariantStock } from '../types'

/**
 * Detalle de una variante: cabecera (producto + inventario) y su kardex.
 * No va en store: cada variante tiene su propio estado.
 */
export function useVariantInventory(variantId: string) {
  const api = useInventoryApi()
  const variant = ref<VariantStock | null>(null)
  const pending = ref(false)
  const error = ref<ApiErrorInfo | null>(null)
  const movements = reactive(createPagedList(
    query => api.variantMovements(variantId, query),
    emptyMovementFilters(),
    20,
  ))

  async function load() {
    pending.value = true
    error.value = null
    try {
      variant.value = await api.getVariant(variantId)
    }
    catch (e) {
      error.value = parseApiError(e)
    }
    finally {
      pending.value = false
    }
  }

  /** Usa el InventoryResponse de un PATCH (o GET) en vez de volver a pedir la variante. */
  function applyInventory(inventory: Inventory) {
    if (!variant.value) return
    const { stock, reservedStock, availableStock, lowStockThreshold, lowStock } = inventory
    Object.assign(variant.value, { stock, reservedStock, availableStock, lowStockThreshold, lowStock })
  }

  /** reservedStock cambia solo (ordenes que se crean, pagan o expiran): refrescar antes de ajustar. */
  async function refreshLevels() {
    try {
      applyInventory(await api.getInventory(variantId))
    }
    catch {
      // Silencioso: si falla, el backend igual valida contra los numeros reales
    }
  }

  function onAdjusted(inventory: Inventory) {
    applyInventory(inventory)
    void movements.load(0)
  }

  return { variant, pending, error, movements, load, refreshLevels, onAdjusted }
}
