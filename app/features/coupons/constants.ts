import type { CouponStatus } from './types'

export const COUPON_ROUTES = {
  list: '/admin/coupons',
  create: '/admin/coupons/new',
  detail: (couponId: string) => `/admin/coupons/${couponId}`,
} as const

export const COUPON_STATUS_LABELS: Record<CouponStatus, string> = {
  ACTIVE: 'Vigente',
  INACTIVE: 'Inactivo',
  EXPIRED: 'Vencido',
  EXHAUSTED: 'Agotado',
}

export const COUPON_STATUS_CLASSES: Record<CouponStatus, string> = {
  ACTIVE: 'bg-success-soft text-success',
  INACTIVE: 'bg-surface text-ink-muted',
  EXPIRED: 'bg-warning-soft text-warning',
  EXHAUSTED: 'bg-danger-soft text-danger',
}

/** Filtros del listado: el backend no filtra, se hace en el front. */
export const COUPON_STATUS_FILTERS: { value: CouponStatus | '', label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVE', label: 'Vigentes' },
  { value: 'EXPIRED', label: 'Vencidos' },
  { value: 'EXHAUSTED', label: 'Agotados' },
  { value: 'INACTIVE', label: 'Inactivos' },
]

/** Caracteres permitidos en el codigo: el backend solo quita espacios a los lados. */
export const COUPON_CODE_PATTERN = /^[A-Z0-9_-]+$/
