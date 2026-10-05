import { STORE_ROUTES } from '~/features/store-catalog'

export interface StoreNavLink {
  label: string
  to: string
}

// Enlaces fijos alrededor de las categorias raiz, que llegan del backend
export const STORE_NAV_LEADING: StoreNavLink[] = [
  { label: 'Novedades', to: STORE_ROUTES.newArrivals },
]

export const STORE_NAV_TRAILING: StoreNavLink[] = [
  { label: 'Colecciones', to: STORE_ROUTES.collections },
]

/** Grupos fijos del pie; el grupo "Tienda" se arma con las categorias raiz. */
export const STORE_FOOTER_GROUPS: { title: string, links: StoreNavLink[] }[] = [
  {
    title: 'Ayuda',
    links: [
      { label: 'Guía de tallas', to: STORE_ROUTES.sizeGuide },
      { label: 'Envíos', to: '/ayuda/envios' },
      { label: 'Cambios y devoluciones', to: '/ayuda/cambios' },
      { label: 'Preguntas frecuentes', to: '/ayuda/preguntas-frecuentes' },
    ],
  },
  {
    title: 'La Bendita',
    links: [
      { label: 'Mi cuenta', to: '/cuenta' },
      { label: 'Aviso de privacidad', to: '/legal/privacidad' },
      { label: 'Términos y condiciones', to: '/legal/terminos' },
    ],
  },
]

// TODO: reemplazar por las cuentas reales de la tienda
export const STORE_SOCIAL_LINKS = [
  { label: 'Instagram', icon: 'ph:instagram-logo', href: 'https://instagram.com/' },
  { label: 'Facebook', icon: 'ph:facebook-logo', href: 'https://facebook.com/' },
  { label: 'TikTok', icon: 'ph:tiktok-logo', href: 'https://tiktok.com/' },
] as const

export const STORE_ANNOUNCEMENT = 'Envío gratis en compras desde $999'
