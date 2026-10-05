<script setup lang="ts">
withDefaults(defineProps<{
  hex: string
  size?: 'sm' | 'md'
}>(), { size: 'md' })
</script>

<template>
  <span
    class="inline-block shrink-0 rounded-full ring-1 ring-inset ring-(--ui-border-accented)"
    :class="size === 'sm' ? 'size-4' : 'size-6'"
    :style="{ backgroundColor: hex }"
    aria-hidden="true"
  />
</template>
