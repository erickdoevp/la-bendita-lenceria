import type { CustomerFetch } from '~/features/customer-auth'
import type { AddressRequest } from '../schemas'
import type { Address, PostalCodeInfo } from '../types'

export function createAddressesApi(customerFetch: CustomerFetch) {
  return {
    list: () => customerFetch<Address[]>('/addresses'),
    get: (id: string) => customerFetch<Address>(`/addresses/${id}`),
    create: (body: AddressRequest) => customerFetch<Address>('/addresses', { method: 'POST', body }),
    /** Reemplazo completo: sin isDefault la direccion deja de ser la predeterminada. */
    update: (id: string, body: AddressRequest) =>
      customerFetch<Address>(`/addresses/${id}`, { method: 'PUT', body }),
    setDefault: (id: string) => customerFetch<Address>(`/addresses/${id}/default`, { method: 'PATCH' }),
    remove: (id: string) => customerFetch<null>(`/addresses/${id}`, { method: 'DELETE' }),
    /** Requiere token: no sirve en el checkout de invitado. */
    postalCode: (cp: string) => customerFetch<PostalCodeInfo>(`/addresses/postal-codes/${cp}`),
  }
}
