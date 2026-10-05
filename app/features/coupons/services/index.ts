import { useAuthFetch } from '~/features/auth'
import { createCouponsApi } from './coupons.api'

export function useCouponsApi() {
  return createCouponsApi(useAuthFetch())
}
