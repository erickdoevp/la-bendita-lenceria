import type { z } from 'zod'
import { getFieldErrors } from '#shared/utils/validation'

/**
 * Errores de un formulario: los de Zod (cliente) y los del backend comparten
 * claves ("name", "variants[0].sizeId"), asi que se pintan en el mismo sitio.
 */
export function useFormErrors() {
  const fieldErrors = ref<Record<string, string>>({})
  const formError = ref<string | null>(null)

  function validate<S extends z.ZodType>(schema: S, values: unknown): z.output<S> | null {
    formError.value = null
    const result = schema.safeParse(values)
    if (result.success) {
      fieldErrors.value = {}
      return result.data
    }
    fieldErrors.value = getFieldErrors(result.error)
    return null
  }

  function applyApiError(error: unknown, options?: { conflict?: string }) {
    const info = parseApiError(error, options)
    fieldErrors.value = info.fieldErrors
    formError.value = Object.keys(info.fieldErrors).length ? 'Revisa los campos marcados.' : info.message
    return info
  }

  function clearField(field: string) {
    if (!(field in fieldErrors.value)) return
    const { [field]: _removed, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }

  function reset() {
    fieldErrors.value = {}
    formError.value = null
  }

  return { fieldErrors, formError, validate, applyApiError, clearField, reset }
}
