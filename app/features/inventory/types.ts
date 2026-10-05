// Contrato con /api/v1/inventory y /products/admin/variants (ver INVENTARIO-ENTRADAS-Y-SALIDAS).
import type { ProductStatus } from '~/features/products'

export type StockMovementType = 'INITIAL' | 'PURCHASE' | 'ADJUSTMENT' | 'SALE' | 'RETURN'

/** Los numeros de inventario de una variante (1 variante = 1 SKU = 1 inventario). */
export interface StockLevels {
  /** Unidades fisicas en almacen. */
  stock: number
  /** Apartadas por ordenes PENDING_PAYMENT; siguen en el almacen. */
  reservedStock: number
  /** stock - reservedStock: lo que se puede vender. */
  availableStock: number
  lowStockThreshold: number
  /** availableStock <= lowStockThreshold */
  lowStock: boolean
}

/** InventoryResponse: respuesta de GET/PATCH /inventory/variant/{id}. */
export interface Inventory extends StockLevels {
  id: string
  variantId: string
  variantSku: string
  updatedAt: string
}

/** ProductVariantFlatResponse: variante con datos del producto e inventario. */
export interface VariantStock extends StockLevels {
  variantId: string
  productId: string
  productName: string
  productSlug: string
  productStatus: ProductStatus
  sku: string
  colorName: string
  colorHex: string
  sizeName: string
  basePrice: number
  priceAdjustment: number
  finalPrice: number
  costPrice: number
  taxConfigId: string | null
  taxName: string | null
  taxRate: number | null
  imageUrl: string | null
  active: boolean
}

/** StockMovementResponse: una fila del kardex. */
export interface StockMovement {
  id: string
  variantId: string
  variantSku: string
  productName: string
  type: StockMovementType
  /** Delta con signo: + entrada, - salida. */
  quantity: number
  stockBefore: number
  stockAfter: number
  reason: string | null
  /** Solo en SALE / RETURN. */
  orderId: string | null
  /** Username del admin o "system". */
  createdBy: string
  createdAt: string
}

export interface MovementFilters {
  type: StockMovementType | ''
  orderId: string
  /** yyyy-MM-dd */
  dateFrom: string
  /** yyyy-MM-dd, inclusivo */
  dateTo: string
}

export interface StockAdjustRequest {
  /** + entrada (PURCHASE), - salida (ADJUSTMENT). */
  delta: number
  reason: string
}

export interface StockCountRequest {
  stock: number
  lowStockThreshold?: number
  reason: string
}

/** Accion abierta en el detalle de una variante. */
export type StockAction = 'entry' | 'exit' | 'count'
