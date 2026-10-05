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
      <USkeleton
        class="h-4 w-28"
      />
      <USkeleton
        class="h-6 w-20"
      />
      <USkeleton
        class="ml-auto h-4 w-10"
      />
      <USkeleton
        class="hidden h-4 w-16 sm:block"
      />
      <USkeleton
        class="h-4 w-2/5"
      />
    </div>
  </div>
</template>
