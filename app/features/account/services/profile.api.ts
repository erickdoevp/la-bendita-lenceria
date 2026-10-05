import type { AuthUser } from '#shared/types/auth'
import type { CustomerFetch } from '~/features/customer-auth'
import type { PasswordChangeRequest, ProfileRequest } from '../schemas'

export function createProfileApi(customerFetch: CustomerFetch) {
  return {
    /** multipart: "data" es obligatoria aunque solo cambie el avatar ({}). */
    update: (data: Partial<ProfileRequest>, image: File | null) => {
      // "data" debe ir como Blob JSON o Spring no la puede leer
      const body = new FormData()
      body.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
      if (image) body.append('image', image)
      return customerFetch<AuthUser>('/users/me', { method: 'PATCH', body })
    },

    /** 204: el backend cierra TODAS las sesiones, incluida la actual. */
    changePassword: (body: PasswordChangeRequest) =>
      customerFetch<null>('/users/me/password', { method: 'PATCH', body }),
  }
}
