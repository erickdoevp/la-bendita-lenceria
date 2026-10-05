<script setup lang="ts">
const props = defineProps<{
  id: string
  label: string
  type?: string
  autocomplete?: string
  error?: string
  disabled?: boolean
}>()

const model = defineModel<string>({ required: true })
const errorId = computed(() => `${props.id}-error`)
</script>

<template>
  <div class="grid gap-2">
    <label
      :for="id"
      class="text-sm font-medium text-ink"
    >
      {{ label }}
    </label>

    <div class="relative">
      <input
        :id="id"
        v-model="model"
        :type="type ?? 'text'"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? errorId : undefined"
        class="h-11 w-full rounded-xl border bg-surface-raised px-3.5 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent focus:ring-3 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
        :class="[error ? 'border-danger' : 'border-line', $slots.trailing ? 'pr-11' : '']"
      >
      <div
        v-if="$slots.trailing"
        class="absolute inset-y-0 right-0 flex items-center pr-1.5"
      >
        <slot name="trailing" />
      </div>
    </div>

    <p
      v-if="error"
      :id="errorId"
      class="text-sm text-danger"
    >
      {{ error }}
    </p>
  </div>
</template>
