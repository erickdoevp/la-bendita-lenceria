<script setup lang="ts">
withDefaults(defineProps<{
  hex: string
  size?: 'sm' | 'md'
}>(), { size: 'md' })
</script>

<template>
  <span
    class="inline-block shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(24_24_27/0.18)]"
    :class="size === 'sm' ? 'size-4' : 'size-6'"
    :style="{ backgroundColor: hex }"
    aria-hidden="true"
  />
</template>
