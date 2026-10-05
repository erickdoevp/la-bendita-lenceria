// API publica del feature invoices ("Mis facturas" del cliente).
// Fuera del feature, importa solo desde aqui.
export { default as InvoiceRequestForm } from './components/InvoiceRequestForm.vue'
export { default as InvoicesManager } from './components/InvoicesManager.vue'
export { default as InvoiceStatusBadge } from './components/InvoiceStatusBadge.vue'
export { default as InvoiceSummary } from './components/InvoiceSummary.vue'
export { useInvoicesApi } from './services'
export { useInvoicesStore } from './stores/invoices.store'
export type { Invoice, InvoiceStatus } from './types'
export { canRequestInvoice, isActiveInvoice } from './utils/invoice'
