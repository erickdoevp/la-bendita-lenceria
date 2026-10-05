import type { Review } from '../types'

/**
 * Editada = updatedAt distinto de createdAt. Se deja un margen de 1 s porque
 * al crear ambas fechas pueden diferir por milisegundos.
 */
export function isEdited(review: Pick<Review, 'createdAt' | 'updatedAt'>) {
  return Math.abs(new Date(review.updatedAt).getTime() - new Date(review.createdAt).getTime()) > 1000
}

export function formatRating(value: number | null | undefined) {
  return value ? value.toFixed(1) : '-'
}
