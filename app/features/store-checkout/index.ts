// API publica del feature store-checkout (pago de la tienda: /pagar y su confirmacion).
// Fuera del feature, importa solo desde aqui.
export { default as CheckoutHeader } from './components/CheckoutHeader.vue'
export { default as CheckoutResultView } from './components/CheckoutResultView.vue'
export { default as CheckoutView } from './components/CheckoutView.vue'
export { CHECKOUT_RESULT_PATH } from './composables/useCheckoutForm'
export { useCheckoutStore } from './stores/checkout.store'
export type { CheckoutPayment, CheckoutPaymentMethod, ShippingOption, StoreLocation } from './types'
export type { PaymentGateway } from './utils/payment-gateway'
