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
        <span class="font-mono text-sm font-medium text-ink">{{ invoice.folio }}</span>
        <InvoiceStatusBadge :status="invoice.status" />
      </div>
      <p class="truncate text-sm text-ink">
        <span class="font-mono">{{ invoice.rfc }}</span> · {{ invoice.razonSocial }}
      </p>
      <p class="text-xs text-ink-muted">
        <template v-if="!hideOrder">
          Pedido
          <NuxtLink
            :to="ACCOUNT_ROUTES.orderDetail(invoice.orderId)"
            class="font-mono text-accent underline-offset-2 hover:underline"
          >{{ invoice.orderNumber }}</NuxtLink> ·
        </template>
        {{ usoCfdiLabel(invoice.usoCFDI) }} · Solicitada el {{ formatDateTime(invoice.createdAt) }}
      </p>
      <p
        v-if="invoice.status === 'PENDING'"
        class="text-xs text-ink-muted"
      >
        La estamos generando. Te avisaremos cuando esté lista para descargar.
      </p>
      <p
        v-else-if="invoice.status === 'STAMPED' && invoice.stampedAt"
        class="text-xs text-ink-muted"
      >
        Emitida el {{ formatDateTime(invoice.stampedAt) }}
      </p>
      <p
        v-else-if="invoice.status === 'CANCELLED' && invoice.cancelledAt"
        class="text-xs text-ink-muted"
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
          class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface-raised px-3 text-sm font-medium text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Icon
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
          class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface-raised px-3 text-sm font-medium text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Icon
            name="ph:file-code"
            class="size-4"
            aria-hidden="true"
          />
          XML
        </a>
      </template>

      <template v-else-if="invoice.status === 'PENDING'">
        <template v-if="confirming">
          <span class="text-xs text-ink-muted">¿Cancelar la solicitud?</span>
          <UiButton
            variant="danger"
            size="sm"
            :loading="cancelling"
            @click="emit('cancel')"
          >
            Sí, cancelar
          </UiButton>
          <UiButton
            variant="ghost"
            size="sm"
            :disabled="cancelling"
            @click="confirming = false"
          >
            No
          </UiButton>
        </template>
        <UiButton
          v-else
          variant="ghost"
          size="sm"
          @click="confirming = true"
        >
          Cancelar solicitud
        </UiButton>
      </template>
    </div>
  </article>
</template>
