import { loginSchema } from '#shared/schemas/auth'
import { useCustomerAuthStore } from '../stores/customer-auth.store'
import { useTurnstileToken } from './useTurnstileToken'

export function useCustomerLoginForm() {
  const auth = useCustomerAuthStore()
  const turnstile = useTurnstileToken()
  const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()

  const values = reactive({ usernameOrEmail: '', password: '' })
  const pending = ref(false)

  /** Devuelve true si el login fue correcto. */
  async function submit(): Promise<boolean> {
    const payload = validate(loginSchema, { ...values, turnstileToken: turnstile.token.value ?? '' })
    if (!payload) {
      // Turnstile no es un campo visible: su error va arriba del formulario
      formError.value = fieldErrors.value.turnstileToken ?? null
      return false
    }

    pending.value = true
    try {
      await auth.login(payload)
      return true
    }
    catch (error) {
      const { status, fieldErrors: serverErrors } = applyApiError(error)
      if (serverErrors.turnstileToken) formError.value = serverErrors.turnstileToken
      if (status === 401) values.password = ''
      turnstile.consume()
      return false
    }
    finally {
      pending.value = false
    }
  }

  return { values, fieldErrors, formError, pending, turnstile, clearField, submit }
}
