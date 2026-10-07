/**
 * Mientras el backend no expone los endpoints publicos del inicio, los servicios
 * responden con datos de ejemplo. Cambiar a false al integrar.
 */
export const USE_HOME_MOCKS = true

/** "Compra por categoria" ya usa GET /categories/roots; true = datos de ejemplo. */
export const USE_HOME_CATEGORY_MOCKS = false

/** "Recien llegados" ya usa GET /products; true = catalogo de ejemplo. */
export const USE_HOME_LATEST_MOCKS = false

export const HOME_LATEST_LIMIT = 8

export const HOME_DATA_KEYS = {
  hero: 'home:hero',
  latest: 'home:latest-products',
  categories: 'home:categories',
  collections: 'home:collections',
} as const

// TODO: confirmar montos y plazos con la politica real de la tienda (valores de ejemplo).
export const HOME_PROMISES = [
  {
    icon: 'ph:truck',
    title: 'Envío gratis desde $999',
    description: 'A todo México. Llega en 3 a 6 días hábiles.',
  },
  {
    icon: 'ph:arrows-clockwise',
    title: 'Cambio de talla sin costo',
    description: 'Tienes 30 días para cambiarla si no te quedó.',
  },
  {
    icon: 'ph:package',
    title: 'Empaque discreto',
    description: 'La caja no lleva el nombre de la tienda por fuera.',
  },
  {
    icon: 'ph:lock-simple',
    title: 'Pago seguro',
    description: 'Tarjeta, transferencia o pago en efectivo en tienda.',
  },
] as const
