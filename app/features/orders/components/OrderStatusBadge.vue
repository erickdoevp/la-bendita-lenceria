<script setup lang="ts">
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS } from '../constants'
import type { OrderStatus } from '../types'

defineProps<{ status: OrderStatus }>()
</script>

<template>
  <span
    class="inline-flex whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium"
    :class="ORDER_STATUS_CLASSES[status]"
  >
    {{ ORDER_STATUS_LABELS[status] }}
  </span>
</template>
