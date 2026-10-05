<script setup lang="ts">
import { INVOICE_TABS } from '../constants'
import { useInvoicesStore } from '../stores/invoices.store'
import type { Invoice } from '../types'
import InvoiceSummary from './InvoiceSummary.vue'

const store = useInvoicesStore()
const list = store.list
const cancellingId = ref<string | null>(null)
const actionError = ref<string | null>(null)

const page = computed(() => list.data)
const statusTab = useSelectAll(list.filters, 'status')
const tabs = INVOICE_TABS.map(tab => ({ label: tab.label, value: tab.status || SELECT_ALL }))
const items = computed(() => page.value?.items ?? [])

onMounted(() => list.load(0))
watch(() => list.filters.status, () => list.load(0))

async function onCancel(invoice: Invoice) {
  cancellingId.value = invoice.id
  actionError.value = null
  try {
    await store.cancel(invoice.id)
  }
  catch (error) {
    actionError.value = parseApiError(error).message
  }
  finally {
    cancellingId.value = null
  }
}
</script>

<template>
  <div class="grid gap-6">
    <UPageHeader
      title="Mis facturas"
      description="Solicita la factura desde el detalle de un pedido pagado. Cuando la emitamos podrás descargar el PDF y el XML."
    />

    <UTabs
      v-model="statusTab"
      :items="tabs"
      :content="false"
      variant="pill"
      color="neutral"
      aria-label="Filtrar por estado"
      class="overflow-x-auto"
    />

    <UAlert
      v-if="actionError || list.error"
      color="error"
      icon="ph:warning-circle"
      :title="actionError ?? list.error ?? undefined"
      :actions="list.error ? retryAction(() => list.load()) : undefined"
      orientation="horizontal"
    />

    <UCard>
      <div
        v-if="list.pending && !page"
        class="grid gap-4"
      >
        <USkeleton
          v-for="n in 3"
          :key="n"
          class="h-20"
        />
      </div>

      <UEmpty
        v-else-if="page && !items.length"
        icon="ph:file-text"
        :title="list.filters.status ? 'No hay facturas con este estado' : 'Aún no has solicitado facturas'"
        description="Entra a un pedido pagado y pulsa «Solicitar factura»."
      />

      <ul
        v-else
        class="-my-5 divide-y divide-default transition-opacity sm:-my-6"
        :class="list.pending && 'opacity-60'"
      >
        <li
          v-for="invoice in items"
          :key="invoice.id"
          class="py-5 sm:py-6"
        >
          <InvoiceSummary
            :invoice="invoice"
            :cancelling="cancellingId === invoice.id"
            @cancel="onCancel(invoice)"
          />
        </li>
      </ul>
    </UCard>

    <PagePagination
      v-if="page"
      :page="page"
      :disabled="list.pending"
      @change="list.load"
    />
  </div>
</template>
