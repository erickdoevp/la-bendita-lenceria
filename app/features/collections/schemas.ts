import { z } from 'zod'

/**
 * El backend normaliza el slug igual que slugify(); aqui solo se avisa
 * cuando no quedaria nada (los 400 de la seccion 5.3).
 */
export const collectionSchema = z
  .object({
    name: z
      .string({ error: 'Escribe el nombre de la colección.' })
      .trim()
      .min(1, 'Escribe el nombre de la colección.')
      .max(120, 'Máximo 120 caracteres.'),
    slug: z
      .string()
      .trim()
      .refine(slug => !slug || slugify(slug), 'El slug debe contener al menos una letra o número.')
      .transform(slug => slug || undefined),
    description: z.string(),
    active: z.boolean(),
    image: imageFileSchema.nullable(),
  })
  .superRefine((values, ctx) => {
    if (!values.slug && !slugify(values.name)) {
      ctx.addIssue({ code: 'custom', path: ['slug'], message: 'El nombre no tiene letras ni números: escribe un slug.' })
    }
  })

export type CollectionFormOutput = z.output<typeof collectionSchema>
