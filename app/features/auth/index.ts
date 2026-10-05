// API publica del feature auth. Fuera del feature, importa solo desde aqui.
export { default as AdminLoginForm } from './components/AdminLoginForm.vue'
export { default as AdminLogoutButton } from './components/AdminLogoutButton.vue'
export { useAuthFetch } from './composables/useAuthFetch'
export { useAuthStore } from './stores/auth.store'
export { AUTH_ROUTES } from './constants'
export { getSafeAdminRedirect } from './utils/redirect'
// Piezas reutilizadas por la sesion de la tienda (feature customer-auth)
export { default as TurnstileWidget } from './components/TurnstileWidget.vue'
export { DEV_TURNSTILE_TOKEN } from './constants'
export { getTokenExpiry } from './utils/jwt'
