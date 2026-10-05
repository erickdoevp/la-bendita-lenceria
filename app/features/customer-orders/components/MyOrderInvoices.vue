<script setup lang="ts">
import { ACCOUNT_ROUTES } from '~/features/account'
import { InvoiceRequestForm, InvoiceSummary, useInvoicesApi } from '~/features/invoices'
import type { Invoice } from '~/features/invoices'
import type { Order } from '~/features/orders'

const props = defineProps<{
  order: Order
  invoices: Invoice[]
  canInvoice: boolean
}>()
const emit = defineEmits<{ requested: [invoice: Invoice], updated: [invoice: Invoice] }>()

const api = useInvoicesApi()
const modalOpen = ref(false)
const cancellingId = ref<string | null>(null)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)

const paid = computed(() => !['PENDING_PAYMENT', 'CANCELLED', 'REFUNDED'].includes(props.order.status))

function onRequested(invoice: Invoice) {
  modalOpen.value = false
  notice.value = `Recibimos tu solicitud (${invoice.folio}). Te avisaremos cuando la factura esté lista.`
  emit('requested', invoice)
}

async function onCancel(invoice: Invoice) {
  cancellingId.value = invoice.id
  error.value = null
  notice.value = null
  try {
    emit('updated', await api.cancelMine(invoice.id))
  }
  catch (e) {
    error.value = parseApiError(e).message
  }
  finally {
    cancellingId.value = null
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="grid gap-1">
          <h2 class="font-semibold tracking-tight text-highlighted">
            Factura
          </h2>
          <p
            v-if="!paid"
            class="text-sm leading-relaxed text-muted"
          >
            Podrás facturar este pedido cuando esté pagado.
          </p>
        </div>
        <UButton
          v-if="canInvoice"
          size="sm"
          icon="ph:file-plus"
          :label="invoices.length ? 'Solicitar otra' : 'Solicitar factura'"
          @click="modalOpen = true"
        />
      </div>
    </template>

    <div class="grid gap-4">
      <UAlert
        v-if="error"
        color="error"
        icon="ph:warning-circle"
        :title="error"
      />
      <UAlert
        v-if="notice"
        color="primary"
        icon="ph:info"
        :title="notice"
      />

      <p
        v-if="!invoices.length"
        class="text-sm text-muted"
      >
        {{ paid ? 'Este pedido aún no tiene factura.' : 'Sin factura.' }}
      </p>
      <ul
        v-else
        class="-my-1 divide-y divide-default"
      >
        <li
          v-for="invoice in invoices"
          :key="invoice.id"
          class="py-4 first:pt-1 last:pb-1"
        >
          <InvoiceSummary
            :invoice="invoice"
            hide-order
            :cancelling="cancellingId === invoice.id"
            @cancel="onCancel(invoice)"
          />
        </li>
      </ul>

      <NuxtLink
        :to="ACCOUNT_ROUTES.invoices"
        class="justify-self-start text-sm text-primary underline-offset-2 hover:underline"
      >
        Ver todas mis facturas
      </NuxtLink>
    </div>

    <UModal
      v-model:open="modalOpen"
      title="Solicitar factura"
      :description="`Pedido ${order.orderNumber} · ${formatMoney(order.total)}`"
    >
      <template #body>
        <InvoiceRequestForm
          :order-id="order.id"
          @requested="onRequested"
          @cancel="modalOpen = false"
        />
    
      </template>
    </UModal>
  </UCard>
</template>
