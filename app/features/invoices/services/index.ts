import { useCustomerFetch } from '~/features/customer-auth'
import { createInvoicesApi } from './invoices.api'

export function useInvoicesApi() {
  return createInvoicesApi(useCustomerFetch())
}
