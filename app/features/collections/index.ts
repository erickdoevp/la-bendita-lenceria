// API publica del feature collections. Fuera del feature, importa solo desde aqui.
export { default as CollectionDetail } from './components/CollectionDetail.vue'
export { default as CollectionForm } from './components/CollectionForm.vue'
export { default as CollectionsManager } from './components/CollectionsManager.vue'
export { COLLECTION_ROUTES } from './constants'
export { useCollectionsStore } from './stores/collections.store'
export type { Collection, CollectionDetail as CollectionDetailData, CollectionProduct } from './types'
