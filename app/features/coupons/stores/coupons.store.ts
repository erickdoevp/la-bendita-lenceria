import { defineStore } from 'pinia'
import { useCouponsApi } from '../services'
import type { Coupon, CouponStatus } from '../types'
import { couponStatus } from '../utils/coupon'

const PAGE_SIZE = 100

/**
 * El backend no filtra cupones: se traen todos (pocos) y se filtra en el front.
 * Si el volumen crece, pedir filtros al backend y pasar a createPagedList.
 */
export const useCouponsStore = defineStore('coupons', () => {
  const api = useCouponsApi()
  const items = ref<Coupon[]>([])
  const loaded = ref(false)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const filters = reactive({ code: '', status: '' as CouponStatus | '' })

  const filtered = computed(() => {
    const now = new Date()
    const code = filters.code.trim().toUpperCase()
    return items.value.filter(coupon =>
      (!code || coupon.code.includes(code) || coupon.description?.toUpperCase().includes(code))
      && (!filters.status || couponStatus(coupon, now) === filters.status),
    )
  })

  async function load() {
    pending.value = true
    error.value = null
    try {
      const first = await api.list({ page: 0, size: PAGE_SIZE, sort: 'createdAt,desc' })
      const rest = await Promise.all(
        Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, i) =>
          api.list({ page: i + 1, size: PAGE_SIZE, sort: 'createdAt,desc' })),
      )
      items.value = [first, ...rest].flatMap(page => page.items)
      loaded.value = true
    }
    catch (e) {
      error.value = parseApiError(e).message
    }
    finally {
      pending.value = false
    }
  }

  /** Mantiene la lista al dia tras crear, editar o activar/desactivar. */
  function upsert(coupon: Coupon) {
    const exists = items.value.some(c => c.id === coupon.id)
    items.value = exists
      ? items.value.map(c => (c.id === coupon.id ? coupon : c))
      : [coupon, ...items.value]
  }

  async function toggle(couponId: string) {
    const coupon = await api.toggle(couponId)
    upsert(coupon)
    return coupon
  }

  async function remove(couponId: string) {
    await api.remove(couponId)
    items.value = items.value.filter(c => c.id !== couponId)
  }

  return { items, filtered, filters, loaded, pending, error, load, upsert, toggle, remove }
})
