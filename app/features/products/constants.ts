import type { ProductStatus } from './types'

export const PRODUCT_ROUTES = {
  list: '/admin/products',
  create: '/admin/products/new',
} as const

/** Al crear solo tiene sentido borrador o publicado; ARCHIVED queda para despues. */
export const CREATE_STATUS_OPTIONS: { value: ProductStatus, label: string, description: string }[] = [
  { value: 'DRAFT', label: 'Borrador', description: 'No se ve en la tienda.' },
  { value: 'PUBLISHED', label: 'Publicado', description: 'Visible al guardar. Requiere variantes.' },
]

export const STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
}
