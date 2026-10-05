// API publica del feature store-cart (bolsa de compras y su panel lateral).
// Fuera del feature, importa solo desde aqui.
export { default as CartButton } from './components/CartButton.vue'
export { default as CartSlideover } from './components/CartSlideover.vue'
export { FREE_SHIPPING_THRESHOLD } from './constants'
export { useCartStore } from './stores/cart.store'
export type { AddToCartInput, Cart, CartLine, CartSummary } from './types'
