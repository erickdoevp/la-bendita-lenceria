// API publica del feature orders. Fuera del feature, importa solo desde aqui.
export { default as OrderDetail } from './components/OrderDetail.vue'
export { default as OrdersManager } from './components/OrdersManager.vue'
export { default as OrderStatusBadge } from './components/OrderStatusBadge.vue'
export { ORDER_ROUTES, ORDER_STATUS_LABELS } from './constants'
export { useOrdersListStore } from './stores/orders-list.store'
export type { Order, OrderStatus, Payment, Shipment } from './types'
// Etiquetas y utilidades que tambien usa "Mis pedidos" (feature customer-orders)
export { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_CLASSES, PAYMENT_STATUS_LABELS } from './constants'
export { addressLines, itemsCount } from './utils/customer'
export type { OrderItem } from './types'
