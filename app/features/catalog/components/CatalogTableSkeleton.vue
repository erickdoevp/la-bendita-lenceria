<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 5 })
</script>

<template>
  <div
    class="grid gap-3"
    role="status"
    aria-label="Cargando"
  >
    <div
      v-for="row in rows"
      :key="row"
      class="flex items-center gap-4"
    >
      <USkeleton class="size-8 rounded-full" />
      <USkeleton class="h-4 flex-1" />
      <USkeleton class="h-4 w-16" />
    </div>
  </div>
</template>
