<script setup lang="ts">
defineProps<{
  id: string
  step: number
  title: string
  description?: string
}>()
</script>

<template>
  <section
    :aria-labelledby="`${id}-title`"
    class="reveal grid gap-6 border-t border-line py-10 first:border-t-0 first:pt-0"
  >
    <header class="grid gap-1">
      <span
        class="text-[12px] font-medium tabular-nums tracking-[0.08em] text-ink-muted"
        aria-hidden="true"
      >{{ String(step).padStart(2, '0') }}</span>
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          :id="`${id}-title`"
          class="text-xl font-semibold tracking-tight text-ink"
        >
          {{ title }}
        </h2>
        <slot name="action" />
      </div>
      <p
        v-if="description"
        class="text-sm leading-relaxed text-ink-muted"
      >
        {{ description }}
      </p>
    </header>
    <slot />
  </section>
</template>
