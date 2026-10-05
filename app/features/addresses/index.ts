// API publica del feature addresses (direcciones de entrega del cliente).
// Fuera del feature, importa solo desde aqui.
export { default as AddressesManager } from './components/AddressesManager.vue'
export { default as AddressForm } from './components/AddressForm.vue'
export { MAX_ADDRESSES } from './constants'
export { useAddressesStore } from './stores/addresses.store'
export type { Address } from './types'
