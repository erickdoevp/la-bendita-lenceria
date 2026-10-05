<script setup lang="ts">
import { ACCOUNT_ROUTES } from '~/features/account'
import { usoCfdiLabel } from '../constants'
import type { Invoice } from '../types'
import InvoiceStatusBadge from './InvoiceStatusBadge.vue'

const props = defineProps<{
  invoice: Invoice
  /** En el detalle del pedido no se repite el enlace al pedido. */
  hideOrder?: boolean
  cancelling?: boolean
}>()
const emit = defineEmits<{ cancel: [] }>()

const confirming = ref(false)

watch(() => props.cancelling, (value, previous) => {
  if (previous && !value) confirming.value = false
})
</script>

<template>
  <article class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
    <div class="grid min-w-0 gap-1.5">
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-mono text-sm font-medium text-highlighted">{{ invoice.folio }}</span>
        <InvoiceStatusBadge :status="invoice.status" />
      </div>
      <p class="truncate text-sm text-highlighted">
        <span class="font-mono">{{ invoice.rfc }}</span> · {{ invoice.razonSocial }}
      </p>
      <p class="text-xs text-muted">
        <template v-if="!hideOrder">
          Pedido
          <NuxtLink
            :to="ACCOUNT_ROUTES.orderDetail(invoice.orderId)"
            class="font-mono text-primary underline-offset-2 hover:underline"
          >{{ invoice.orderNumber }}</NuxtLink> ·
        </template>
        {{ usoCfdiLabel(invoice.usoCFDI) }} · Solicitada el {{ formatDateTime(invoice.createdAt) }}
      </p>
      <p
        v-if="invoice.status === 'PENDING'"
        class="text-xs text-muted"
      >
        La estamos generando. Te avisaremos cuando esté lista para descargar.
      </p>
      <p
        v-else-if="invoice.status === 'STAMPED' && invoice.stampedAt"
        class="text-xs text-muted"
      >
        Emitida el {{ formatDateTime(invoice.stampedAt) }}
      </p>
      <p
        v-else-if="invoice.status === 'CANCELLED' && invoice.cancelledAt"
        class="text-xs text-muted"
      >
        Cancelada el {{ formatDateTime(invoice.cancelledAt) }}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-1.5 sm:justify-end">
      <template v-if="invoice.status === 'STAMPED'">
        <a
          v-if="invoice.pdfUrl"
          :href="invoice.pdfUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-default bg-default px-3 text-sm font-medium text-highlighted transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
        >
          <UIcon
            name="ph:file-pdf"
            class="size-4"
            aria-hidden="true"
          />
          PDF
        </a>
        <a
          v-if="invoice.xmlUrl"
          :href="invoice.xmlUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-default bg-default px-3 text-sm font-medium text-highlighted transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
        >
          <UIcon
            name="ph:file-code"
            class="size-4"
            aria-hidden="true"
          />
          XML
        </a>
      </template>

      <template v-else-if="invoice.status === 'PENDING'">
        <template v-if="confirming">
          <span class="text-xs text-muted">¿Cancelar la solicitud?</span>
          <UButton
            color="error"
            variant="soft"
            size="sm"
            :loading="cancelling"
            label="Sí, cancelar"
            @click="emit('cancel')"
          />
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            :disabled="cancelling"
            label="No"
            @click="confirming = false"
          />
        </template>
        <UButton
          v-else
          color="neutral"
          variant="ghost"
          size="sm"
          label="Cancelar solicitud"
          @click="confirming = true"
        />
      </template>
    </div>
  </article>
</template>
