<script setup lang="ts">
defineProps<{ message: string }>()
const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    role="alert"
    class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-line px-5 py-6"
  >
    <div class="flex items-start gap-3">
      <Icon
        name="ph:warning-circle"
        class="mt-0.5 size-5 shrink-0 text-danger"
        aria-hidden="true"
      />
      <p class="max-w-[52ch] text-sm leading-relaxed text-ink-muted">
        {{ message }}
      </p>
    </div>
    <UiButton
      variant="secondary"
      size="sm"
      icon="ph:arrow-clockwise"
      @click="emit('retry')"
    >
      Reintentar
    </UiButton>
  </div>
</template>
