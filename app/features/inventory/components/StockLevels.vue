<script setup lang="ts">
import type { StockLevels } from '../types'

/** Siempre los tres numeros: explica por que no se puede bajar a cero algo que "tiene unidades". */
const props = defineProps<{ levels: StockLevels }>()

const cells = computed(() => [
  { label: 'Stock físico', value: props.levels.stock, hint: 'En almacén' },
  { label: 'Reservado', value: props.levels.reservedStock, hint: 'En pedidos sin pagar' },
  { label: 'Disponible', value: props.levels.availableStock, hint: `Alerta en ${props.levels.lowStockThreshold} o menos`, main: true },
])
</script>

<template>
  <dl class="grid grid-cols-3 divide-x divide-default rounded-lg border border-default">
    <div
      v-for="cell in cells"
      :key="cell.label"
      class="grid gap-1 px-3 py-3 sm:px-4"
    >
      <dt class="text-xs font-medium text-muted">
        {{ cell.label }}
      </dt>
      <dd
        class="text-2xl font-semibold tabular-nums tracking-tight"
        :class="cell.main && (levels.availableStock <= 0 ? 'text-error' : levels.lowStock ? 'text-warning' : 'text-highlighted')"
      >
        {{ cell.value }}
      </dd>
      <dd class="text-xs text-muted">
        {{ cell.hint }}
      </dd>
    </div>
  </dl>
</template>
