<script setup lang="ts">
const props = defineProps<{
  id: string
  label: string
  modelValue: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const term = ref(props.modelValue)
let timer: ReturnType<typeof setTimeout> | undefined

// Si el padre limpia el filtro, el input tambien se vacia
watch(() => props.modelValue, (value) => {
  if (value !== term.value.trim()) term.value = value
})

watch(term, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => emit('update:modelValue', value.trim()), 300)
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="relative min-w-0 flex-1">
    <label
      :for="id"
      class="sr-only"
    >{{ label }}</label>
    <Icon
      name="ph:magnifying-glass"
      class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
      aria-hidden="true"
    />
    <input
      :id="id"
      v-model="term"
      type="search"
      :placeholder="label"
      class="h-10 w-full rounded-xl border border-line bg-surface-raised pl-10 pr-3.5 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-muted focus:border-accent focus:ring-3 focus:ring-accent/20"
    >
  </div>
</template>
