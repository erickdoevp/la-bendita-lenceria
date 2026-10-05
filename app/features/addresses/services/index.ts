import { useCustomerFetch } from '~/features/customer-auth'
import { createAddressesApi } from './addresses.api'

export function useAddressesApi() {
  return createAddressesApi(useCustomerFetch())
}
