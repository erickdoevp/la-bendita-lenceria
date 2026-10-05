<script setup lang="ts">
import { MOVEMENT_TYPE_LABELS } from '../constants'
import type { StockMovementType } from '../types'

const emit = defineEmits<{ clear: [] }>()

const type = defineModel<StockMovementType | ''>('type', { required: true })
const dateFrom = defineModel<string>('dateFrom', { required: true })
const dateTo = defineModel<string>('dateTo', { required: true })

const typeItems = [
  { label: 'Todos los movimientos', value: SELECT_ALL },
  ...(Object.entries(MOVEMENT_TYPE_LABELS) as [StockMovementType, string][]).map(([value, label]) => ({ label, value })),
]
const typeModel = computed({
  get: () => type.value || SELECT_ALL,
  set: (value: string) => {
    type.value = value === SELECT_ALL ? '' : value as StockMovementType
  },
})
const filtered = computed(() => Boolean(type.value || dateFrom.value || dateTo.value))
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10.5rem_10.5rem_auto] sm:items-end">
    <UFormField
      label="Tipo"
      :ui="{ label: 'text-xs text-muted' }"
    >
      <USelect
        v-model="typeModel"
        :items="typeItems"
      />
    </UFormField>
    <UFormField
      label="Desde"
      :ui="{ label: 'text-xs text-muted' }"
    >
      <UInput
        v-model="dateFrom"
        type="date"
        :max="dateTo || undefined"
      />
    </UFormField>
    <UFormField
      label="Hasta"
      :ui="{ label: 'text-xs text-muted' }"
    >
      <UInput
        v-model="dateTo"
        type="date"
        :min="dateFrom || undefined"
      />
    </UFormField>
    <UButton
      v-if="filtered"
      color="neutral"
      variant="ghost"
      icon="ph:x"
      label="Limpiar"
      @click="emit('clear')"
    />
  </div>
</template>
