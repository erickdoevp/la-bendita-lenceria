import { z } from 'zod'

// 3 letras (persona moral) o 4 (persona fisica) + fecha AAMMDD + homoclave
const RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/

export const fiscalSchema = z.object({
  // El backend rechaza minusculas: se convierte antes de validar
  rfc: z
    .string()
    .transform(value => value.trim().toUpperCase())
    .pipe(z.string().min(1, 'Escribe el RFC.').regex(RFC_PATTERN, 'El RFC no tiene un formato válido.')),
  razonSocial: z
    .string()
    .trim()
    .min(1, 'Escribe el nombre o razón social tal cual aparece en tu constancia.'),
  regimenFiscal: z.string().min(1, 'Elige tu régimen fiscal.').max(4),
  cp: z.string().trim().regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos.'),
  isDefault: z.boolean(),
})

export type FiscalRequest = z.output<typeof fiscalSchema>
