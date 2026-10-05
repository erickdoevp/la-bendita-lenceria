<script setup lang="ts">
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from '../constants'
import type { InvoiceStatus } from '../types'

defineProps<{ status: InvoiceStatus }>()
</script>

<template>
  <UBadge
    :color="INVOICE_STATUS_COLORS[status]"
    :label="INVOICE_STATUS_LABELS[status]"
    class="whitespace-nowrap"
  />
</template>
