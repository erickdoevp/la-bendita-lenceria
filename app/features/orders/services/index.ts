import { useAuthFetch } from '~/features/auth'
import { createOrdersApi } from './orders.api'

export function useOrdersApi() {
  return createOrdersApi(useAuthFetch())
}
