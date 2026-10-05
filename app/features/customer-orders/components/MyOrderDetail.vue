<script setup lang="ts">
import { ACCOUNT_ROUTES } from '~/features/account'
import { OrderStatusBadge } from '~/features/orders'
import { useMyOrderDetail } from '../composables/useMyOrderDetail'
import { CHECKOUT_PAYMENT_ROUTE } from '../constants'
import MyOrderDelivery from './MyOrderDelivery.vue'
import MyOrderInvoices from './MyOrderInvoices.vue'
import MyOrderItems from './MyOrderItems.vue'
import MyOrderPayment from './MyOrderPayment.vue'
import MyOrderProgress from './MyOrderProgress.vue'

const props = defineProps<{ orderId: string }>()

const { order, payment, invoices, pending, error, canInvoice, canPay, load, cancel, addInvoice, replaceInvoice } = useMyOrderDetail(props.orderId)

const confirmingCancel = ref(false)
const cancelling = ref(false)
const actionError = ref<string | null>(null)

const showProgress = computed(() => order.value && !['PENDING_PAYMENT', 'CANCELLED', 'REFUNDED'].includes(order.value.status))

onMounted(load)

async function onCancel() {
  cancelling.value = true
  actionError.value = null
  try {
    await cancel()
    confirmingCancel.value = false
  }
  catch (e) {
    actionError.value = parseApiError(e).message
  }
  finally {
    cancelling.value = false
  }
}
</script>

<template>
  <div class="grid gap-6">
    <UButton
      :to="ACCOUNT_ROUTES.orders"
      color="neutral"
      variant="link"
      icon="ph:arrow-left"
      label="Mis pedidos"
      class="justify-self-start px-0"
    />

    <div
      v-if="pending && !order"
      class="grid gap-4"
    >
      <USkeleton
        class="h-10 w-64"
      />
      <USkeleton
        class="h-64 rounded-lg"
      />
    </div>

    <UEmpty
      v-else-if="error"
      icon="ph:package"
      :title="error.status === 404 || error.status === 403 ? 'No encontramos este pedido' : 'No pudimos cargar el pedido'"
      :description="error.status === 404 || error.status === 403 ? 'Puede que el enlace esté mal o que el pedido no sea de tu cuenta.' : error.message"
    >
      <template #actions>
        <UButton
          v-if="error.status !== 404 && error.status !== 403"
          color="neutral"
          variant="outline"
          icon="ph:arrow-clockwise"
          label="Reintentar"
          @click="load"
        />
    
      </template>
    </UEmpty>

    <template v-else-if="order">
      <header class="grid gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="font-mono text-2xl font-semibold tracking-tight text-highlighted md:text-3xl">
            {{ order.orderNumber }}
          </h1>
          <OrderStatusBadge :status="order.status" />
        </div>
        <p class="text-muted">
          Pedido del {{ formatDateTime(order.createdAt) }}
        </p>
      </header>

      <!-- Pendiente de pago: pagar o cancelar -->
      <section
        v-if="canPay"
        class="grid gap-4 rounded-lg border border-warning/40 bg-warning/10 p-5 sm:flex sm:items-center sm:justify-between"
      >
        <div class="grid gap-1">
          <p class="font-medium text-highlighted">
            Este pedido está pendiente de pago
          </p>
          <p class="text-sm text-muted">
            Apartamos tus prendas mientras completas el pago.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <template v-if="confirmingCancel">
            <span class="text-sm text-muted">¿Cancelar el pedido?</span>
            <UButton
              color="error"
              variant="soft"
              size="sm"
              :loading="cancelling"
              label="Sí, cancelar"
              @click="onCancel"
            />
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              :disabled="cancelling"
              label="No"
              @click="confirmingCancel = false"
            />
          </template>
          <template v-else>
            <UButton
              :to="CHECKOUT_PAYMENT_ROUTE(order.id)"
              icon="ph:credit-card"
            >
              Pagar {{ formatMoney(order.total) }}
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              label="Cancelar pedido"
              @click="confirmingCancel = true"
            />
          </template>
        </div>
      </section>

      <UAlert
        v-if="actionError"
        color="error"
        icon="ph:warning-circle"
        :title="actionError"
      />

      <UAlert
        v-if="order.status === 'CANCELLED'"
        color="primary"
        icon="ph:info"
        title="Este pedido fue cancelado. Si lo cancelaste tú, los productos volvieron a tu carrito."
      />
      <UAlert
        v-else-if="order.status === 'REFUNDED'"
        color="primary"
        icon="ph:info"
        title="Este pedido fue reembolsado."
      />

      <UCard
        v-if="showProgress"
      >
        <MyOrderProgress :order="order" />
      </UCard>

      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <MyOrderItems :order="order" />
        <div class="grid gap-6">
          <MyOrderDelivery :order="order" />
          <MyOrderPayment :payment="payment" />
        </div>
      </div>

      <MyOrderInvoices
        :order="order"
        :invoices="invoices"
        :can-invoice="canInvoice"
        @requested="addInvoice"
        @updated="replaceInvoice"
      />
    </template>
  </div>
</template>
