<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <section class="rounded-2xl border border-line bg-surface-raised">
    <header
      v-if="title"
      class="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6"
    >
      <div class="grid max-w-[65ch] gap-1">
        <h2 class="text-base font-semibold tracking-tight text-ink">
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="text-sm leading-relaxed text-ink-muted"
        >
          {{ description }}
        </p>
      </div>
      <slot name="actions" />
    </header>
    <div class="p-5 sm:p-6">
      <slot />
    </div>
  </section>
</template>
