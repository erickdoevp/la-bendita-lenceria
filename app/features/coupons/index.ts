// API publica del feature coupons. Fuera del feature, importa solo desde aqui.
export { default as CouponDetail } from './components/CouponDetail.vue'
export { default as CouponForm } from './components/CouponForm.vue'
export { default as CouponsManager } from './components/CouponsManager.vue'
export { COUPON_ROUTES } from './constants'
export { useCouponsStore } from './stores/coupons.store'
export type { Coupon, CouponStatus, CouponUsage } from './types'
