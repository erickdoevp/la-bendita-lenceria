import { useCustomerFetch } from '~/features/customer-auth'
import { createFiscalApi } from './fiscal.api'

export function useFiscalApi() {
  return createFiscalApi(useCustomerFetch())
}
