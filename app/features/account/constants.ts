export const ACCOUNT_ROUTES = {
  overview: '/cuenta',
  profile: '/cuenta/perfil',
  addresses: '/cuenta/direcciones',
  fiscal: '/cuenta/datos-fiscales',
  orders: '/cuenta/pedidos',
  orderDetail: (orderId: string) => `/cuenta/pedidos/${orderId}`,
  invoices: '/cuenta/facturas',
  reviews: '/cuenta/resenas',
} as const

export interface AccountNavItem {
  label: string
  to: string
  icon: string
  description: string
  exact?: boolean
}

export const ACCOUNT_NAV: AccountNavItem[] = [
  { label: 'Resumen', to: ACCOUNT_ROUTES.overview, icon: 'ph:house', description: '', exact: true },
  { label: 'Mis pedidos', to: ACCOUNT_ROUTES.orders, icon: 'ph:package', description: 'Sigue tus compras, paga lo pendiente o cancela.' },
  { label: 'Direcciones', to: ACCOUNT_ROUTES.addresses, icon: 'ph:map-pin', description: 'Hasta 5 domicilios de entrega para el checkout.' },
  { label: 'Datos fiscales', to: ACCOUNT_ROUTES.fiscal, icon: 'ph:identification-card', description: 'Tus RFC para solicitar facturas.' },
  { label: 'Mis facturas', to: ACCOUNT_ROUTES.invoices, icon: 'ph:file-text', description: 'Facturas en proceso, emitidas y canceladas.' },
  { label: 'Mis reseñas', to: ACCOUNT_ROUTES.reviews, icon: 'ph:chat-centered-text', description: 'Edita o borra lo que opinaste de tus prendas.' },
  { label: 'Perfil y seguridad', to: ACCOUNT_ROUTES.profile, icon: 'ph:user-circle', description: 'Tus datos, tu foto, tu contraseña y tus sesiones.' },
]
