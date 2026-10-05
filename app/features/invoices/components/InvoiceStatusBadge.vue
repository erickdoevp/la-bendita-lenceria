<script setup lang="ts">
import { INVOICE_STATUS_CLASSES, INVOICE_STATUS_LABELS } from '../constants'
import type { InvoiceStatus } from '../types'

defineProps<{ status: InvoiceStatus }>()
</script>

<template>
  <span
    class="inline-flex whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium"
    :class="INVOICE_STATUS_CLASSES[status]"
  >
    {{ INVOICE_STATUS_LABELS[status] }}
  </span>
</template>
