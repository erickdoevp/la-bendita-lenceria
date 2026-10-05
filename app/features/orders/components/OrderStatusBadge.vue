<script setup lang="ts">
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../constants'
import type { OrderStatus } from '../types'

defineProps<{ status: OrderStatus }>()
</script>

<template>
  <UBadge
    :color="ORDER_STATUS_COLORS[status]"
    :label="ORDER_STATUS_LABELS[status]"
    class="whitespace-nowrap"
  />
</template>
