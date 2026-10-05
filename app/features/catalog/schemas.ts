import { z } from 'zod'

const requiredName = (message: string) => z.string({ error: message }).trim().min(1, message)

/** Campo numerico de un <input>: "" o null cuentan como vacio. */
const numberField = <T extends z.ZodType>(schema: T) =>
  z.preprocess(value => (value === '' || value == null ? undefined : Number(value)), schema)

export const sizeSchema = z.object({
  name: requiredName('Escribe el nombre de la talla.').max(10, 'Usa un nombre corto: va tal cual en el SKU.'),
  sortOrder: numberField(
    z.number({ error: 'Indica el orden de la talla.' }).int('El orden debe ser un número entero.').min(1, 'El orden de la talla debe ser mayor a 0.'),
  ),
})

export const colorSchema = z.object({
  name: requiredName('Escribe el nombre del color.').max(40, 'Máximo 40 caracteres.'),
  hex: z
    .string({ error: 'Indica el código hex.' })
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El código hex debe tener el formato #RRGGBB (ej. #FF2400).')
    .transform(hex => hex.toUpperCase()),
})

export const taxSchema = z.object({
  name: requiredName('Escribe el nombre del impuesto.'),
  // En la UI se captura en porcentaje; el backend espera la tasa decimal 0..1
  rate: numberField(
    z.number({ error: 'Indica el porcentaje.' }).min(0, 'El porcentaje no puede ser negativo.').max(100, 'El porcentaje no puede ser mayor a 100.'),
  ).transform(percent => Number((percent / 100).toFixed(4))),
  active: z.boolean(),
})

export const categorySchema = z.object({
  name: requiredName('Escribe el nombre de la categoría.'),
  slug: z
    .string()
    .trim()
    .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones (ej. brasieres-encaje).')
    .transform(slug => slug || undefined),
  description: z.string().transform(toRichTextDoc),
  parentId: z.string().transform(id => id || null),
  active: z.boolean(),
  image: imageFileSchema.nullable(),
})

export type SizeRequest = z.output<typeof sizeSchema>
export type ColorRequest = z.output<typeof colorSchema>
export type TaxRequest = z.output<typeof taxSchema>
export type CategoryFormOutput = z.output<typeof categorySchema>
export type CategoryRequest = Omit<CategoryFormOutput, 'image'>
export type CategoryUpdateRequest = Partial<CategoryRequest>
