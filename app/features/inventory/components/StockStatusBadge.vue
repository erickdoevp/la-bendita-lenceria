<script setup lang="ts">
defineProps<{
  availableStock: number
  lowStock: boolean
}>()
</script>

<template>
  <UBadge
    v-if="availableStock <= 0"
    color="error"
    label="Agotado"
  />
  <UBadge
    v-else-if="lowStock"
    color="warning"
    label="Stock bajo"
  />
  <UBadge
    v-else
    color="success"
    label="En stock"
  />
</template>
