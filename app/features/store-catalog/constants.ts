// Rutas publicas de la tienda. Las de producto, carrito y busqueda aun no existen.
export const STORE_ROUTES = {
  home: '/',
  newArrivals: '/novedades',
  collections: '/colecciones',
  cart: '/carrito',
  search: '/buscar',
  sizeGuide: '/guia-de-tallas',
  product: (slug: string) => `/productos/${slug}`,
  /** Las categorias viven en la raiz: /lenceria, /lenceria/brasieres, /lenceria/brasieres/push-up */
  category: (...slugs: string[]) => `/${slugs.join('/')}`,
  collection: (slug: string) => `/colecciones/${slug}`,
} as const

/** Raiz -> subcategoria -> tipo. */
export const MAX_CATEGORY_DEPTH = 3

/** Mientras no exista el endpoint publico, el arbol sale de datos de ejemplo. */
export const USE_CATEGORY_MOCKS = true
