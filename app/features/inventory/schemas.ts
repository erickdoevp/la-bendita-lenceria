import { z } from 'zod'

/** Campo numerico de un <input>: "" o null cuentan como vacio. */
const numberField = <T extends z.ZodType>(schema: T) =>
  z.preprocess(value => (value === '' || value == null ? undefined : Number(value)), schema)

// El backend lo acepta vacio, pero sin motivo el kardex pierde su valor de auditoria
const reasonField = z
  .string({ error: 'Escribe el motivo: queda registrado en el kardex.' })
  .trim()
  .min(1, 'Escribe el motivo: queda registrado en el kardex.')
  .max(255, 'Máximo 255 caracteres.')

const quantityField = z
  .number({ error: 'Escribe la cantidad.' })
  .int('Usa un número entero.')
  .positive('La cantidad debe ser mayor a 0.')

/** Entrada de mercancia: delta positivo (PURCHASE). Delta 0 solo ensucia el kardex. */
export const stockEntrySchema = z
  .object({ quantity: numberField(quantityField), reason: reasonField })
  .transform(({ quantity, reason }) => ({ delta: quantity, reason }))

/** Salida / merma: se captura en positivo y se manda negativa (ADJUSTMENT). */
export function stockExitSchema(availableStock: number) {
  return z
    .object({
      quantity: numberField(quantityField.max(
        availableStock,
        `Solo hay ${availableStock} disponible(s); lo reservado en pedidos no se puede sacar.`,
      )),
      reason: reasonField,
    })
    .transform(({ quantity, reason }) => ({ delta: -quantity, reason }))
}

/** Conteo fisico: stock absoluto, nunca por debajo de lo reservado. */
export function stockCountSchema(reservedStock: number) {
  return z.object({
    stock: numberField(
      z
        .number({ error: 'Escribe el stock contado.' })
        .int('Usa un número entero.')
        .min(0, 'El stock no puede ser negativo.')
        .refine(stock => stock >= reservedStock, `Hay ${reservedStock} unidad(es) reservada(s) en pedidos; el stock no puede ser menor.`),
    ),
    lowStockThreshold: numberField(
      z.number({ error: 'Escribe un número.' }).int('Usa un número entero.').min(0, 'El umbral no puede ser negativo.').optional(),
    ),
    reason: reasonField,
  })
}

export type StockCountPayload = z.output<ReturnType<typeof stockCountSchema>>
