<script setup lang="ts">
import { MOVEMENT_TYPE_COLORS, MOVEMENT_TYPE_LABELS } from '../constants'
import type { StockMovementType } from '../types'

defineProps<{ type: StockMovementType }>()
</script>

<template>
  <UBadge
    :color="MOVEMENT_TYPE_COLORS[type]"
    :label="MOVEMENT_TYPE_LABELS[type]"
    class="whitespace-nowrap"
  />
</template>
