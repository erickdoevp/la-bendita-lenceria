<script setup lang="ts">
withDefaults(defineProps<{
  rating: number
  size?: 'sm' | 'md'
}>(), { size: 'sm' })
</script>

<template>
  <span
    class="inline-flex items-center gap-0.5"
    role="img"
    :aria-label="`${rating} de 5 estrellas`"
  >
    <Icon
      v-for="star in 5"
      :key="star"
      :name="star <= Math.round(rating) ? 'ph:star-fill' : 'ph:star'"
      :class="[size === 'sm' ? 'size-4' : 'size-5', star <= Math.round(rating) ? 'text-warning' : 'text-line']"
      aria-hidden="true"
    />
  </span>
</template>
