/** Devuelve el "exp" del JWT en milisegundos, o null si no se puede leer. */
export function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const { exp } = JSON.parse(json) as { exp?: number }
    return typeof exp === 'number' ? exp * 1000 : null
  }
  catch {
    return null
  }
}
