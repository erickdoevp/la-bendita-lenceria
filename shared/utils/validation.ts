import type { z } from 'zod'

/** Ruta de un issue con el formato del backend: "variants[0].sizeId". */
function formatIssuePath(path: PropertyKey[]): string {
  return path.reduce<string>((acc, segment) => {
    if (typeof segment === 'number') return `${acc}[${segment}]`
    return acc ? `${acc}.${String(segment)}` : String(segment)
  }, '')
}

/** Primer mensaje de error por campo, con el mismo formato que "errors" del backend. */
export function getFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = formatIssuePath(issue.path)
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
  }
  return fieldErrors
}
