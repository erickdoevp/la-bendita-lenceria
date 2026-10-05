const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export function formatMoney(value: number): string {
  return money.format(value)
}

/** Valor numerico de un <input type="number">: "" o invalido cuenta como 0. */
export function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === 'number' ? value : Number.parseFloat(value ?? '')
  return Number.isFinite(n) ? n : 0
}

const dateTime = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' })

/** LocalDateTime del backend (sin zona): se lee como hora local, sin convertir. */
export function formatDateTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTime.format(date)
}

const dateOnly = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })

/** Fecha yyyy-MM-dd: new Date('2026-10-06') la leeria en UTC y podria mostrar el dia anterior. */
export function formatDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return dateOnly.format(new Date(year, month - 1, day))
}
