import type { MovementFilters, StockMovementType } from './types'

export const INVENTORY_ROUTES = {
  stock: '/admin/inventory/stock',
  movements: '/admin/inventory/movements',
  variant: (variantId: string) => `/admin/inventory/stock/${variantId}`,
  // Detalle del feature orders. Se repite la ruta para no importar orders (que ya importa inventory)
  order: (orderId: string) => `/admin/orders/${orderId}`,
} as const

export const MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  INITIAL: 'Stock inicial',
  PURCHASE: 'Entrada',
  SALE: 'Venta',
  RETURN: 'Devolución',
  ADJUSTMENT: 'Ajuste',
}

export const MOVEMENT_TYPE_CLASSES: Record<StockMovementType, string> = {
  INITIAL: 'bg-surface text-ink-muted',
  PURCHASE: 'bg-success-soft text-success',
  SALE: 'bg-accent/10 text-accent',
  RETURN: 'bg-warning-soft text-warning',
  ADJUSTMENT: 'bg-surface text-ink',
}

/** createdBy de los procesos automaticos (webhook de pago, expiracion). */
export const SYSTEM_USER = 'system'

export function emptyMovementFilters(): MovementFilters {
  return { type: '', orderId: '', dateFrom: '', dateTo: '' }
}
