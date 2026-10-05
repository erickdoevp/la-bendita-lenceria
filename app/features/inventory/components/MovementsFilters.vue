<script setup lang="ts">
import { MOVEMENT_TYPE_LABELS } from '../constants'
import type { StockMovementType } from '../types'

defineProps<{ id: string }>()
const emit = defineEmits<{ clear: [] }>()

const type = defineModel<StockMovementType | ''>('type', { required: true })
const dateFrom = defineModel<string>('dateFrom', { required: true })
const dateTo = defineModel<string>('dateTo', { required: true })

const typeOptions = Object.entries(MOVEMENT_TYPE_LABELS) as [StockMovementType, string][]
const filtered = computed(() => Boolean(type.value || dateFrom.value || dateTo.value))
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10.5rem_10.5rem_auto] sm:items-end">
    <div class="grid gap-1.5">
      <label
        :for="`${id}-type`"
        class="text-xs font-medium text-ink-muted"
      >Tipo</label>
      <UiSelect
        :id="`${id}-type`"
        v-model="type"
        class="[&_select]:h-10 [&_select]:text-sm"
      >
        <option value="">
          Todos los movimientos
        </option>
        <option
          v-for="[value, label] in typeOptions"
          :key="value"
          :value="value"
        >
          {{ label }}
        </option>
      </UiSelect>
    </div>
    <div class="grid gap-1.5">
      <label
        :for="`${id}-from`"
        class="text-xs font-medium text-ink-muted"
      >Desde</label>
      <UiInput
        :id="`${id}-from`"
        v-model="dateFrom"
        type="date"
        size="sm"
        :max="dateTo || undefined"
      />
    </div>
    <div class="grid gap-1.5">
      <label
        :for="`${id}-to`"
        class="text-xs font-medium text-ink-muted"
      >Hasta</label>
      <UiInput
        :id="`${id}-to`"
        v-model="dateTo"
        type="date"
        size="sm"
        :min="dateFrom || undefined"
      />
    </div>
    <UiButton
      v-if="filtered"
      variant="ghost"
      size="sm"
      icon="ph:x"
      class="h-10"
      @click="emit('clear')"
    >
      Limpiar
    </UiButton>
  </div>
</template>
