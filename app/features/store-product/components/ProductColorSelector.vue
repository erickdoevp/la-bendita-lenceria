<script setup lang="ts">
import type { ProductColorOption } from '../types'

defineProps<{
  colors: ProductColorOption[]
  selected: string | null
  isSoldOut: (key: string) => boolean
}>()

const emit = defineEmits<{ select: [key: string] }>()
</script>

<template>
  <fieldset class="grid gap-3">
    <legend class="text-sm text-ink-muted">
      Color:
      <span class="font-medium text-ink">{{ colors.find(c => c.key === selected)?.name }}</span>
    </legend>
    <div class="flex flex-wrap gap-2.5">
      <!-- Radios nativos: flechas del teclado y lector de pantalla sin codigo extra -->
      <label
        v-for="color in colors"
        :key="color.key"
        class="relative grid size-10 cursor-pointer place-items-center rounded-full ring-offset-2 ring-offset-surface transition-shadow has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-accent"
        :class="color.key === selected ? 'ring-2 ring-ink' : 'ring-1 ring-ink/15 hover:ring-ink/40'"
        :title="isSoldOut(color.key) ? `${color.name} (agotado)` : color.name"
      >
        <input
          type="radio"
          name="product-color"
          class="sr-only"
          :value="color.key"
          :checked="color.key === selected"
          :aria-label="isSoldOut(color.key) ? `${color.name}, agotado` : color.name"
          @change="emit('select', color.key)"
        >
        <span
          class="size-8 rounded-full"
          :style="{ backgroundColor: color.hex }"
          aria-hidden="true"
        />
        <!-- Diagonal sobre los colores agotados: se pueden ver, pero no comprar -->
        <span
          v-if="isSoldOut(color.key)"
          class="pointer-events-none absolute inset-1 overflow-hidden rounded-full"
          aria-hidden="true"
        >
          <span class="absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-surface-raised ring-1 ring-ink/30" />
        </span>
      </label>
    </div>
  </fieldset>
</template>
