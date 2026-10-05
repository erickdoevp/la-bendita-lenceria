import { usePublicFetch } from '~/features/store-catalog'
import { createCartApi } from './cart.api'

export function useCartApi() {
  return createCartApi(usePublicFetch())
}
