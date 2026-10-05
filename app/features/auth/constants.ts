export const AUTH_ROUTES = {
  login: '/admin/login',
  home: '/admin',
} as const

/** En dev el backend no valida Turnstile, pero exige un string no vacio. */
export const DEV_TURNSTILE_TOKEN = 'dev'
