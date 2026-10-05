import { z } from 'zod'

export const newsletterSchema = z.object({
  email: z.string().trim().min(1, 'Escribe tu correo.').pipe(z.email('Escribe un correo válido.')),
})

export type NewsletterRequest = z.infer<typeof newsletterSchema>
