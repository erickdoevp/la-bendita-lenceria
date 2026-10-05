import type { BadgeProps } from '@nuxt/ui'
import type { ProductStatus } from './types'

export const PRODUCT_ROUTES = {
  list: '/admin/products',
  create: '/admin/products/new',
  detail: (productId: string) => `/admin/products/${productId}`,
  // Detalle del feature inventory. Se repite la ruta para no importar inventory (que ya importa products)
  inventoryVariant: (variantId: string) => `/admin/inventory/stock/${variantId}`,
  // Ficha publica (store-catalog). Repetida para no cargar la tienda en el panel
  store: (slug: string) => `/productos/${slug}`,
} as const

/** Al crear solo tiene sentido borrador o publicado; ARCHIVED queda para despues. */
export const CREATE_STATUS_OPTIONS: { value: ProductStatus, label: string, description: string }[] = [
  { value: 'DRAFT', label: 'Borrador', description: 'No se ve en la tienda.' },
  { value: 'PUBLISHED', label: 'Publicado', description: 'Visible al guardar. Requiere variantes.' },
]

/** Al editar ya se puede archivar: sale de la tienda sin perder su historial. */
export const EDIT_STATUS_OPTIONS: { value: ProductStatus, label: string, description: string }[] = [
  ...CREATE_STATUS_OPTIONS.map(option => (option.value === 'PUBLISHED'
    ? { ...option, description: 'Visible en la tienda. Requiere una variante activa.' }
    : option)),
  { value: 'ARCHIVED', label: 'Archivado', description: 'Fuera de la tienda; conserva ventas y reseñas.' },
]

export const STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
}

export const STATUS_COLORS: Record<ProductStatus, BadgeProps['color']> = {
  PUBLISHED: 'primary',
  DRAFT: 'neutral',
  ARCHIVED: 'neutral',
}
