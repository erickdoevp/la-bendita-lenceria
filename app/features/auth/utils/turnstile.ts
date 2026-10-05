interface TurnstileRenderOptions {
  'sitekey': string
  'callback': (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
  'theme'?: 'auto' | 'light' | 'dark'
  'language'?: string
}

export interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let loading: Promise<TurnstileApi> | null = null

export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)

  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile no disponible'))
    script.onerror = () => {
      loading = null
      script.remove()
      reject(new Error('No se pudo cargar Turnstile'))
    }
    document.head.appendChild(script)
  })
  return loading
}
