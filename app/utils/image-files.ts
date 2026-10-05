import { z } from 'zod'

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_REQUEST_BYTES = 100 * 1024 * 1024
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'

// Mismos limites que el backend (413): 10 MB por archivo, 100 MB por request
export const imageFileSchema = z
  .instanceof(File, { error: 'Archivo no válido.' })
  .refine(file => file.type.startsWith('image/'), 'Solo se permiten imágenes.')
  .refine(file => file.size <= MAX_IMAGE_BYTES, 'Cada imagen debe pesar 10 MB o menos.')

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function totalBytes(files: Iterable<File | null | undefined>): number {
  let total = 0
  for (const file of files) total += file?.size ?? 0
  return total
}
