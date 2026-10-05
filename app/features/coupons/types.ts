// Contrato con /api/v1/coupons (ver CUPONES.txt).

export type CouponValueType = 'PERCENTAGE' | 'FIXED'

/** CouponResponse. */
export interface Coupon {
  id: string
  /** Siempre en MAYUSCULAS. */
  code: string
  description: string | null
  valueType: CouponValueType
  /** Porcentaje (10 = 10 %) o pesos segun valueType. */
  value: number
  minOrderAmount: number | null
  /** Tope en pesos; solo tiene sentido en PERCENTAGE. */
  maxDiscountAmount: number | null
  /** null = ilimitado. */
  maxUses: number | null
  firstPurchaseOnly: boolean
  usedCount: number
  /** LocalDateTime sin zona; null = no vence. */
  expiresAt: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

/** Body de POST y PUT: en PUT los opcionales en null conservan su valor anterior. */
export interface CouponRequest {
  code: string
  description: string | null
  valueType: CouponValueType
  value: number
  minOrderAmount: number | null
  maxDiscountAmount: number | null
  maxUses: number | null
  firstPurchaseOnly: boolean
  /** yyyy-MM-ddTHH:mm:ss, sin Z ni offset. */
  expiresAt: string | null
  active: boolean
}

export interface CouponUsage {
  id: string
  couponId: string
  couponCode: string
  userId: string
  username: string
  orderId: string
  usedAt: string
}

/** Estado calculado en el front (seccion 3). */
export type CouponStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED'

/** Valores crudos del formulario (los <input> devuelven strings). */
export interface CouponFormValues {
  code: string
  description: string
  valueType: CouponValueType
  value: number | string
  minOrderAmount: number | string
  maxDiscountAmount: number | string
  maxUses: number | string
  /** yyyy-MM-dd */
  expiresDate: string
  /** HH:mm; vacio = todo el dia (23:59:59) */
  expiresTime: string
  firstPurchaseOnly: boolean
  active: boolean
}
