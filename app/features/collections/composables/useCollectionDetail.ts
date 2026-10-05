import { useCollectionsApi } from '../services'
import { useCollectionsStore } from '../stores/collections.store'
import type { Collection, CollectionDetail } from '../types'

/**
 * Detalle de una coleccion. Las operaciones de productos responden el detalle
 * actualizado: se usa esa respuesta en vez de volver a pedirlo.
 */
export function useCollectionDetail(collectionId: string) {
  const api = useCollectionsApi()
  const store = useCollectionsStore()
  const collection = ref<CollectionDetail | null>(null)
  const pending = ref(false)
  const error = ref<ApiErrorInfo | null>(null)

  async function load() {
    pending.value = true
    error.value = null
    try {
      collection.value = await api.get(collectionId)
    }
    catch (e) {
      error.value = parseApiError(e)
    }
    finally {
      pending.value = false
    }
  }

  function applyDetail(detail: CollectionDetail) {
    collection.value = detail
    store.setProductCount(detail.id, detail.products.length)
  }

  /** PUT de datos responde CollectionResponse (sin productos): se conservan los actuales. */
  function applyCollection(saved: Collection) {
    if (!collection.value) return
    const { productCount: _count, ...data } = saved
    collection.value = { ...collection.value, ...data }
    store.upsert(saved)
  }

  async function addProducts(productIds: string[]) {
    applyDetail(await api.addProducts(collectionId, productIds))
  }

  async function removeProducts(productIds: string[]) {
    applyDetail(await api.removeProducts(collectionId, productIds))
  }

  async function reorderProducts(productIds: string[]) {
    applyDetail(await api.reorderProducts(collectionId, productIds))
  }

  return { collection, pending, error, load, applyCollection, addProducts, removeProducts, reorderProducts }
}
