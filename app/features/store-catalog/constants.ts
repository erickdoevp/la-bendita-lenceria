// Rutas publicas de la tienda. Las paginas aun no existen: se crean al integrar el catalogo.
export const STORE_ROUTES = {
  home: '/',
  newArrivals: '/novedades',
  collections: '/colecciones',
  cart: '/carrito',
  search: '/buscar',
  sizeGuide: '/guia-de-tallas',
  product: (slug: string) => `/productos/${slug}`,
  category: (slug: string) => `/categorias/${slug}`,
  collection: (slug: string) => `/colecciones/${slug}`,
} as const
