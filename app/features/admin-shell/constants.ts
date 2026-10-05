export interface AdminNavItem {
  label: string
  to: string
  icon: string
  exact?: boolean
}

export interface AdminNavGroup {
  label?: string
  items: AdminNavItem[]
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    items: [
      { label: 'Inicio', to: '/admin', icon: 'ph:house', exact: true },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { label: 'Órdenes', to: '/admin/orders', icon: 'ph:receipt' },
      { label: 'Cupones', to: '/admin/coupons', icon: 'ph:ticket' },
    ],
  },
  {
    label: 'Artículos',
    items: [
      { label: 'Todos los artículos', to: '/admin/products', icon: 'ph:coat-hanger', exact: true },
      { label: 'Nuevo artículo', to: '/admin/products/new', icon: 'ph:plus-circle' },
      { label: 'Colecciones', to: '/admin/collections', icon: 'ph:stack' },
      { label: 'Reseñas', to: '/admin/reviews', icon: 'ph:chat-centered-text' },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { label: 'Existencias', to: '/admin/inventory/stock', icon: 'ph:package' },
      { label: 'Movimientos', to: '/admin/inventory/movements', icon: 'ph:arrows-down-up' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { label: 'Categorías', to: '/admin/catalog/categories', icon: 'ph:tree-structure' },
      { label: 'Tallas', to: '/admin/catalog/sizes', icon: 'ph:ruler' },
      { label: 'Colores', to: '/admin/catalog/colors', icon: 'ph:palette' },
      { label: 'Impuestos', to: '/admin/catalog/taxes', icon: 'ph:percent' },
    ],
  },
]
