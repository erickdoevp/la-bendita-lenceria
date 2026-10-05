<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{ invalid?: boolean }>()

const model = defineModel<string | null>()
</script>

<template>
  <div class="relative">
    <select
      v-model="model"
      v-bind="$attrs"
      :aria-invalid="invalid || undefined"
      class="h-11 w-full appearance-none rounded-xl border bg-surface-raised pl-3.5 pr-10 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent focus:ring-3 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
      :class="invalid ? 'border-danger' : 'border-line'"
    >
      <slot />
    </select>
    <Icon
      name="ph:caret-up-down"
      class="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
      aria-hidden="true"
    />
  </div>
</template>
