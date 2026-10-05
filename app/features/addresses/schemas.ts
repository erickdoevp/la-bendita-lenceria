import { z } from 'zod'

const requiredText = (message: string, max = 255) =>
  z.string({ error: message }).trim().min(1, message).max(max, `Máximo ${max} caracteres.`)

export const addressSchema = z.object({
  alias: requiredText('Ponle un nombre, p. ej. Casa u Oficina.', 50),
  recipientName: requiredText('Escribe quién recibe.'),
  phone: requiredText('Escribe un teléfono de contacto.', 20),
  street: requiredText('Escribe la calle.'),
  exteriorNumber: requiredText('Escribe el número exterior.', 20),
  interiorNumber: z.string().trim().max(20, 'Máximo 20 caracteres.').transform(value => value || undefined),
  colonia: requiredText('Escribe la colonia.'),
  cp: z.string().trim().regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos.'),
  municipio: requiredText('Escribe el municipio o alcaldía.'),
  estado: requiredText('Escribe el estado.'),
  isDefault: z.boolean(),
})

export type AddressRequest = z.output<typeof addressSchema>
