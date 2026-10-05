import type { ProductFiles, ProductPayload } from '../schemas'
import type { ProductCreateRequest } from '../types'

/**
 * Multipart de POST /products (sec. 7.2):
 *   data (Blob JSON) + images + colorImages[<colorId>] + variantImages[<i>]
 * El indice de variantImages es la posicion de la variante en data.variants.
 */
export function buildProductFormData(payload: ProductPayload, files: ProductFiles): FormData {
  const data: ProductCreateRequest = payload
  const body = new FormData()
  body.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))

  for (const file of files.images) body.append('images', file)

  // Solo colores con alguna variante; si no, el backend responde 400
  const variantColors = new Set(payload.variants.map(v => v.colorId))
  for (const [colorId, colorFiles] of Object.entries(files.colorImages)) {
    if (!variantColors.has(colorId)) continue
    for (const file of colorFiles) body.append(`colorImages[${colorId}]`, file)
  }

  files.variantImages.forEach((file, index) => {
    if (file) body.append(`variantImages[${index}]`, file)
  })

  return body
}

/** Multipart "data" (Blob JSON) + archivos sueltos, p. ej. la foto de una variante. */
export function buildJsonFormData(data: object, files: Record<string, File | null> = {}): FormData {
  const body = new FormData()
  body.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  for (const [name, file] of Object.entries(files)) {
    if (file) body.append(name, file)
  }
  return body
}
