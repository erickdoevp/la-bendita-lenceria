<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
  icon?: string
  loading?: boolean
  disabled?: boolean
  to?: RouteLocationRaw
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  icon: undefined,
  to: undefined,
})

const variants = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
  secondary: 'border border-line bg-surface-raised text-ink hover:bg-surface',
  ghost: 'text-ink-muted hover:bg-surface hover:text-ink',
  danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-surface-raised',
}

const sizes = {
  sm: 'h-9 gap-1.5 px-3 text-sm',
  md: 'h-11 gap-2 px-5 text-[15px]',
}

const classes = computed(() => [
  'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl font-medium transition-[background-color,color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60',
  variants[props.variant],
  sizes[props.size],
])
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="classes"
  >
    <Icon
      v-if="icon"
      :name="icon"
      class="size-4"
      aria-hidden="true"
    />
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :class="classes"
  >
    <Icon
      v-if="loading"
      name="ph:circle-notch"
      class="size-4 motion-safe:animate-spin"
      aria-hidden="true"
    />
    <Icon
      v-else-if="icon"
      :name="icon"
      class="size-4"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
