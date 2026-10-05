<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="grid max-w-[65ch] gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="leading-relaxed text-ink-muted"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="flex flex-wrap gap-2"
    >
      <slot name="actions" />
    </div>
  </header>
</template>
