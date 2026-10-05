import { useCustomerFetch } from '~/features/customer-auth'
import { usePublicFetch } from '~/features/store-catalog'
import { createCheckoutApi } from './checkout.api'

export type { CheckoutApi } from './checkout.api'

export function useCheckoutApi() {
  return createCheckoutApi(usePublicFetch(), useCustomerFetch())
}
