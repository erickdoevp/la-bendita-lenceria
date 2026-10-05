import type { PublicFetch } from '~/features/store-catalog'
import { USE_CART_MOCKS } from '../constants'
import { cartMock } from '../mocks/cart.mock'
import type { AddToCartInput, Cart, CartLine } from '../types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Endpoints del carrito (FLUJO-CHECKOUT-Y-PAGOS, seccion 4).
 * TODO al integrar:
 * - Con sesion: GET /cart, POST /cart/items { variantId, quantity }, PATCH y DELETE /cart/items/{id}
 * - Invitada: POST /public/cart crea el carrito y devuelve guestToken (guardarlo en GUEST_CART_TOKEN_KEY);
 *   luego /public/cart/{guestToken}/... Al iniciar sesion customer-auth ya llama POST /cart/merge
 * - Mapear CartResponseDto -> Cart (items[].productName, sizeName, subtotal...). Falta que el DTO
 *   traiga slug, stock disponible y precio anterior: pedirlos al backend
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

    /**
     * Despues de crear la orden. El backend ya movio el carrito a CHECKOUT: GET /cart devuelve
     * uno vacio (con sesion) o 404 (invitada, hay que crear otro con POST /public/cart).
     */
    afterCheckout: (): Promise<Cart> =>
      USE_CART_MOCKS ? mock(cartMock.checkout, 0) : publicFetch<Cart>('/cart'),

    /** La orden se cancelo o expiro: el backend regresa el carrito a ACTIVE. */
    afterOrderCanceled: (): Promise<Cart> =>
      USE_CART_MOCKS ? mock(cartMock.release, 0) : publicFetch<Cart>('/cart'),

    /** Deshacer: con el backend real es volver a agregar la variante. */
    restore: (line: CartLine, index: number): Promise<Cart> =>
      USE_CART_MOCKS
        ? mock(() => cartMock.restore(line, index))
        : publicFetch<Cart>('/cart/items', { method: 'POST', body: { variantId: line.variantId, quantity: line.quantity } }),
  }
}
