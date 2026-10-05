<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'danger' | 'info' }>(), { tone: 'danger' })
</script>

<template>
  <div
    :role="tone === 'danger' ? 'alert' : 'status'"
    class="flex items-start gap-3 rounded-xl px-4 py-3 text-sm leading-relaxed"
    :class="tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-accent/8 text-ink'"
  >
    <Icon
      :name="tone === 'danger' ? 'ph:warning-circle' : 'ph:info'"
      class="mt-px size-5 shrink-0"
      :class="tone === 'info' && 'text-accent'"
      aria-hidden="true"
    />
    <div class="min-w-0">
      <slot />
    </div>
  </div>
</template>
