import type { useAuthFetch } from '~/features/auth'
import type { Coupon, CouponRequest, CouponUsage } from '../types'

type AuthFetch = ReturnType<typeof useAuthFetch>

export interface PageQuery {
  page?: number
  size?: number
  sort?: string
}

export function createCouponsApi(authFetch: AuthFetch) {
  return {
    // Sin filtros en el backend; por defecto viene de mas viejo a mas nuevo
    list: (query: PageQuery) =>
      authFetch<RawPage<Coupon>>('/coupons', { query }).then(toPage),
    get: (couponId: string) => authFetch<Coupon>(`/coupons/${couponId}`),
    create: (body: CouponRequest) => authFetch<Coupon>('/coupons', { method: 'POST', body }),
    // Reemplazo completo: mandar siempre el objeto entero
    update: (couponId: string, body: CouponRequest) =>
      authFetch<Coupon>(`/coupons/${couponId}`, { method: 'PUT', body }),
    toggle: (couponId: string) =>
      authFetch<Coupon>(`/coupons/${couponId}/toggle`, { method: 'PATCH' }),
    // 409 si ya se uso: en ese caso solo se puede desactivar
    remove: (couponId: string) => authFetch<null>(`/coupons/${couponId}`, { method: 'DELETE' }),
    usages: (couponId: string, query: PageQuery) =>
      authFetch<RawPage<CouponUsage>>(`/coupons/${couponId}/usages`, { query }).then(toPage),
  }
}
