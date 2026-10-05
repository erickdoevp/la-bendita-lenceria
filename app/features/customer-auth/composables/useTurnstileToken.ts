import { DEV_TURNSTILE_TOKEN } from '~/features/auth'

/** Token de Turnstile de un formulario. Sin site key (dev) se manda "dev". */
export function useTurnstileToken() {
  const { public: { turnstileSiteKey } } = useRuntimeConfig()
  const enabled = Boolean(turnstileSiteKey)
  const token = ref<string | null>(enabled ? null : DEV_TURNSTILE_TOKEN)

  /** Cada token es de un solo uso: tras un intento fallido hay que pedir otro. */
  function consume() {
    if (enabled) token.value = null
  }

  return { enabled, siteKey: turnstileSiteKey, token, consume }
}
