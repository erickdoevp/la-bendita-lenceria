<script setup lang="ts">
import type { Order } from '../types'

defineProps<{ order: Order }>()
const emit = defineEmits<{ edit: [] }>()
</script>

<template>
  <UiPanel title="Notas">
    <template #actions>
      <UiButton
        variant="ghost"
        size="sm"
        icon="ph:pencil-simple"
        @click="emit('edit')"
      >
        Nota interna
      </UiButton>
    </template>

    <div class="grid gap-4 text-sm">
      <div class="grid gap-1">
        <p class="text-xs font-medium text-ink-muted">
          De la clienta
        </p>
        <p
          class="whitespace-pre-line"
          :class="order.notes ? 'text-ink' : 'italic text-ink-muted'"
        >
          {{ order.notes || 'Sin nota.' }}
        </p>
      </div>
      <div class="grid gap-1">
        <p class="text-xs font-medium text-ink-muted">
          Interna
        </p>
        <!-- Aqui queda el motivo de una cancelacion (tambien las automaticas) -->
        <p
          class="whitespace-pre-line"
          :class="order.adminNotes ? 'text-ink' : 'italic text-ink-muted'"
        >
          {{ order.adminNotes || 'Sin nota interna.' }}
        </p>
      </div>
    </div>
  </UiPanel>
</template>
