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
  <UiPanel
    title="Factura"
    :description="paid ? undefined : 'Podrás facturar este pedido cuando esté pagado.'"
  >
    <template
      v-if="canInvoice"
      #actions
    >
      <UiButton
        size="sm"
        icon="ph:file-plus"
        @click="modalOpen = true"
      >
        {{ invoices.length ? 'Solicitar otra' : 'Solicitar factura' }}
      </UiButton>
    </template>

    <div class="grid gap-4">
      <UiAlert v-if="error">
        {{ error }}
      </UiAlert>
      <UiAlert
        v-if="notice"
        tone="info"
      >
        {{ notice }}
      </UiAlert>

      <p
        v-if="!invoices.length"
        class="text-sm text-ink-muted"
      >
        {{ paid ? 'Este pedido aún no tiene factura.' : 'Sin factura.' }}
      </p>
      <ul
        v-else
        class="-my-1 divide-y divide-line"
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
        class="justify-self-start text-[13px] text-accent underline-offset-2 hover:underline"
      >
        Ver todas mis facturas
      </NuxtLink>
    </div>

    <UiModal
      v-model:open="modalOpen"
      title="Solicitar factura"
      :description="`Pedido ${order.orderNumber} · ${formatMoney(order.total)}`"
    >
      <InvoiceRequestForm
        :order-id="order.id"
        @requested="onRequested"
        @cancel="modalOpen = false"
      />
    </UiModal>
  </UiPanel>
</template>
