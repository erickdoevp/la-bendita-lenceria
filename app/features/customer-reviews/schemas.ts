import { z } from 'zod'
import { REVIEW_TITLE_MAX } from './constants'

// En PUT, null conserva el valor anterior: para vaciar titulo o texto se manda ""
export const reviewSchema = z.object({
  rating: z
    .number({ error: 'La calificación es obligatoria.' })
    .int()
    .min(1, 'La calificación mínima es 1.')
    .max(5, 'La calificación máxima es 5.'),
  title: z.string().trim().max(REVIEW_TITLE_MAX, `El título no puede superar ${REVIEW_TITLE_MAX} caracteres.`),
  body: z.string().trim(),
})

export type ReviewRequest = z.output<typeof reviewSchema>
