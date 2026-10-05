import type { Coupon, CouponFormValues, CouponStatus } from '../types'

/** LocalDateTime del backend: sin zona, se interpreta como hora local. */
export function parseLocalDateTime(value: string) {
  return new Date(value)
}

/** Estado para la tabla, en el orden de la guia: inactivo > vencido > agotado > vigente. */
export function couponStatus(coupon: Coupon, now = new Date()): CouponStatus {
  if (!coupon.active) return 'INACTIVE'
  if (coupon.expiresAt && parseLocalDateTime(coupon.expiresAt) < now) return 'EXPIRED'
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return 'EXHAUSTED'
  return 'ACTIVE'
}

export function remainingUses(coupon: Pick<Coupon, 'maxUses' | 'usedCount'>) {
  return coupon.maxUses == null ? null : Math.max(0, coupon.maxUses - coupon.usedCount)
}

/** "10 %" o "$150.00" */
export function formatCouponValue(coupon: Pick<Coupon, 'valueType' | 'value'>) {
  return coupon.valueType === 'PERCENTAGE' ? `${coupon.value} %` : formatMoney(coupon.value)
}

export interface CouponSummaryInput {
  valueType: Coupon['valueType']
  value: number | null
  minOrderAmount: number | null
  maxDiscountAmount: number | null
  maxUses: number | null
  usedCount: number
  firstPurchaseOnly: boolean
  expiresAt: string | null
}

/**
 * Frase para el admin (seccion 6): "10% de descuento (máximo $200.00) en
 * compras desde $500.00. Primera compra. Vence 31 dic 2026. 63 usos disponibles."
 */
export function describeCoupon(input: CouponSummaryInput) {
  if (!input.value) return 'Define el descuento para ver el resumen.'

  let discount = input.valueType === 'PERCENTAGE'
    ? `${input.value}% de descuento`
    : `${formatMoney(input.value)} de descuento`
  if (input.valueType === 'PERCENTAGE' && input.maxDiscountAmount) {
    discount += ` (máximo ${formatMoney(input.maxDiscountAmount)})`
  }
  discount += input.minOrderAmount
    ? ` en compras desde ${formatMoney(input.minOrderAmount)}.`
    : ' en cualquier compra.'

  const parts = [discount]
  if (input.firstPurchaseOnly) parts.push('Solo primera compra.')
  parts.push(input.expiresAt ? `Vence ${formatDateTime(input.expiresAt)}.` : 'No vence.')

  const remaining = remainingUses(input)
  parts.push(remaining == null
    ? 'Usos ilimitados.'
    : `${remaining} ${remaining === 1 ? 'uso disponible' : 'usos disponibles'}.`)

  return parts.join(' ')
}

/** "2026-12-31T23:59:59" -> { date: "2026-12-31", time: "" } (23:59 = todo el dia). */
export function splitExpiresAt(expiresAt: string | null) {
  if (!expiresAt) return { date: '', time: '' }
  const date = expiresAt.slice(0, 10)
  const time = expiresAt.slice(11, 16)
  return { date, time: time === '23:59' ? '' : time }
}

/** Un date picker da solo la fecha: sin hora vale todo ese dia. */
export function joinExpiresAt(date: string, time: string) {
  if (!date) return null
  return time ? `${date}T${time}:00` : `${date}T23:59:59`
}

export function toFormValues(coupon: Coupon | null): CouponFormValues {
  const { date, time } = splitExpiresAt(coupon?.expiresAt ?? null)
  return {
    code: coupon?.code ?? '',
    description: coupon?.description ?? '',
    valueType: coupon?.valueType ?? 'PERCENTAGE',
    value: coupon?.value ?? '',
    minOrderAmount: coupon?.minOrderAmount ?? '',
    maxDiscountAmount: coupon?.maxDiscountAmount ?? '',
    maxUses: coupon?.maxUses ?? '',
    expiresDate: date,
    expiresTime: time,
    firstPurchaseOnly: coupon?.firstPurchaseOnly ?? false,
    active: coupon?.active ?? true,
  }
}
