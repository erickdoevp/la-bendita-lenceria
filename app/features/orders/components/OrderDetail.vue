<script setup lang="ts">
import { OrderStockMovements } from '~/features/inventory'
import { useOrderDetail } from '../composables/useOrderDetail'
import { ORDER_ROUTES } from '../constants'
import { useOrdersApi } from '../services'
import type { OrderAction } from '../types'
import { DANGER_ACTIONS, refundableAmount } from '../utils/actions'
import OrderConfirmAction from './OrderConfirmAction.vue'
import OrderCustomerPanel from './OrderCustomerPanel.vue'
import OrderItemsPanel from './OrderItemsPanel.vue'
import OrderNotesPanel from './OrderNotesPanel.vue'
import OrderPaymentPanel from './OrderPaymentPanel.vue'
import OrderShipmentPanel from './OrderShipmentPanel.vue'
import OrderStatusBadge from './OrderStatusBadge.vue'
import OrderStatusForm from './OrderStatusForm.vue'
import PickupCollectForm from './PickupCollectForm.vue'
import RefundForm from './RefundForm.vue'
import ShipmentForm from './ShipmentForm.vue'
import ShipmentStatusForm from './ShipmentStatusForm.vue'

const props = defineProps<{ orderId: string }>()

const api = useOrdersApi()
const { order, payment, shipment, pending, error, paymentError, shipmentError, actions, load } = useOrderDetail(props.orderId)

const action = ref<OrderAction | null>(null)
const notice = ref<string | null>(null)
const movements = ref<{ load: () => Promise<void> } | null>(null)

const paid = computed(() => refundableAmount(payment.value) > 0)
const mainActions = computed(() => actions.value.filter(a => !DANGER_ACTIONS.includes(a) && a !== 'notes'))
const dangerActions = computed(() => actions.value.filter(a => DANGER_ACTIONS.includes(a)))

const modalOpen = computed({
  get: () => action.value !== null,
  set: (value) => {
    if (!value) action.value = null
  },
})

const ACTION_META: Record<OrderAction, { label: string, icon: string, title: string, description?: string }> = {
  'confirm-payment': { label: 'Confirmar pago', icon: 'ph:check-circle', title: 'Confirmar pago' },
  'process': { label: 'Pasar a preparación', icon: 'ph:package', title: 'Pasar a preparación', description: 'Avisa al equipo que la orden se está empacando.' },
  'ship': { label: 'Registrar envío', icon: 'ph:truck', title: 'Registrar envío', description: 'La orden pasará a Enviada.' },
  'ready': { label: 'Lista para recoger', icon: 'ph:storefront', title: 'Lista para recoger' },
  'collected': { label: 'Marcar recogida', icon: 'ph:hand-arrow-down', title: 'Entregar en tienda', description: 'La orden pasará a Entregada.' },
  'shipment-status': { label: 'Actualizar envío', icon: 'ph:map-pin-line', title: 'Actualizar envío' },
  'refund': { label: 'Reembolsar', icon: 'ph:arrow-u-up-left', title: 'Reembolsar', description: 'Devuelve el dinero por el mismo medio de pago.' },
  'cancel': { label: 'Cancelar', icon: 'ph:x-circle', title: 'Cancelar orden' },
  'fail-payment': { label: 'Marcar pago fallido', icon: 'ph:warning-circle', title: 'Marcar pago fallido' },
  'notes': { label: 'Nota interna', icon: 'ph:pencil-simple', title: 'Nota interna', description: 'Solo la ve el equipo.' },
}

function label(item: OrderAction) {
  // Con el pago liquidado, cancelar no devuelve el dinero: que el boton lo diga
  if (item === 'cancel' && paid.value) return 'Cancelar sin reembolso'
  return ACTION_META[item].label
}

onMounted(load)

function open(next: OrderAction) {
  notice.value = null
  action.value = next
}

async function onDone(message: string) {
  action.value = null
  notice.value = message
  await load()
  void movements.value?.load()
}
</script>

