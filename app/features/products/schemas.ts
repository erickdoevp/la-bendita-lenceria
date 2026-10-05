import { z } from 'zod'

/** Numero de un <input>: vacio usa `fallback` (o falla si no hay fallback). */
const numberInput = <T extends z.ZodType>(schema: T, fallback?: number) =>
  z.preprocess(value => (value === '' || value == null ? fallback : Number(value)), schema)

const variantSchema = z.object({
  sizeId: z.string({ error: 'Falta la talla.' }).min(1, 'Falta la talla.'),
  colorId: z.string({ error: 'Falta el color.' }).min(1, 'Falta el color.'),
  sku: z
    .string()
    .trim()
    .max(64, 'Máximo 64 caracteres.')
    .regex(/^$|^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones.')
    .transform(sku => (sku ? sku.toUpperCase() : null)),
  priceAdjustment: numberInput(z.number({ error: 'Escribe un número.' }), 0),
  costPrice: numberInput(z.number({ error: 'Escribe un número.' }).min(0, 'El costo no puede ser negativo.'), 0),
  initialStock: numberInput(
    z.number({ error: 'Escribe un número.' }).int('Usa un número entero.').min(0, 'El stock no puede ser negativo.'),
    0,
  ),
})

const variantsSchema = z.array(variantSchema).superRefine((variants, ctx) => {
  // El backend responde 409 con un mensaje crudo de BD: mejor detectarlo aqui
  const combos = new Set<string>()
  const skus = new Set<string>()
  variants.forEach((variant, index) => {
    const combo = `${variant.sizeId}:${variant.colorId}`
    if (combos.has(combo)) {
      ctx.addIssue({ code: 'custom', path: [index, 'sizeId'], message: 'Esta combinación de talla y color está repetida.' })
    }
    combos.add(combo)

    if (variant.sku && skus.has(variant.sku)) {
      ctx.addIssue({ code: 'custom', path: [index, 'sku'], message: 'Este SKU ya se usa en otra variante.' })
    }
    if (variant.sku) skus.add(variant.sku)
  })
})

export const productSchema = z
  .object({
    name: z.string({ error: 'Escribe el nombre del artículo.' }).trim().min(1, 'Escribe el nombre del artículo.').max(150, 'Máximo 150 caracteres.'),
    slug: z
      .string()
      .trim()
      .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones (ej. bralette-encaje).')
      .transform(slug => slug || undefined),
    description: z.string().transform(toRichTextDoc),
    basePrice: numberInput(z.number({ error: 'Escribe el precio base.' }).positive('El precio base debe ser mayor a 0.')),
    categoryId: z.string({ error: 'Elige una categoría.' }).min(1, 'Elige una categoría.'),
    taxConfigId: z.string().transform(id => id || null),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
    variants: variantsSchema,
  })
  .superRefine((product, ctx) => {
    if (product.status === 'PUBLISHED' && !product.variants.length) {
      ctx.addIssue({ code: 'custom', path: ['variants'], message: 'Para publicar necesitas al menos una variante.' })
    }
    product.variants.forEach((variant, index) => {
      if (product.basePrice + variant.priceAdjustment <= 0) {
        ctx.addIssue({ code: 'custom', path: ['variants', index, 'priceAdjustment'], message: 'El precio final debe ser mayor a 0.' })
      }
    })
  })

export const productFilesSchema = z
  .object({
    images: z.array(imageFileSchema),
    colorImages: z.record(z.string(), z.array(imageFileSchema)),
    variantImages: z.array(imageFileSchema.nullable()),
  })
  .superRefine((files, ctx) => {
    const total = totalBytes([...files.images, ...Object.values(files.colorImages).flat(), ...files.variantImages])
    if (total > MAX_REQUEST_BYTES) {
      ctx.addIssue({
        code: 'custom',
        path: ['images'],
        message: `Las imágenes suman ${formatBytes(total)}; el máximo por envío es 100 MB.`,
      })
    }
  })

export type ProductPayload = z.output<typeof productSchema>
export type ProductFiles = z.output<typeof productFilesSchema>
