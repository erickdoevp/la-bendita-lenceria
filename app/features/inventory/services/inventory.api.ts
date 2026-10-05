import type { useAuthFetch } from '~/features/auth'
import type { ProductStatus } from '~/features/products'
import type {
  Inventory,
  MovementFilters,
  StockAdjustRequest,
  StockCountRequest,
  StockMovement,
  VariantStock,
} from '../types'

type AuthFetch = ReturnType<typeof useAuthFetch>

export interface VariantStockQuery {
  productName?: string
  sku?: string
  status?: ProductStatus | ''
  active?: boolean | ''
  page?: number
  size?: number
  sort?: string
}

export type MovementQuery = Partial<MovementFilters> & {
  page?: number
  size?: number
  sort?: string
}

/** Quita filtros vacios: un "type=" o fecha vacia el backend lo rechaza o lo ignora. */
function cleanQuery(query: object) {
  return Object.fromEntries(Object.entries(query).filter(([, v]) => v !== '' && v != null))
}

export function createInventoryApi(authFetch: AuthFetch) {
  return {
    // Variantes con datos de producto + inventario (listado principal y cabecera del detalle)
    listVariants: (query: VariantStockQuery) =>
      authFetch<RawPage<VariantStock>>('/products/admin/variants', { query: cleanQuery(query) }).then(toPage),
    getVariant: (variantId: string) =>
      authFetch<VariantStock>(`/products/admin/variants/${variantId}`),

    // Inventario
    getInventory: (variantId: string) =>
      authFetch<Inventory>(`/inventory/variant/${variantId}`),
    lowStock: () => authFetch<Inventory[]>('/inventory/low-stock'),
    // No idempotente: dos llamadas = dos movimientos
    adjustStock: (variantId: string, body: StockAdjustRequest) =>
      authFetch<Inventory>(`/inventory/variant/${variantId}/stock/adjust`, { method: 'PATCH', body }),
    setStock: (variantId: string, body: StockCountRequest) =>
      authFetch<Inventory>(`/inventory/variant/${variantId}/stock`, { method: 'PATCH', body }),

    // Kardex
    movements: (query: MovementQuery) =>
      authFetch<RawPage<StockMovement>>('/inventory/movements', { query: cleanQuery(query) }).then(toPage),
    variantMovements: (variantId: string, query: MovementQuery) =>
      authFetch<RawPage<StockMovement>>(`/inventory/variant/${variantId}/movements`, { query: cleanQuery(query) }).then(toPage),
  }
}
