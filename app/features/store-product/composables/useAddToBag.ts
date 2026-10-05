import { useCartStore } from '~/features/store-cart'
import type { ProductColorOption, ProductVariantOption, StoreProductDetail } from '../types'

export type AddToBagState = 'idle' | 'adding' | 'added' | 'error'

export interface AddToBagRequest {
  product: StoreProductDetail
  variant: ProductVariantOption
  color: ProductColorOption | null
  imageUrl: string | null
  quantity: number
}

/** Agrega la variante a la bolsa; al lograrlo, el panel lateral de la bolsa se abre solo. */
export function useAddToBag() {
  const cart = useCartStore()
  const state = ref<AddToBagState>('idle')
  const error = ref<string | null>(null)
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  async function add({ product, variant, color, imageUrl, quantity }: AddToBagRequest) {
    clearTimeout(resetTimer)
    state.value = 'adding'
    error.value = null
    try {
      await cart.add({
        variantId: variant.id,
        quantity,
        line: {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageUrl,
          colorName: color?.name ?? null,
          colorHex: color?.hex ?? null,
          size: variant.size,
          unitPrice: variant.price,
          compareAtPrice: product.compareAtPrice && product.compareAtPrice > variant.price ? product.compareAtPrice : null,
          stock: variant.stock,
        },
      })
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
