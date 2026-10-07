// Rutas publicas de la tienda. Las de carrito, pago y busqueda aun no existen.
export const STORE_ROUTES = {
  home: '/',
  newArrivals: '/novedades',
  collections: '/colecciones',
  cart: '/carrito',
  checkout: '/pagar',
  search: '/buscar',
  sizeGuide: '/guia-de-tallas',
  product: (slug: string) => `/productos/${slug}`,
  /** Las categorias viven en la raiz: /lenceria, /lenceria/brasieres, /lenceria/brasieres/push-up */
  category: (...slugs: string[]) => `/${slugs.join('/')}`,
  collection: (slug: string) => `/colecciones/${slug}`,
} as const

/** Dias desde la publicacion en que la tarjeta muestra "Nuevo". */
export const NEW_PRODUCT_DAYS = 30

/** Raiz -> subcategoria -> tipo. */
export const MAX_CATEGORY_DEPTH = 3

/** true = arbol de ejemplo en vez de GET /categories/tree. */
export const USE_CATEGORY_MOCKS = false
