import type { CustomerFetch } from '~/features/customer-auth'
import type { Invoice, InvoiceRequest, InvoiceStatus } from '../types'

export interface InvoiceListQuery {
  status?: InvoiceStatus | ''
  page?: number
  size?: number
}

export function createInvoicesApi(customerFetch: CustomerFetch) {
  async function request(body: InvoiceRequest, retried = false): Promise<Invoice> {
    try {
      return await customerFetch<Invoice>('/invoices', { method: 'POST', body })
    }
    catch (error) {
      // El folio se calcula contando facturas: dos solicitudes a la vez pueden chocar (409)
      if (!retried && parseApiError(error).status === 409) return request(body, true)
      throw error
    }
  }

  return {
    // El default del backend es createdAt,asc: se piden las recientes primero
    listMine: ({ status, ...query }: InvoiceListQuery) =>
      customerFetch<RawPage<Invoice>>('/invoices/me', {
        query: { ...query, ...(status ? { status } : {}), sort: 'createdAt,desc' },
      }).then(toPage),
    /** No hay filtro por orden en el backend: se buscan entre las ultimas del cliente. */
    forOrder: (orderId: string) =>
      customerFetch<RawPage<Invoice>>('/invoices/me', { query: { page: 0, size: 100, sort: 'createdAt,desc' } })
        .then(raw => toPage(raw).items.filter(invoice => invoice.orderId === orderId)),
    getMine: (id: string) => customerFetch<Invoice>(`/invoices/me/${id}`),
    request: (body: InvoiceRequest) => request(body),
    /** Solo PENDING. */
    cancelMine: (id: string) => customerFetch<Invoice>(`/invoices/me/${id}/cancel`, { method: 'PATCH' }),
  }
}
