<script setup lang="ts">
/** Adapta el Page<T> del backend (pagina 0-based) a UPagination (1-based). */
const props = defineProps<{
  page: Page<unknown>
  disabled?: boolean
}>()

const emit = defineEmits<{ change: [page: number] }>()
</script>

<template>
  <nav
    v-if="props.page.totalPages > 1 || props.page.totalElements > 0"
    class="flex flex-wrap items-center justify-between gap-4 text-sm text-muted"
    aria-label="Paginación"
  >
    <span>{{ props.page.totalElements }} {{ props.page.totalElements === 1 ? 'registro' : 'registros' }}</span>
    <UPagination
      v-if="props.page.totalPages > 1"
      :page="props.page.page + 1"
      :items-per-page="props.page.size"
      :total="props.page.totalElements"
      :disabled="disabled"
      size="sm"
      @update:page="emit('change', $event - 1)"
    />
  </nav>
</template>
