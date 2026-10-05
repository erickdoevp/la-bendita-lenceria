import { z } from 'zod'

/** Texto opcional: vacio se omite del body. */
const optionalText = (max: number) =>
  z.string().trim().max(max, `Máximo ${max} caracteres.`).transform(text => text || undefined)

const requiredText = (message: string, max: number) =>
  z.string({ error: message }).trim().min(1, message).max(max, `Máximo ${max} caracteres.`)

/** Campo numerico de un <input>: "" o null cuentan como vacio. */
const numberField = <T extends z.ZodType>(schema: T) =>
  z.preprocess(value => (value === '' || value == null ? undefined : Number(value)), schema)

export const adminNotesSchema = z.object({
  adminNotes: optionalText(500),
})

/** Cancelar: el motivo queda en adminNotes (no hay deshacer). */
export const cancelSchema = z.object({
  adminNotes: requiredText('Escribe el motivo de la cancelación.', 500),
})

export const shipmentSchema = z.object({
  carrier: requiredText('Escribe la paquetería.', 80),
  trackingNumber: requiredText('Escribe el número de guía.', 80),
  trackingUrl: z
    .string()
    .trim()
    .refine(url => !url || /^https?:\/\/\S+$/.test(url), 'Escribe una URL completa (https://...).')
    .transform(url => url || undefined),
  estimatedDeliveryAt: z.string().transform(date => date || undefined),
  notes: optionalText(500),
})

export const shipmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED'], { error: 'Elige el estado del envío.' }),
  notes: optionalText(500),
})

/** Reembolso: monto vacio = todo lo pendiente. */
export function refundSchema(refundable: number) {
  return z.object({
    amount: numberField(
      z
        .number({ error: 'Escribe un monto.' })
        .positive('El monto debe ser mayor a 0.')
        .max(refundable, `El máximo reembolsable es ${formatMoney(refundable)}.`)
        .refine(amount => Math.round(amount * 100) / 100 === amount, 'Usa máximo 2 decimales.')
        .optional(),
    ),
    reason: z.enum(['requested_by_customer', 'duplicate', 'fraudulent'], { error: 'Elige el motivo.' }),
    adminNotes: optionalText(500),
  })
}

export type ShipmentPayload = z.output<typeof shipmentSchema>
export type RefundPayload = z.output<ReturnType<typeof refundSchema>>
