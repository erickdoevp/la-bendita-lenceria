import { defineStore } from 'pinia'
import type { LoginRequest, RegisterRequest } from '#shared/schemas/auth'
import type { AuthUser, SessionResponse } from '#shared/types/auth'
import { getTokenExpiry } from '~/features/auth'
import { CUSTOMER_AUTH_ROUTES, GUEST_CART_TOKEN_KEY, SESSION_HINT_KEY } from '../constants'
import type { LoginNotice } from '../constants'
import { createSessionApi } from '../services/session.api'
import { readStorage, writeStorage } from '../utils/storage'

const CHANNEL_NAME = 'lb-customer-auth'
const REFRESH_LOCK = 'lb-customer-auth-refresh'
const REFRESH_MARGIN_MS = 60_000
const RETRY_DELAY_MS = 15_000

type AuthMessage =
  | { type: 'session', accessToken: string, user: AuthUser }
  | { type: 'token', accessToken: string }
  | { type: 'user', user: AuthUser }
  | { type: 'logout' }

function isExpiringSoon(token: string) {
  const expiry = getTokenExpiry(token)
  return !expiry || expiry - Date.now() < REFRESH_MARGIN_MS
}

const statusOf = (error: unknown) => parseApiError(error).status

/**
 * Sesion del cliente en la tienda. Misma mecanica que el panel (auth.txt 5 y 7)
 * pero independiente: otra cookie, sin validar roles y sin forzar login, porque
 * la tienda es publica. Sin timeout por inactividad (la sesion dura 7 dias).
 */
export const useCustomerAuthStore = defineStore('customer-auth', () => {
  const router = useRouter()
  const { public: { apiBase } } = useRuntimeConfig()
  const api = createSessionApi(apiBase)

  // El accessToken vive solo en memoria; el refreshToken en cookie httpOnly
  const accessToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))

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
    writeStorage(SESSION_HINT_KEY, null)
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
        if (statusOf(error) !== 401 && accessToken.value && expiry > Date.now()) {
          scheduleRefresh(accessToken.value, RETRY_DELAY_MS)
        }
      })
    }, delay)
  }

  function isOnAccountRoute() {
    return router.currentRoute.value.path.startsWith(CUSTOMER_AUTH_ROUTES.account)
  }

  /** Fuera de /cuenta se sigue navegando como visitante; dentro, se pide login. */
  async function leaveAccountArea(notice?: LoginNotice) {
    if (!isOnAccountRoute()) return
    const current = router.currentRoute.value
    await router.push({
      path: CUSTOMER_AUTH_ROUTES.login,
      query: { redirect: current.fullPath, notice },
    })
  }

  /** La sesion murio en el servidor (refresh 401). */
  function expireSession() {
    const wasAuthenticated = isAuthenticated.value
    clearSession()
    broadcast({ type: 'logout' })
    if (wasAuthenticated) void leaveAccountArea('session-expired')
  }

  /**
   * El backend rota el refreshToken en cada uso y revoca TODAS las sesiones si
   * detecta un token reutilizado: una sola promesa por pestaña y un Web Lock
   * compartido entre pestañas.
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
        if (statusOf(error) === 401) expireSession()
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

  /** Si habia carrito de invitado, se une al de la cuenta (CUENTA-CLIENTE 3.2). */
  async function mergeGuestCart(token: string) {
    const guestToken = readStorage(GUEST_CART_TOKEN_KEY)
    if (!guestToken) return
    try {
      await api.mergeCart(token, guestToken)
      writeStorage(GUEST_CART_TOKEN_KEY, null)
    }
    catch {
      // No bloquea el login: el carrito de invitado se conserva para otro intento
    }
  }

  async function startSession(session: SessionResponse) {
    user.value = session.user
    setAccessToken(session.accessToken)
    initialized.value = true
    writeStorage(SESSION_HINT_KEY, '1')
    broadcast({ type: 'session', ...session })
    await mergeGuestCart(session.accessToken)
  }

  async function login(credentials: LoginRequest) {
    await startSession(await api.login(credentials))
  }

  async function register(body: RegisterRequest) {
    await startSession(await api.register(body))
  }

  /** Recupera la sesion al cargar la tienda; si falla, se sigue como visitante. */
  function restoreSession(): Promise<void> {
    if (initialized.value || import.meta.server) return Promise.resolve()

    if (!readStorage(SESSION_HINT_KEY)) {
      initialized.value = true
      return Promise.resolve()
    }

    restoring ??= (async () => {
      try {
        await refresh()
        user.value = await api.me(accessToken.value!)
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

  /** Tras editar el perfil: actualiza el header en todas las pestañas. */
  function setUser(next: AuthUser) {
    user.value = next
    broadcast({ type: 'user', user: next })
  }

  /** Limpia la sesion local y la cookie, sin navegar (p. ej. tras cambiar la contraseña). */
  async function endSession() {
    await api.logout().catch(() => {})
    clearSession()
    broadcast({ type: 'logout' })
  }

  // TODO(carrito): al cerrar sesion, vaciar el carrito que se muestra (era el de la cuenta)
  async function logout() {
    await endSession()
    await router.push(CUSTOMER_AUTH_ROUTES.home)
  }

  /** Lanza si falla: la pantalla muestra el error y la sesion sigue abierta. */
  async function logoutAll() {
    await api.logoutAll()
    clearSession()
    broadcast({ type: 'logout' })
    await router.push({ path: CUSTOMER_AUTH_ROUTES.login, query: { notice: 'logged-out-all' } })
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
    else if (data.type === 'user' && user.value) {
      user.value = data.user
    }
    else if (data.type === 'logout') {
      const wasAuthenticated = isAuthenticated.value
      clearSession()
      if (wasAuthenticated) void leaveAccountArea()
    }
  })

  return {
    accessToken: readonly(accessToken),
    user: readonly(user),
    initialized: readonly(initialized),
    isAuthenticated,
    login,
    register,
    refresh,
    restoreSession,
    setUser,
    endSession,
    logout,
    logoutAll,
  }
})
