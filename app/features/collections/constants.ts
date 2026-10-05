export const COLLECTION_ROUTES = {
  list: '/admin/collections',
  create: '/admin/collections/new',
  detail: (collectionId: string) => `/admin/collections/${collectionId}`,
} as const

/** Ruta publica de la tienda; solo para mostrar la URL al admin. */
export const STORE_COLLECTION_PATH = '/colecciones'
