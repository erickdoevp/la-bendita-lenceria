import { z } from 'zod'
import { missingPasswordRules } from '../utils/password'

// Campo de texto obligatorio: mismo mensaje si falta, no es string o esta vacio
const requiredString = (message: string) => z.string({ error: message }).min(1, message)

// Mismo esquema en el formulario (cliente) y en el BFF (server/api/auth/login)
export const loginSchema = z.object({
  usernameOrEmail: z.string({ error: 'Escribe tu usuario o correo.' }).trim().min(1, 'Escribe tu usuario o correo.'),
  password: requiredString('Escribe tu contraseña.'),
  turnstileToken: requiredString('Completa la verificación antes de continuar.'),
})

export type LoginRequest = z.infer<typeof loginSchema>

/** Mismo mensaje que el backend: "La contraseña debe contener: mínimo 12 caracteres, un número." */
export const passwordSchema = z.string({ error: 'Escribe una contraseña.' }).superRefine((value, ctx) => {
  const missing = missingPasswordRules(value)
  if (missing.length) ctx.addIssue({ code: 'custom', message: `La contraseña debe contener: ${missing.join(', ')}.` })
})

const optionalText = z.string().trim().optional().transform(value => value || undefined)

// Registro de clientes: mismo esquema en el formulario y en el BFF (server/api/session/register)
export const registerSchema = z.object({
  username: z
    .string({ error: 'Escribe un nombre de usuario.' })
    .trim()
    .min(4, 'El username debe tener entre 4 y 20 caracteres.')
    .max(20, 'El username debe tener entre 4 y 20 caracteres.'),
  password: passwordSchema,
  // El backend compara el correo tal cual: no se cambia a minusculas
  email: z.string({ error: 'Escribe tu correo.' }).trim().pipe(z.email('Escribe un correo válido.')),
  name: z.string({ error: 'Escribe tu nombre.' }).trim().min(1, 'Escribe tu nombre.'),
  firstLastName: z.string({ error: 'Escribe tu primer apellido.' }).trim().min(1, 'Escribe tu primer apellido.'),
  secondLastName: optionalText,
  phoneNumber: optionalText,
  acceptedPrivacyPolicy: z.literal(true, { error: 'Debes aceptar el Aviso de Privacidad para registrarte.' }),
  turnstileToken: requiredString('Completa la verificación antes de continuar.'),
})

export type RegisterRequest = z.output<typeof registerSchema>
