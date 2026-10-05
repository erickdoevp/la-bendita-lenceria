import { z } from 'zod'

const requiredText = (message: string, max = 255) =>
  z.string({ error: message }).trim().min(1, message).max(max, `Máximo ${max} caracteres.`)

const phone = z.string().trim().regex(/^\d{10}$/, 'Escribe un teléfono de 10 dígitos.')

/** Datos de contacto de la invitada. */
export const guestContactSchema = z.object({
  email: z.string({ error: 'Escribe tu correo.' }).trim().pipe(z.email('Escribe un correo válido.')),
  name: requiredText('Escribe tu nombre completo.', 120),
  phone,
})

/** Direccion en linea (mismas reglas que la libreta de direcciones). */
export const checkoutAddressSchema = z.object({
  recipientName: requiredText('Escribe quién recibe.'),
  phone,
  street: requiredText('Escribe la calle.'),
  exteriorNumber: requiredText('Escribe el número exterior.', 20),
  interiorNumber: z.string().trim().max(20, 'Máximo 20 caracteres.').transform(value => value || null),
  colonia: requiredText('Escribe la colonia.'),
  cp: z.string().trim().regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos.'),
  municipio: requiredText('Escribe el municipio o alcaldía.'),
  estado: requiredText('Escribe el estado.'),
})

export const notesSchema = z.string().trim().max(500, 'Máximo 500 caracteres.').transform(value => value || null)

export const couponCodeSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/, 'Revisa el código: solo letras, números y guiones.')
