import { defineStore } from 'pinia'
import type { LoginRequest } from '#shared/schemas/auth'
import type { AuthUser } from '#shared/types/auth'
import { isAdminUser } from '#shared/utils/auth'
import { AUTH_ROUTES } from '../constants'
import { createAuthApi } from '../services/auth.api'
import { getErrorStatus } from '../utils/errors'
import { getTokenExpiry } from '../utils/jwt'

const CHANNEL_NAME = 'lb-admin-auth'
const REFRESH_LOCK = 'lb-admin-auth-refresh'
const REFRESH_MARGIN_MS = 60_000
const RETRY_DELAY_MS = 15_000

type AuthMessage =
  | { type: 'session', accessToken: string, user: AuthUser }
  | { type: 'token', accessToken: string }
  | { type: 'logout' }

function isExpiringSoon(token: string) {
  const expiry = getTokenExpiry(token)
  return !expiry || expiry - Date.now() < REFRESH_MARGIN_MS
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const { public: { apiBase } } = useRuntimeConfig()
  const api = createAuthApi(apiBase)

  // El accessToken vive solo en memoria; el refreshToken en cookie httpOnly
  const accessToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))
  const isAdmin = computed(() => isAdminUser(user.value))

  let refreshTimer: ReturnType<typeof setTimeout> | undefined
  let refreshing: Promise<void> | null = null
  let restoring: Promise<void> | null = null

  const channel = import.meta.client && 'BroadcastChannel' in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null

  function broadcast(message: AuthMessage) {
    channel?.postMessage(message)
  }

  function setAccessToken(token: string) {
    accessToken.value = token
    scheduleRefresh(token)
  }

  function clearSession() {
    clearTimeout(refreshTimer)
    accessToken.value = null
    user.value = null
  }

  /** Refresh proactivo ~60 s antes de que expire el accessToken. */
  function scheduleRefresh(token: string, delayOverride?: number) {
    clearTimeout(refreshTimer)
    const expiry = getTokenExpiry(token)
    if (!expiry) return

    const delay = delayOverride ?? Math.max(expiry - Date.now() - REFRESH_MARGIN_MS, 5_000)
    refreshTimer = setTimeout(() => {
      refresh().catch((error) => {
        // Un fallo de red no cierra la sesion: se reintenta mientras el token siga vivo
        if (getErrorStatus(error) !== 401 && accessToken.value && expiry > Date.now()) {
          scheduleRefresh(accessToken.value, RETRY_DELAY_MS)
        }
      })
    }, delay)
  }

  async function redirectToLogin(keepCurrentRoute: boolean) {
    const current = router.currentRoute.value
    if (!current.path.startsWith(AUTH_ROUTES.home) || current.path === AUTH_ROUTES.login) return
    await router.push({
      path: AUTH_ROUTES.login,
      query: keepCurrentRoute ? { redirect: current.fullPath } : undefined,
    })
  }

  /** La sesion murio en el servidor (refresh 401): limpia todo y vuelve al login. */
  function expireSession() {
    const wasAuthenticated = isAuthenticated.value
    clearSession()
    broadcast({ type: 'logout' })
    if (wasAuthenticated) redirectToLogin(true)
  }

  /**
   * El backend rota el refreshToken en cada uso y revoca TODAS las sesiones si
   * detecta un token reutilizado. Por eso: una sola promesa por pestaña y un
   * Web Lock compartido entre pestañas.
   */
  function refresh(): Promise<void> {
    refreshing ??= runRefresh().finally(() => {
      refreshing = null
    })
    return refreshing
  }

  async function runRefresh() {
    const tokenBefore = accessToken.value

    const work = async () => {
      // Otra pestaña pudo refrescar (y avisarnos) mientras esperabamos el lock
      if (accessToken.value && accessToken.value !== tokenBefore && !isExpiringSoon(accessToken.value)) {
        return
      }
      try {
        const { accessToken: next } = await api.refresh()
        setAccessToken(next)
        broadcast({ type: 'token', accessToken: next })
      }
      catch (error) {
        if (getErrorStatus(error) === 401) expireSession()
        throw error
      }
    }

    if (navigator.locks) {
      await navigator.locks.request(REFRESH_LOCK, work)
    }
    else {
      await work()
    }
  }

  async function login(credentials: LoginRequest) {
    const session = await api.login(credentials)
    user.value = session.user
    setAccessToken(session.accessToken)
    initialized.value = true
    broadcast({ type: 'session', ...session })
  }

  /** Recupera la sesion al cargar la app usando la cookie de refresh. */
  function restoreSession(): Promise<void> {
    if (initialized.value) return Promise.resolve()

    restoring ??= (async () => {
      try {
        await refresh()
        const me = await api.me(accessToken.value!)
        if (!isAdminUser(me)) {
          await api.logout().catch(() => {})
          clearSession()
          return
        }
        user.value = me
      }
      catch {
        clearSession()
      }
      finally {
        initialized.value = true
        restoring = null
      }
    })()
    return restoring
  }

  async function logout() {
    await api.logout().catch(() => {})
    clearSession()
    broadcast({ type: 'logout' })
    await router.push(AUTH_ROUTES.login)
  }

  channel?.addEventListener('message', ({ data }: MessageEvent<AuthMessage>) => {
    if (data.type === 'session') {
      user.value = data.user
      setAccessToken(data.accessToken)
      initialized.value = true
    }
    else if (data.type === 'token' && user.value) {
      setAccessToken(data.accessToken)
    }
    else if (data.type === 'logout') {
      const wasAuthenticated = isAuthenticated.value
      clearSession()
      if (wasAuthenticated) redirectToLogin(false)
    }
  })

  return {
    accessToken: readonly(accessToken),
    user: readonly(user),
    initialized: readonly(initialized),
    isAuthenticated,
    isAdmin,
    login,
    logout,
    refresh,
    restoreSession,
  }
})
