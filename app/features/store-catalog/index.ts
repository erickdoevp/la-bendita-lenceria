// API publica del feature store-catalog (piezas compartidas de la tienda publica).
// Fuera del feature, importa solo desde aqui.
export { default as ProductCard } from './components/ProductCard.vue'
export { default as ProductCardSkeleton } from './components/ProductCardSkeleton.vue'
export { default as ProductRail } from './components/ProductRail.vue'
export { default as StoreBreadcrumbs } from './components/StoreBreadcrumbs.vue'
export { MAX_CATEGORY_DEPTH, STORE_ROUTES } from './constants'
// Datos de ejemplo compartidos mientras no hay backend publico
export { getMockCatalog, MOCK_COLORS, MOCK_IMAGE_POOLS, mockColorKey } from './mocks/catalog.mock'
export type { MockCatalogProduct } from './mocks/catalog.mock'
export { CATEGORY_TREE_MOCK } from './mocks/categories.mock'
export { unsplash } from './mocks/unsplash'
export { useStoreCategories } from './composables/useStoreCategories'
export { usePublicFetch } from './services'
export type { PublicFetch } from './services'
export { useStoreCategoriesStore } from './stores/store-categories.store'
export { categoryTrailPath, collectCategoryIds, findCategoryTrail, resolveCategoryPath } from './utils/category-tree'
export type { CategoryTreeDto, ResolvedCategory, StoreCategory, StoreColor, StoreProduct } from './types'
