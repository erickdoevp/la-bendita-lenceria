// API publica del feature store-product (detalle de producto de la tienda).
// Fuera del feature, importa solo desde aqui.
export { default as ProductDetailView } from './components/ProductDetailView.vue'
export { useProductDetail } from './composables/useProductDetail'
export { PRODUCT_QUERY_KEYS } from './constants'
export type { ProductReview, ProductVariantOption, StoreProductDetail } from './types'
