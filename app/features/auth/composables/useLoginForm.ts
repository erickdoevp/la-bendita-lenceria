import { loginSchema } from '#shared/schemas/auth'
import type { LoginRequest } from '#shared/schemas/auth'
import { getFieldErrors } from '#shared/utils/validation'
import { DEV_TURNSTILE_TOKEN } from '../constants'
import { useAuthStore } from '../stores/auth.store'
import { parseAuthError } from '../utils/errors'

type LoginField = 'usernameOrEmail' | 'password'

export function useLoginForm() {
  const auth = useAuthStore()
  const { public: { turnstileSiteKey } } = useRuntimeConfig()
  const turnstileEnabled = Boolean(turnstileSiteKey)

  const values = reactive({ usernameOrEmail: '', password: '' })
  const fieldErrors = reactive<Partial<Record<LoginField, string>>>({})
  const formError = ref<string | null>(null)
  const pending = ref(false)
  const turnstileToken = ref<string | null>(turnstileEnabled ? null : DEV_TURNSTILE_TOKEN)

  function clearFieldError(field: LoginField) {
    fieldErrors[field] = undefined
  }

  /** Valida con loginSchema; devuelve el payload limpio o null si hay errores. */
  function validate(): LoginRequest | null {
    const result = loginSchema.safeParse({ ...values, turnstileToken: turnstileToken.value ?? '' })
    if (result.success) {
      fieldErrors.usernameOrEmail = undefined
      fieldErrors.password = undefined
      return result.data
    }

    const errors = getFieldErrors(result.error)
    fieldErrors.usernameOrEmail = errors.usernameOrEmail
    fieldErrors.password = errors.password
    // Turnstile no es un campo visible: su error va arriba del formulario
    if (!errors.usernameOrEmail && !errors.password) formError.value = errors.turnstileToken ?? null
    return null
  }

  /** Devuelve true si el login fue correcto y el usuario es admin. */
  async function submit(): Promise<boolean> {
    formError.value = null
    const payload = validate()
    if (!payload) return false

    pending.value = true
    try {
      await auth.login(payload)
      return true
    }
    catch (error) {
      const { status, message, fieldErrors: serverErrors } = parseAuthError(error)
      fieldErrors.usernameOrEmail = serverErrors.usernameOrEmail
      fieldErrors.password = serverErrors.password

      const hasFieldErrors = Boolean(serverErrors.usernameOrEmail || serverErrors.password)
      formError.value = serverErrors.turnstileToken ?? (hasFieldErrors ? null : message)

      if (status === 401) values.password = ''
      // Cada token de Turnstile es de un solo uso
      if (turnstileEnabled) turnstileToken.value = null
      return false
    }
    finally {
      pending.value = false
    }
  }

  return {
    values,
    fieldErrors,
    formError,
    pending,
    turnstileEnabled,
    turnstileSiteKey,
    turnstileToken,
    clearFieldError,
    submit,
  }
}
