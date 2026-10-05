<script setup lang="ts">
const props = defineProps<{
  page: number
  totalPages: number
  totalElements: number
  disabled?: boolean
}>()

const emit = defineEmits<{ change: [page: number] }>()
</script>

<template>
  <nav
    v-if="totalPages > 1 || totalElements > 0"
    class="flex items-center justify-between gap-4 text-sm text-ink-muted"
    aria-label="Paginación"
  >
    <span>{{ totalElements }} {{ totalElements === 1 ? 'registro' : 'registros' }}</span>
    <div
      v-if="totalPages > 1"
      class="flex items-center gap-2"
    >
      <UiButton
        variant="secondary"
        size="sm"
        icon="ph:caret-left"
        :disabled="disabled || props.page <= 0"
        aria-label="Página anterior"
        @click="emit('change', props.page - 1)"
      />
      <span class="tabular-nums">{{ props.page + 1 }} / {{ totalPages }}</span>
      <UiButton
        variant="secondary"
        size="sm"
        icon="ph:caret-right"
        :disabled="disabled || props.page >= totalPages - 1"
        aria-label="Página siguiente"
        @click="emit('change', props.page + 1)"
      />
    </div>
  </nav>
</template>
