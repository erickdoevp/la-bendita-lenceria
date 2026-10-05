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
    <NuxtLink
      :to="ACCOUNT_ROUTES.orders"
      class="inline-flex items-center gap-1.5 justify-self-start text-sm text-ink-muted transition-colors hover:text-ink"
    >
      <Icon
        name="ph:arrow-left"
        class="size-4"
        aria-hidden="true"
      />
      Mis pedidos
    </NuxtLink>

    <div
      v-if="pending && !order"
      class="grid gap-4"
    >
      <UiSkeleton class="h-10 w-64" />
      <UiSkeleton class="h-64 rounded-2xl" />
    </div>

    <UiEmptyState
      v-else-if="error"
      icon="ph:package"
      :title="error.status === 404 || error.status === 403 ? 'No encontramos este pedido' : 'No pudimos cargar el pedido'"
      :description="error.status === 404 || error.status === 403 ? 'Puede que el enlace esté mal o que el pedido no sea de tu cuenta.' : error.message"
    >
      <UiButton
        v-if="error.status !== 404 && error.status !== 403"
        variant="secondary"
        icon="ph:arrow-clockwise"
        @click="load"
      >
        Reintentar
      </UiButton>
    </UiEmptyState>

    <template v-else-if="order">
      <header class="grid gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="font-mono text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            {{ order.orderNumber }}
          </h1>
          <OrderStatusBadge :status="order.status" />
        </div>
        <p class="text-ink-muted">
          Pedido del {{ formatDateTime(order.createdAt) }}
        </p>
      </header>

      <!-- Pendiente de pago: pagar o cancelar -->
      <section
        v-if="canPay"
        class="grid gap-4 rounded-2xl border border-warning/40 bg-warning-soft p-5 sm:flex sm:items-center sm:justify-between"
      >
        <div class="grid gap-1">
          <p class="font-medium text-ink">
            Este pedido está pendiente de pago
          </p>
          <p class="text-sm text-ink-muted">
            Apartamos tus prendas mientras completas el pago.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <template v-if="confirmingCancel">
            <span class="text-sm text-ink-muted">¿Cancelar el pedido?</span>
            <UiButton
              variant="danger"
              size="sm"
              :loading="cancelling"
              @click="onCancel"
            >
              Sí, cancelar
            </UiButton>
            <UiButton
              variant="ghost"
              size="sm"
              :disabled="cancelling"
              @click="confirmingCancel = false"
            >
              No
            </UiButton>
          </template>
          <template v-else>
            <UiButton
              :to="CHECKOUT_PAYMENT_ROUTE(order.id)"
              icon="ph:credit-card"
            >
              Pagar {{ formatMoney(order.total) }}
            </UiButton>
            <UiButton
              variant="ghost"
              @click="confirmingCancel = true"
            >
              Cancelar pedido
            </UiButton>
          </template>
        </div>
      </section>

      <UiAlert v-if="actionError">
        {{ actionError }}
      </UiAlert>

      <UiAlert
        v-if="order.status === 'CANCELLED'"
        tone="info"
      >
        Este pedido fue cancelado. Si lo cancelaste tú, los productos volvieron a tu carrito.
      </UiAlert>
      <UiAlert
        v-else-if="order.status === 'REFUNDED'"
        tone="info"
      >
        Este pedido fue reembolsado.
      </UiAlert>

      <UiPanel v-if="showProgress">
        <MyOrderProgress :order="order" />
      </UiPanel>

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
