import { z } from 'zod'
import { passwordSchema } from '#shared/schemas/auth'

const requiredText = (message: string) => z.string({ error: message }).trim().min(1, message)

// PATCH /users/me: "" borra secondLastName / phoneNumber (null no cambiaria nada)
export const profileSchema = z.object({
  name: requiredText('Escribe tu nombre.'),
  firstLastName: requiredText('Escribe tu primer apellido.'),
  secondLastName: z.string().trim(),
  phoneNumber: z.string().trim(),
})

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Escribe tu contraseña actual.'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(values => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  })
  .refine(values => !values.currentPassword || values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'La nueva contraseña debe ser distinta a la actual.',
  })

export type ProfileRequest = z.output<typeof profileSchema>
export type PasswordChangeRequest = Pick<z.output<typeof passwordChangeSchema>, 'currentPassword' | 'newPassword'>
