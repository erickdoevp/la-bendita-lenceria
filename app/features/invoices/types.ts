// Contrato con /api/v1/invoices (ver CUENTA-CLIENTE, seccion 8).

export type InvoiceStatus = 'PENDING' | 'STAMPED' | 'CANCELLED'

/** InvoiceResponse */
export interface Invoice {
  id: string
  folio: string
  /** UUID del SAT; llega al timbrar. */
  uuid: string | null
  usoCFDI: string
  status: InvoiceStatus
  xmlUrl: string | null
  pdfUrl: string | null
  stampedAt: string | null
  cancelledAt: string | null
  orderId: string
  orderNumber: string
  fiscalDataId: string
  rfc: string
  razonSocial: string
  regimenFiscal: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceRequest {
  orderId: string
  fiscalDataId: string
  usoCFDI: string
}
