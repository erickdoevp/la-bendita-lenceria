import { useCustomerFetch } from '~/features/customer-auth'
import { createMyOrdersApi } from './my-orders.api'

export function useMyOrdersApi() {
  return createMyOrdersApi(useCustomerFetch())
}
