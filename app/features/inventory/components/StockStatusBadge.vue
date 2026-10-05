<script setup lang="ts">
defineProps<{
  availableStock: number
  lowStock: boolean
}>()
</script>

<template>
  <span
    v-if="availableStock <= 0"
    class="inline-flex rounded-lg bg-danger-soft px-2 py-1 text-xs font-medium text-danger"
  >Agotado</span>
  <span
    v-else-if="lowStock"
    class="inline-flex rounded-lg bg-warning-soft px-2 py-1 text-xs font-medium text-warning"
  >Stock bajo</span>
  <span
    v-else
    class="inline-flex rounded-lg bg-success-soft px-2 py-1 text-xs font-medium text-success"
  >En stock</span>
</template>
