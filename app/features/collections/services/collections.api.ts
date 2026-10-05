import type { useAuthFetch } from '~/features/auth'
import type { Collection, CollectionDetail, CollectionRequest } from '../types'

type AuthFetch = ReturnType<typeof useAuthFetch>

export interface CollectionListQuery {
  name?: string
  page?: number
  size?: number
  sort?: string
}

/** "data" debe ir como Blob JSON o Spring no la puede leer. Sin Content-Type manual. */
function toFormData(data: CollectionRequest, image: File | null) {
  const body = new FormData()
  body.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  if (image) body.append('image', image)
  return body
}

export function createCollectionsApi(authFetch: AuthFetch) {
  return {
    // Colecciones
    list: (query: CollectionListQuery) =>
      authFetch<RawPage<Collection>>('/collections/admin', { query }).then(toPage),
    get: (collectionId: string) =>
      authFetch<CollectionDetail>(`/collections/admin/${collectionId}`),
    create: (data: CollectionRequest, image: File | null) =>
      authFetch<Collection>('/collections', { method: 'POST', body: toFormData(data, image) }),
    // Parcial: solo cambia lo que se manda; la imagen reemplaza a la anterior
    update: (collectionId: string, data: CollectionRequest, image: File | null) =>
      authFetch<Collection>(`/collections/${collectionId}`, { method: 'PUT', body: toFormData(data, image) }),
    remove: (collectionId: string) =>
      authFetch<null>(`/collections/${collectionId}`, { method: 'DELETE' }),
    // Debe traer TODAS las colecciones; cada una queda con position = su indice
    reorder: (collectionIds: string[]) =>
      authFetch<Collection[]>('/collections/reorder', { method: 'PUT', body: { collectionIds } }),

    // Productos de la coleccion: todas responden el detalle actualizado
    addProducts: (collectionId: string, productIds: string[]) =>
      authFetch<CollectionDetail>(`/collections/${collectionId}/products/bulk`, { method: 'POST', body: { productIds } }),
    // DELETE con body: ofetch lo manda si se pasa explicitamente
    removeProducts: (collectionId: string, productIds: string[]) =>
      authFetch<CollectionDetail>(`/collections/${collectionId}/products/bulk`, { method: 'DELETE', body: { productIds } }),
    // Debe traer EXACTAMENTE los productos actuales, en el orden nuevo
    reorderProducts: (collectionId: string, productIds: string[]) =>
      authFetch<CollectionDetail>(`/collections/${collectionId}/products/reorder`, { method: 'PUT', body: { productIds } }),
  }
}
