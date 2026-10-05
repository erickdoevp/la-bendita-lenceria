import { ACTIVE_ORDER_KEY, GUEST_ORDERS_KEY } from '../constants'
import type { OrderAccess } from '../types'

// El almacenamiento puede no existir o lanzar (modo privado, cookies bloqueadas)
function readJson<T>(storage: () => Storage, key: string): T | null {
  try {
    const raw = storage().getItem(key)
    return raw ? JSON.parse(raw) as T : null
  }
  catch {
    return null
  }
}

function writeJson(storage: () => Storage, key: string, value: unknown) {
  try {
    if (value === null) storage().removeItem(key)
    else storage().setItem(key, JSON.stringify(value))
  }
  catch {
    // Sin almacenamiento solo se pierde poder retomar el pedido al recargar
  }
}

const local = () => localStorage
const session = () => sessionStorage

/**
 * accessToken de los pedidos de invitada, por orderId. Va en localStorage (no en la URL)
 * porque es la unica credencial del pedido y el backend no la vuelve a entregar.
 */
export function rememberGuestOrder(orderId: string, accessToken: string) {
  const tokens = readJson<Record<string, string>>(local, GUEST_ORDERS_KEY) ?? {}
  writeJson(local, GUEST_ORDERS_KEY, { ...tokens, [orderId]: accessToken })
}

export function guestAccessToken(orderId: string): string | null {
  return readJson<Record<string, string>>(local, GUEST_ORDERS_KEY)?.[orderId] ?? null
}

/** Como consultar una orden: con el token de invitada si lo tenemos, si no como clienta. */
export function orderAccess(orderId: string): OrderAccess {
  const accessToken = guestAccessToken(orderId)
  return accessToken ? { kind: 'guest', orderId, accessToken } : { kind: 'customer', orderId }
}

/** Orden en curso de esta pestana (sessionStorage: no se cruza entre pestanas). */
export const readActiveOrderId = () => readJson<string>(session, ACTIVE_ORDER_KEY)
export const writeActiveOrderId = (orderId: string | null) => writeJson(session, ACTIVE_ORDER_KEY, orderId)
