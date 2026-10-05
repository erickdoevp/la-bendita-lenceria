<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{ invalid?: boolean }>()

const model = defineModel<string>()
</script>

<template>
  <textarea
    v-model="model"
    v-bind="$attrs"
    :aria-invalid="invalid || undefined"
    class="min-h-28 w-full resize-y rounded-xl border bg-surface-raised px-3.5 py-2.5 text-[15px] leading-relaxed text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-muted/80 focus:border-accent focus:ring-3 focus:ring-accent/20"
    :class="invalid ? 'border-danger' : 'border-line'"
  />
</template>
