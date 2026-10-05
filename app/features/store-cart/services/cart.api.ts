import type { PublicFetch } from '~/features/store-catalog'
import { USE_CART_MOCKS } from '../constants'
import { cartMock } from '../mocks/cart.mock'
import type { AddToCartInput, Cart, CartLine } from '../types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Endpoints del carrito.
 * TODO al integrar:
 * - Invitada: mandar GUEST_CART_TOKEN_KEY (customer-auth) y guardar el token que regrese el backend
 * - Con sesion: Authorization Bearer; al iniciar sesion customer-auth ya llama POST /cart/merge
 * - GET /cart, POST /cart/items { variantId, quantity }, PATCH /cart/items/{id}, DELETE /cart/items/{id}
 * - Mapear CartResponseDto -> Cart (precio final por variante, stock disponible e imagen del color)
 */
export function createCartApi(publicFetch: PublicFetch) {
  // Los errores del mock se leen igual que los del backend con parseApiError
  async function mock(run: () => Cart, ms = 250): Promise<Cart> {
    await delay(ms)
    return structuredClone(run())
  }

  return {
    get: (): Promise<Cart> =>
      USE_CART_MOCKS ? mock(cartMock.get, 150) : publicFetch<Cart>('/cart'),

    add: (input: AddToCartInput): Promise<Cart> =>
      USE_CART_MOCKS
        ? mock(() => cartMock.add(input), 450)
        : publicFetch<Cart>('/cart/items', { method: 'POST', body: { variantId: input.variantId, quantity: input.quantity } }),

    update: (lineId: string, quantity: number): Promise<Cart> =>
      USE_CART_MOCKS
        ? mock(() => cartMock.update(lineId, quantity))
        : publicFetch<Cart>(`/cart/items/${lineId}`, { method: 'PATCH', body: { quantity } }),

    remove: (lineId: string): Promise<Cart> =>
      USE_CART_MOCKS
        ? mock(() => cartMock.remove(lineId))
        : publicFetch<Cart>(`/cart/items/${lineId}`, { method: 'DELETE' }),

    /** Deshacer: con el backend real es volver a agregar la variante. */
    restore: (line: CartLine, index: number): Promise<Cart> =>
      USE_CART_MOCKS
        ? mock(() => cartMock.restore(line, index))
        : publicFetch<Cart>('/cart/items', { method: 'POST', body: { variantId: line.variantId, quantity: line.quantity } }),
  }
}
