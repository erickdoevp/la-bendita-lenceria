import { registerSchema } from '#shared/schemas/auth'
import { useCustomerAuthStore } from '../stores/customer-auth.store'
import { useTurnstileToken } from './useTurnstileToken'

// Mensajes del backend que no traen "errors" pero pertenecen a un campo
const DUPLICATE_FIELDS: [RegExp, 'username' | 'email'][] = [
  [/username/i, 'username'],
  [/email/i, 'email'],
]

export function useRegisterForm() {
  const auth = useCustomerAuthStore()
  const turnstile = useTurnstileToken()
  const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()

  const values = reactive({
    name: '',
    firstLastName: '',
    secondLastName: '',
    email: '',
    phoneNumber: '',
    username: '',
    password: '',
    acceptedPrivacyPolicy: false,
  })
  const pending = ref(false)

  async function submit(): Promise<boolean> {
    const payload = validate(registerSchema, { ...values, turnstileToken: turnstile.token.value ?? '' })
    if (!payload) {
      if (Object.keys(fieldErrors.value).length === 1 && fieldErrors.value.turnstileToken) {
        formError.value = fieldErrors.value.turnstileToken
      }
      return false
    }

    pending.value = true
    try {
      await auth.register(payload)
      return true
    }
    catch (error) {
      const info = applyApiError(error)
      if (info.fieldErrors.turnstileToken) formError.value = info.fieldErrors.turnstileToken
      // 400 "El username 'x' ya está en uso." / "El email 'x' ya está registrado."
      const duplicate = DUPLICATE_FIELDS.find(([pattern]) => info.status === 400 && pattern.test(info.message))
      if (duplicate && !Object.keys(info.fieldErrors).length) {
        fieldErrors.value = { [duplicate[1]]: info.message }
        formError.value = null
      }
      turnstile.consume()
      return false
    }
    finally {
      pending.value = false
    }
  }

  return { values, fieldErrors, formError, pending, turnstile, clearField, submit }
}
