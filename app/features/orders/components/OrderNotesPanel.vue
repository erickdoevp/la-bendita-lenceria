<script setup lang="ts">
import type { Order } from '../types'

defineProps<{ order: Order }>()
const emit = defineEmits<{ edit: [] }>()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h2 class="font-semibold tracking-tight text-highlighted">
          Notas
        </h2>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="ph:pencil-simple"
          label="Nota interna"
          @click="emit('edit')"
        />
      </div>
    </template>

    <div class="grid gap-4 text-sm">
      <div class="grid gap-1">
        <p class="text-xs font-medium text-muted">
          De la clienta
        </p>
        <p
          class="whitespace-pre-line"
          :class="order.notes ? 'text-highlighted' : 'italic text-muted'"
        >
          {{ order.notes || 'Sin nota.' }}
        </p>
      </div>
      <div class="grid gap-1">
        <p class="text-xs font-medium text-muted">
          Interna
        </p>
        <!-- Aqui queda el motivo de una cancelacion (tambien las automaticas) -->
        <p
          class="whitespace-pre-line"
          :class="order.adminNotes ? 'text-highlighted' : 'italic text-muted'"
        >
          {{ order.adminNotes || 'Sin nota interna.' }}
        </p>
      </div>
    </div>
  </UCard>
</template>
