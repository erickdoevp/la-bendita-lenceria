// API publica del feature products. Fuera del feature, importa solo desde aqui.
export { default as ProductCreateForm } from './components/ProductCreateForm.vue'
export { default as ProductsManager } from './components/ProductsManager.vue'
export { PRODUCT_ROUTES, STATUS_LABELS } from './constants'
export { useProductsApi } from './services'
export { useProductDraftStore } from './stores/product-draft.store'
export { useProductsListStore } from './stores/products-list.store'
export type { ProductDetail, ProductListItem, ProductStatus } from './types'
