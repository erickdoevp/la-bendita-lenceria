import type { CustomerFetch } from '~/features/customer-auth'
import type { FiscalRequest } from '../schemas'
import type { FiscalProfile } from '../types'

export function createFiscalApi(customerFetch: CustomerFetch) {
  return {
    list: () => customerFetch<FiscalProfile[]>('/fiscal'),
    get: (id: string) => customerFetch<FiscalProfile>(`/fiscal/${id}`),
    create: (body: FiscalRequest) => customerFetch<FiscalProfile>('/fiscal', { method: 'POST', body }),
    /** Reemplazo completo: sin isDefault deja de ser el predeterminado. */
    update: (id: string, body: FiscalRequest) =>
      customerFetch<FiscalProfile>(`/fiscal/${id}`, { method: 'PUT', body }),
    setDefault: (id: string) => customerFetch<FiscalProfile>(`/fiscal/${id}/default`, { method: 'PATCH' }),
    remove: (id: string) => customerFetch<null>(`/fiscal/${id}`, { method: 'DELETE' }),
  }
}
