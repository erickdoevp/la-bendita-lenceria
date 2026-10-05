<script setup lang="ts">
import { MOVEMENT_TYPE_CLASSES, MOVEMENT_TYPE_LABELS } from '../constants'
import type { StockMovementType } from '../types'

defineProps<{ type: StockMovementType }>()
</script>

<template>
  <span
    class="inline-flex whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium"
    :class="MOVEMENT_TYPE_CLASSES[type]"
  >
    {{ MOVEMENT_TYPE_LABELS[type] }}
  </span>
</template>
