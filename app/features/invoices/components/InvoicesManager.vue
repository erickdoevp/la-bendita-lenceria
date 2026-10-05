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
    <UiPageHeader
      title="Mis facturas"
      description="Solicita la factura desde el detalle de un pedido pagado. Cuando la emitamos podrás descargar el PDF y el XML."
    />

    <div
      class="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
      role="tablist"
      aria-label="Filtrar por estado"
    >
      <button
        v-for="tab in INVOICE_TABS"
        :key="tab.status"
        type="button"
        role="tab"
        :aria-selected="list.filters.status === tab.status"
        class="h-9 shrink-0 rounded-xl px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent"
        :class="list.filters.status === tab.status ? 'bg-ink text-surface-raised' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'"
        @click="list.filters.status = tab.status"
      >
        {{ tab.label }}
      </button>
    </div>

    <UiAlert v-if="actionError || list.error">
      {{ actionError ?? list.error }}
      <button
        v-if="list.error"
        type="button"
        class="ml-1 font-medium underline underline-offset-2"
        @click="list.load()"
      >
        Reintentar
      </button>
    </UiAlert>

    <UiPanel>
      <div
        v-if="list.pending && !page"
        class="grid gap-4"
      >
        <UiSkeleton
          v-for="n in 3"
          :key="n"
          class="h-20"
        />
      </div>

      <UiEmptyState
        v-else-if="page && !items.length"
        icon="ph:file-text"
        :title="list.filters.status ? 'No hay facturas con este estado' : 'Aún no has solicitado facturas'"
        description="Entra a un pedido pagado y pulsa «Solicitar factura»."
      />

      <ul
        v-else
        class="-my-5 divide-y divide-line transition-opacity sm:-my-6"
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
    </UiPanel>

    <UiPagination
      v-if="page"
      :page="page.page"
      :total-pages="page.totalPages"
      :total-elements="page.totalElements"
      :disabled="list.pending"
      @change="list.load"
    />
  </div>
</template>
