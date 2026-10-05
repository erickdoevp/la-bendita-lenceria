<script setup lang="ts">
const props = defineProps<{
  max: number
  disabled?: boolean
}>()

const model = defineModel<number>({ required: true })

// Si cambia la talla y hay menos stock, la cantidad se recorta
watch(() => props.max, (max) => {
  if (max > 0 && model.value > max) model.value = max
})
</script>

<template>
  <div
    class="inline-flex h-11 items-center rounded-xl border border-line bg-surface-raised"
    role="group"
    aria-label="Cantidad"
  >
    <button
      type="button"
      class="grid h-full w-11 place-items-center rounded-l-xl text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
      :disabled="disabled || model <= 1"
      aria-label="Quitar una pieza"
      @click="model--"
    >
      <Icon
        name="ph:minus"
        class="size-4"
        aria-hidden="true"
      />
    </button>
    <output
      class="w-8 text-center text-[15px] font-medium tabular-nums text-ink"
      aria-live="polite"
    >{{ model }}</output>
    <button
      type="button"
      class="grid h-full w-11 place-items-center rounded-r-xl text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
      :disabled="disabled || model >= max"
      aria-label="Agregar una pieza"
      @click="model++"
    >
      <Icon
        name="ph:plus"
        class="size-4"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
