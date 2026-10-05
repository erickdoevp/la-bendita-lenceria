<script setup lang="ts">
import type { SizeAvailability } from '../composables/useVariantSelection'

const props = defineProps<{
  sizes: string[]
  selected: string | null
  availability: (size: string) => SizeAvailability
  /** Se pidio agregar sin elegir talla. */
  error?: string | null
}>()

const emit = defineEmits<{ select: [size: string], openGuide: [] }>()

const LABELS: Record<SizeAvailability, string> = {
  available: '',
  low: ', quedan pocas',
  soldout: ', agotada',
  unavailable: ', no disponible en este color',
}

const isBlocked = (size: string) => ['soldout', 'unavailable'].includes(props.availability(size))
</script>

<template>
  <fieldset
    class="grid gap-3"
    :aria-describedby="error ? 'product-size-error' : undefined"
  >
    <div class="flex items-baseline justify-between gap-3">
      <legend class="text-sm text-ink-muted">
        Talla<template v-if="selected">:
          <span class="font-medium text-ink">{{ selected }}</span>
        </template>
      </legend>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
        @click="emit('openGuide')"
      >
        <Icon
          name="ph:ruler"
          class="size-4"
          aria-hidden="true"
        />
        Guía de tallas
      </button>
    </div>

    <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
      <label
        v-for="size in sizes"
        :key="size"
        class="relative grid h-11 cursor-pointer place-items-center overflow-hidden rounded-xl border text-sm font-medium tabular-nums transition-[background-color,border-color,color,transform] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent active:scale-[0.97]"
        :class="[
          size === selected
            ? 'border-ink bg-ink text-surface'
            : ['bg-surface-raised hover:border-ink/40', error ? 'border-danger' : 'border-line', isBlocked(size) ? 'text-ink-muted' : 'text-ink'],
        ]"
      >
        <input
          type="radio"
          name="product-size"
          class="sr-only"
          :value="size"
          :checked="size === selected"
          :aria-label="`${size}${LABELS[availability(size)]}`"
          @change="emit('select', size)"
        >
        {{ size }}
        <!-- Agotada: se puede elegir para ver el aviso, pero se tacha -->
        <span
          v-if="isBlocked(size)"
          class="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <span
            class="absolute left-1/2 top-1/2 h-px w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-[20deg]"
            :class="size === selected ? 'bg-surface/60' : 'bg-line'"
          />
        </span>
      </label>
    </div>

    <p
      v-if="error"
      id="product-size-error"
      class="text-[13px] text-danger"
    >
      {{ error }}
    </p>
  </fieldset>
</template>