<template>
  <div class="grid gap-8">
    <div class="grid gap-3">
      <UButton
        :to="ORDER_ROUTES.list"
        color="neutral"
        variant="link"
        icon="ph:arrow-left"
        label="Órdenes"
        class="justify-self-start px-0"
      />

      <UPageHeader
        :description="order ? `Creada el ${formatDateTime(order.createdAt)} · Actualizada el ${formatDateTime(order.updatedAt)}` : undefined"
      >
        <template #title>
          <span class="flex flex-wrap items-center gap-3">
            <span class="font-mono">{{ order?.orderNumber ?? 'Orden' }}</span>
            <OrderStatusBadge
              v-if="order"
              :status="order.status"
            />
          </span>
        </template>
        <template #links>
          <UButton
            color="neutral"
            variant="ghost"
            icon="ph:arrow-clockwise"
            :loading="pending && Boolean(order)"
            :disabled="!order"
            label="Actualizar"
            @click="load"
          />
        </template>
      </UPageHeader>
    </div>

    <UAlert
      v-if="error"
      color="error"
      icon="ph:warning-circle"
      :title="error.status === 404 ? 'Esta orden no existe.' : error.message"
      :actions="error.status !== 404 ? retryAction(load) : undefined"
      orientation="horizontal"
    />

    <div
      v-else-if="pending && !order"
      class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
      role="status"
      aria-label="Cargando orden"
    >
      <USkeleton
        class="h-80 rounded-lg"
      />
      <div class="grid content-start gap-6">
        <USkeleton
          class="h-44 rounded-lg"
        />
        <USkeleton
          class="h-36 rounded-lg"
        />
      </div>
    </div>

    <template v-else-if="order">
      <UAlert
        v-if="notice"
        color="primary"
        icon="ph:info"
        :title="notice"
      />

      <section
        v-if="mainActions.length || dangerActions.length"
        class="flex flex-wrap items-center gap-2 rounded-lg border border-default bg-default p-4"
        aria-label="Acciones de la orden"
      >
        <UButton
          v-for="(item, index) in mainActions"
          :key="item"
          :color="index === 0 ? 'primary' : 'neutral'"
          :variant="index === 0 ? 'solid' : 'outline'"
          :icon="ACTION_META[item].icon"
          :disabled="pending"
          :label="label(item)"
          @click="open(item)"
        />
        <span
          v-if="!mainActions.length"
          class="text-sm text-muted"
        >No hay pasos pendientes para esta orden.</span>
        <div class="flex flex-wrap gap-2 sm:ml-auto">
          <UButton
            v-for="item in dangerActions"
            :key="item"
            color="error"
            variant="soft"
            :icon="ACTION_META[item].icon"
            :disabled="pending"
            :label="label(item)"
            @click="open(item)"
          />
        </div>
      </section>

      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div class="grid gap-6">
          <OrderItemsPanel :order="order" />
          <OrderStockMovements
            ref="movements"
            :order-id="order.id"
          />
        </div>
        <div class="grid gap-6">
          <OrderCustomerPanel :order="order" />
          <OrderPaymentPanel
            :payment="payment"
            :error="paymentError"
          />
          <OrderShipmentPanel
            v-if="!order.pickup"
            :shipment="shipment"
            :error="shipmentError"
          />
          <OrderNotesPanel
            :order="order"
            @edit="open('notes')"
          />
        </div>
      </div>

      <UModal
        v-model:open="modalOpen"
        :title="action ? ACTION_META[action].title : ''"
        :description="action ? ACTION_META[action].description : undefined"
      >
        <template #body>
          <OrderStatusForm
            v-if="action === 'process' || action === 'cancel' || action === 'notes'"
            :order="order"
            :mode="action"
            :paid="paid"
            @done="onDone"
            @cancel="action = null"
          />
          <ShipmentForm
            v-else-if="action === 'ship'"
            :order="order"
            @done="onDone"
            @cancel="action = null"
          />
          <ShipmentStatusForm
            v-else-if="action === 'shipment-status' && shipment"
            :shipment="shipment"
            @done="onDone"
            @cancel="action = null"
          />
          <RefundForm
            v-else-if="action === 'refund' && payment"
            :order="order"
            :payment="payment"
            @done="onDone"
            @cancel="action = null"
          />
          <PickupCollectForm
            v-else-if="action === 'collected'"
            :order="order"
            @done="onDone"
            @cancel="action = null"
          />
          <OrderConfirmAction
            v-else-if="action === 'ready'"
            message="Se genera el código de recogida que la clienta presentará en tienda."
            confirm-label="Marcar lista"
            done-message="Orden lista para recoger. Ya se generó el código."
            icon="ph:storefront"
            :run="() => api.markReadyForPickup(order!.id)"
            @done="onDone"
            @cancel="action = null"
          />
          <OrderConfirmAction
            v-else-if="action === 'confirm-payment' && payment"
            :message="`Confirma solo si ya recibiste ${formatMoney(payment.amount)}. La orden pasará a Pagada y se descontará el stock.`"
            confirm-label="Sí, confirmar pago"
            done-message="Pago confirmado. La orden quedó como pagada."
            icon="ph:check-circle"
            :run="() => api.confirmPayment(payment!.id)"
            @done="onDone"
            @cancel="action = null"
          />
          <OrderConfirmAction
            v-else-if="action === 'fail-payment' && payment"
            message="El pago quedará como fallido. La orden sigue pendiente de pago y la clienta puede volver a intentarlo."
            confirm-label="Marcar fallido"
            done-message="Pago marcado como fallido."
            icon="ph:warning-circle"
            variant="danger"
            :run="() => api.failPayment(payment!.id)"
            @done="onDone"
            @cancel="action = null"
          />
      
        </template>
      </UModal>
    </template>
  </div>
</template>
