import type { useAuthFetch } from '~/features/auth'
import type { ProductDetail, ProductListItem, ProductStatus } from '../types'

type AuthFetch = ReturnType<typeof useAuthFetch>

export interface SkuPreviewQuery {
  name: string
  sizeId: string
  colorId: string
}

export interface ProductListQuery {
  name?: string
  status?: ProductStatus | ''
  categoryId?: string
  page?: number
  size?: number
}

/** Quita filtros vacios para no mandar "name=" al backend. */
function cleanQuery(query: object) {
  return Object.fromEntries(Object.entries(query).filter(([, v]) => v !== '' && v != null))
}

export function createProductsApi(authFetch: AuthFetch) {
  return {
    // Paginado admin: incluye borradores y archivados
    list: (query: ProductListQuery) =>
      authFetch<RawPage<ProductListItem>>('/products/admin', { query: cleanQuery(query) }).then(toPage),

    skuPreview: (query: SkuPreviewQuery) =>
      authFetch<{ sku: string }>('/products/sku-preview', { query }),

    // Sin Content-Type manual: el navegador agrega el boundary del multipart
    create: (body: FormData) =>
      authFetch<ProductDetail>('/products', { method: 'POST', body }),
  }
}
