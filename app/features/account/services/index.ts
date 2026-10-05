import { useCustomerFetch } from '~/features/customer-auth'
import { createProfileApi } from './profile.api'

export function useProfileApi() {
  return createProfileApi(useCustomerFetch())
}
