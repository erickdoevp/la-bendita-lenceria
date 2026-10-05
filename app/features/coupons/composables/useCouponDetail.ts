import { useCouponsApi } from '../services'
import type { Coupon } from '../types'

/** Detalle de un cupon y sus usos. El formulario de edicion se precarga con este GET. */
export function useCouponDetail(couponId: string) {
  const api = useCouponsApi()
  const coupon = ref<Coupon | null>(null)
  const pending = ref(false)
  const error = ref<ApiErrorInfo | null>(null)
  // Los ultimos usos primero (el default del backend es del mas viejo al mas nuevo)
  const usages = reactive(createPagedList(
    query => api.usages(couponId, { ...query, sort: 'usedAt,desc' }),
    {},
    20,
  ))

  async function load() {
    pending.value = true
    error.value = null
    try {
      coupon.value = await api.get(couponId)
    }
    catch (e) {
      error.value = parseApiError(e)
    }
    finally {
      pending.value = false
    }
  }

  return { coupon, pending, error, usages, load }
}
