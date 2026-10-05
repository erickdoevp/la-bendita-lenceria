<script setup lang="ts">
const props = defineProps<{
  name: string
  value: string
  disabled?: boolean
  invalid?: boolean
}>()

const model = defineModel<string | null>({ required: true })
const checked = computed(() => model.value === props.value)
</script>

<template>
  <!-- Radio nativo: flechas del teclado, lector de pantalla y autocompletado sin codigo extra -->
  <label
    class="relative flex cursor-pointer items-start gap-3.5 rounded-xl border bg-surface-raised px-4 py-3.5 transition-[border-color,box-shadow] duration-200 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-accent"
    :class="[
      checked ? 'border-ink shadow-[inset_0_0_0_1px_var(--ink)]' : invalid ? 'border-danger' : 'border-line hover:border-ink-muted/50',
      disabled && 'pointer-events-none opacity-50',
    ]"
  >
    <input
      v-model="model"
      type="radio"
      class="sr-only"
      :name="name"
      :value="value"
      :disabled="disabled"
    >
    <span
      class="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors duration-200"
      :class="checked ? 'border-ink bg-ink' : 'border-line bg-surface-raised'"
      aria-hidden="true"
    >
      <span
        class="size-1.5 rounded-full bg-surface-raised transition-transform duration-200"
        :class="checked ? 'scale-100' : 'scale-0'"
      />
    </span>
    <span class="grid min-w-0 flex-1 gap-0.5">
      <slot />
    </span>
    <span
      v-if="$slots.aside"
      class="shrink-0 text-right"
    >
      <slot name="aside" />
    </span>
  </label>
</template>
