<script setup lang="ts">
const props = defineProps<{ label: string, invalid?: boolean }>()
const name = useId()

const model = defineModel<number>({ required: true })
const hovered = ref(0)

const LABELS = ['', 'Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente']
const shown = computed(() => hovered.value || model.value)
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Radios nativos: flechas del teclado y lector de pantalla sin codigo extra -->
    <div
      role="radiogroup"
      :aria-label="props.label"
      :aria-invalid="invalid || undefined"
      class="flex"
      @mouseleave="hovered = 0"
    >
      <label
        v-for="star in 5"
        :key="star"
        class="grid size-10 cursor-pointer place-items-center rounded-lg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary"
        @mouseenter="hovered = star"
      >
        <input
          v-model="model"
          type="radio"
          :name="name"
          :value="star"
          class="sr-only"
          :aria-label="`${star} de 5 · ${LABELS[star]}`"
        >
        <UIcon
          :name="star <= shown ? 'ph:star-fill' : 'ph:star'"
          class="size-7 transition-transform duration-150 motion-safe:hover:scale-110"
          :class="star <= shown ? 'text-warning' : 'text-dimmed'"
          aria-hidden="true"
        />
      </label>
    </div>
    <span class="text-sm text-muted">{{ LABELS[shown] }}</span>
  </div>
</template>
