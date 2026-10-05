import type { ProductVariantOption } from '../types'

export type AddToBagState = 'idle' | 'adding' | 'added' | 'error'

/**
 * Agrega la variante a la bolsa.
 * TODO: reemplazar por el store del carrito (POST /cart/items, con GUEST_CART_TOKEN_KEY
 * para clientas sin sesion). Por ahora solo simula la peticion para mostrar los estados.
 */
export function useAddToBag() {
  const state = ref<AddToBagState>('idle')
  const error = ref<string | null>(null)
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  async function add(variant: ProductVariantOption, quantity: number) {
    clearTimeout(resetTimer)
    state.value = 'adding'
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (quantity > variant.stock) {
        throw new Error(variant.stock === 1 ? 'Solo queda 1 pieza en esta talla.' : `Solo quedan ${variant.stock} piezas en esta talla.`)
      }
      state.value = 'added'
      resetTimer = setTimeout(() => (state.value = 'idle'), 4000)
    }
    catch (e) {
      state.value = 'error'
      error.value = e instanceof Error ? e.message : parseApiError(e).message
    }
  }

  onBeforeUnmount(() => clearTimeout(resetTimer))

  return { state, error, add }
}
