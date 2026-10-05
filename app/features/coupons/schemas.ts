import { z } from 'zod'
import { COUPON_CODE_PATTERN } from './constants'
import type { Coupon, CouponFormValues, CouponRequest } from './types'
import { joinExpiresAt, parseLocalDateTime, splitExpiresAt } from './utils/coupon'

/** Campo numerico de un <input>: "" o null cuentan como vacio. */
const numberField = <T extends z.ZodType>(schema: T) =>
  z.preprocess(value => (value === '' || value == null ? undefined : Number(value)), schema)

const twoDecimals = (value: number) => Math.round(value * 100) / 100 === value

const optionalMoney = numberField(
  z
    .number({ error: 'Escribe un monto.' })
    .min(0, 'El monto no puede ser negativo.')
    .refine(twoDecimals, 'Usa máximo 2 decimales.')
    .optional(),
).transform(value => value ?? null)

function expiresChanged(values: Pick<CouponFormValues, 'expiresDate' | 'expiresTime'>, original: Coupon | null) {
  if (!original) return true
  const initial = splitExpiresAt(original.expiresAt)
  return values.expiresDate !== initial.date || values.expiresTime !== initial.time
}

/**
 * Crear y editar comparten body. Al editar (PUT) los opcionales en null
 * conservan el valor anterior, asi que vaciar uno ya guardado no tendria
 * efecto: se avisa en vez de fingir que se quito.
 */
export function couponSchema(original: Coupon | null, now = new Date()) {
  return z
    .object({
      code: z
        .string({ error: 'Escribe el código.' })
        .trim()
        .toUpperCase()
        .min(1, 'Escribe el código.')
        .max(40, 'Máximo 40 caracteres.')
        .regex(COUPON_CODE_PATTERN, 'Solo letras, números, guion y guion bajo, sin espacios.'),
      description: z.string().trim().max(255, 'Máximo 255 caracteres.').transform(text => text || null),
      valueType: z.enum(['PERCENTAGE', 'FIXED'], { error: 'Elige el tipo de descuento.' }),
      value: numberField(
        z
          .number({ error: 'Escribe el valor del descuento.' })
          .min(0.01, 'El valor debe ser mayor a 0.')
          .refine(twoDecimals, 'Usa máximo 2 decimales.'),
      ),
      minOrderAmount: optionalMoney,
      maxDiscountAmount: optionalMoney,
      maxUses: numberField(
        z
          .number({ error: 'Escribe un número.' })
          .int('Usa un número entero.')
          .min(1, 'El máximo de usos debe ser al menos 1.')
          .optional(),
      ).transform(value => value ?? null),
      expiresDate: z.string(),
      expiresTime: z.string(),
      firstPurchaseOnly: z.boolean(),
      active: z.boolean(),
    })
    .superRefine((values, ctx) => {
      const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })

      if (values.valueType === 'PERCENTAGE' && values.value > 100) {
        issue('value', 'Un cupón de porcentaje no puede pasar de 100 %.')
      }

      if (values.expiresTime && !values.expiresDate) issue('expiresDate', 'Elige la fecha de vencimiento.')
      const expiresAt = joinExpiresAt(values.expiresDate, values.expiresTime)
      // Al editar, solo se exige fecha futura si cambio (un cupon vencido se puede editar)
      if (expiresAt && expiresChanged(values, original) && parseLocalDateTime(expiresAt) <= now) {
        issue('expiresDate', 'La fecha de vencimiento debe ser futura.')
      }

      if (!original) return
      if (original.description && !values.description) {
        issue('description', 'Una vez guardada no se puede dejar vacía; escribe otra.')
      }
      if (original.minOrderAmount != null && values.minOrderAmount == null) {
        issue('minOrderAmount', 'No se puede quitar; pon 0 para que no haya mínimo.')
      }
      if (values.valueType === 'PERCENTAGE' && original.maxDiscountAmount != null && values.maxDiscountAmount == null) {
        issue('maxDiscountAmount', 'No se puede quitar; pon un tope alto para que no estorbe.')
      }
      if (original.maxUses != null && values.maxUses == null) {
        issue('maxUses', 'No se puede quitar el límite; pon un número alto.')
      }
      if (original.expiresAt && !expiresAt) {
        issue('expiresDate', 'No se puede quitar el vencimiento; pon una fecha lejana.')
      }
    })
    .transform((values): CouponRequest => ({
      code: values.code,
      description: values.description,
      valueType: values.valueType,
      value: values.value,
      minOrderAmount: values.minOrderAmount,
      // El tope solo aplica a porcentaje
      maxDiscountAmount: values.valueType === 'PERCENTAGE' ? values.maxDiscountAmount : null,
      maxUses: values.maxUses,
      firstPurchaseOnly: values.firstPurchaseOnly,
      // Sin cambios se reenvia la fecha original tal cual (puede estar vencida)
      expiresAt: original && !expiresChanged(values, original)
        ? original.expiresAt
        : joinExpiresAt(values.expiresDate, values.expiresTime),
      active: values.active,
    }))
}
