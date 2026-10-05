<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 6 })
</script>

<template>
  <div
    class="grid gap-4"
    role="status"
    aria-label="Cargando movimientos"
  >
    <div
      v-for="row in rows"
      :key="row"
      class="flex items-center gap-4"
    >
      <UiSkeleton class="h-4 w-28" />
      <UiSkeleton class="h-6 w-20" />
      <UiSkeleton class="ml-auto h-4 w-10" />
      <UiSkeleton class="hidden h-4 w-16 sm:block" />
      <UiSkeleton class="h-4 w-2/5" />
    </div>
  </div>
</template>
