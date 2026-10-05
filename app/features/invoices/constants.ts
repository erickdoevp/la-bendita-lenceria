import type { InvoiceStatus } from './types'

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING: 'En proceso',
  STAMPED: 'Emitida',
  CANCELLED: 'Cancelada',
}

export const INVOICE_STATUS_CLASSES: Record<InvoiceStatus, string> = {
  PENDING: 'bg-warning-soft text-warning',
  STAMPED: 'bg-success-soft text-success',
  CANCELLED: 'bg-surface text-ink-muted',
}

export const INVOICE_TABS: { status: InvoiceStatus | '', label: string }[] = [
  { status: '', label: 'Todas' },
  { status: 'PENDING', label: 'En proceso' },
  { status: 'STAMPED', label: 'Emitidas' },
  { status: 'CANCELLED', label: 'Canceladas' },
]

/** Catalogo c_UsoCFDI del SAT: los usos que aplican a una compra en la tienda. */
export const USO_CFDI_OPTIONS: { value: string, label: string }[] = [
  { value: 'G03', label: 'Gastos en general' },
  { value: 'G01', label: 'Adquisición de mercancías' },
  { value: 'S01', label: 'Sin efectos fiscales' },
]

export const DEFAULT_USO_CFDI = 'G03'

export function usoCfdiLabel(value: string) {
  const uso = USO_CFDI_OPTIONS.find(u => u.value === value)
  return uso ? `${uso.value} · ${uso.label}` : value
}
