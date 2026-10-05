<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  invalid?: boolean
  prefix?: string
  suffix?: string
  size?: 'sm' | 'md'
}>()

const model = defineModel<string | number | null>()
</script>

<template>
  <div class="relative">
    <span
      v-if="prefix"
      :class="size === 'sm' ? 'left-2.5 text-sm' : 'left-3.5 text-[15px]'"
      class="pointer-events-none absolute inset-y-0 flex items-center text-ink-muted"
    >{{ prefix }}</span>
    <input
      v-model="model"
      v-bind="$attrs"
      :aria-invalid="invalid || undefined"
      class="w-full rounded-xl border bg-surface-raised text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-muted/80 focus:border-accent focus:ring-3 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
      :class="[
        invalid ? 'border-danger' : 'border-line',
        size === 'sm' ? 'h-10 px-2.5 text-sm' : 'h-11 px-3.5 text-[15px]',
        prefix && (size === 'sm' ? 'pl-6' : 'pl-8'),
        suffix && 'pr-10',
      ]"
    >
    <span
      v-if="suffix"
      class="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[15px] text-ink-muted"
    >{{ suffix }}</span>
  </div>
</template>
