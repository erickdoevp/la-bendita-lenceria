<script setup lang="ts">
const props = defineProps<{
  quantity: number
  max: number
  disabled?: boolean
  /** Para el nombre accesible: "Brasier push up Alba". */
  label: string
}>()

const emit = defineEmits<{ change: [quantity: number] }>()
</script>

<template>
  <div
    class="inline-flex h-9 items-center rounded-lg border border-line bg-surface-raised transition-opacity"
    :class="disabled && 'opacity-60'"
    role="group"
    :aria-label="`Cantidad de ${label}`"
  >
    <button
      type="button"
      class="grid h-full w-9 place-items-center rounded-l-lg text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:text-ink-muted/50 disabled:hover:bg-transparent"
      :disabled="disabled || props.quantity <= 1"
      aria-label="Quitar una pieza"
      @click="emit('change', props.quantity - 1)"
    >
      <Icon
        name="ph:minus-bold"
        class="size-3.5"
        aria-hidden="true"
      />
    </button>
    <output
      class="w-7 text-center text-sm font-medium tabular-nums text-ink"
      aria-live="polite"
    >{{ quantity }}</output>
    <button
      type="button"
      class="grid h-full w-9 place-items-center rounded-r-lg text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:text-ink-muted/50 disabled:hover:bg-transparent"
      :disabled="disabled || props.quantity >= max"
      aria-label="Agregar una pieza"
      @click="emit('change', props.quantity + 1)"
    >
      <Icon
        name="ph:plus-bold"
        class="size-3.5"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
