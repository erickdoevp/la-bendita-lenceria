import type { useAuthFetch } from '~/features/auth'
import type {
  ImageUpdateRequest,
  ProductDetail,
  ProductImage,
  ProductListItem,
  ProductStatus,
  ProductUpdateRequest,
  ProductVariant,
  VariantCreateRequest,
  VariantUpdateRequest,
} from '../types'
import { buildJsonFormData } from '../utils/form-data'

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

    // Detalle sin importar status (el publico responde 404 a borradores)
    get: (productId: string) => authFetch<ProductDetail>(`/products/admin/${productId}`),

    skuPreview: (query: SkuPreviewQuery) =>
      authFetch<{ sku: string }>('/products/sku-preview', { query }),

    // Sin Content-Type manual: el navegador agrega el boundary del multipart
    create: (body: FormData) =>
      authFetch<ProductDetail>('/products', { method: 'POST', body }),

    // Parcial: solo cambia lo que se manda
    update: (productId: string, body: ProductUpdateRequest) =>
      authFetch<ProductDetail>(`/products/${productId}`, { method: 'PATCH', body }),

    // Variantes. Las respuestas traen availableStock en 0: recargar el detalle despues
    variantSkuPreview: (productId: string, query: { sizeId: string, colorId: string }) =>
      authFetch<{ sku: string }>(`/products/${productId}/variants/sku-preview`, { query }),
    addVariant: (productId: string, data: VariantCreateRequest, image: File | null) =>
      authFetch<ProductVariant>(`/products/${productId}/variants`, { method: 'POST', body: buildJsonFormData(data, { image }) }),
    // La imagen, si va, reemplaza la foto propia anterior
    updateVariant: (productId: string, variantId: string, data: VariantUpdateRequest, image: File | null = null) =>
      authFetch<ProductVariant>(`/products/${productId}/variants/${variantId}`, { method: 'PATCH', body: buildJsonFormData(data, { image }) }),
    // Borrado fisico: falla (409) si la variante ya tiene ordenes
    removeVariant: (productId: string, variantId: string) =>
      authFetch<null>(`/products/${productId}/variants/${variantId}`, { method: 'DELETE' }),
    removeVariantImage: (productId: string, variantId: string) =>
      authFetch<ProductVariant>(`/products/${productId}/variants/${variantId}/image`, { method: 'DELETE' }),

    // Imagenes. Sin colorId van a la galeria general; una galeria vacia estrena principal
    addImages: (productId: string, files: File[], colorId: string | null) => {
      const body = new FormData()
      for (const file of files) body.append('files', file)
      return authFetch<ProductImage[]>(`/products/${productId}/images`, {
        method: 'POST',
        body,
        query: cleanQuery({ colorId }),
      })
    },
    updateImage: (productId: string, imageId: string, body: ImageUpdateRequest) =>
      authFetch<ProductImage>(`/products/${productId}/images/${imageId}`, { method: 'PATCH', body }),
    removeImage: (productId: string, imageId: string) =>
      authFetch<null>(`/products/${productId}/images/${imageId}`, { method: 'DELETE' }),
  }
}
