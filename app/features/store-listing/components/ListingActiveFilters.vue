<script setup lang="ts">
import { PRICE_RANGES } from '../constants'
import { useListingQuery } from '../composables/useListingQuery'
import type { ListingFacets } from '../types'

const props = defineProps<{ facets: ListingFacets }>()

const { state, activeCount, toggleSize, toggleColor, setPrice, setOnSale, clearFilters } = useListingQuery()

interface Chip {
  key: string
  label: string
  remove: () => void
}

const chips = computed<Chip[]>(() => [
  ...state.value.sizes.map(size => ({ key: `talla-${size}`, label: `Talla ${size}`, remove: () => toggleSize(size) })),
  ...state.value.colors.map(color => ({
    key: `color-${color}`,
    // El nombre sale de las facetas; si el color ya no existe se muestra el valor de la URL
    label: props.facets.colors.find(c => c.value === color)?.label ?? color,
    remove: () => toggleColor(color),
  })),
  ...(state.value.price
    ? [{ key: 'precio', label: PRICE_RANGES.find(r => r.value === state.value.price)!.label, remove: () => setPrice(null) }]
    : []),
  ...(state.value.onSale ? [{ key: 'oferta', label: 'En oferta', remove: () => setOnSale(false) }] : []),
])
</script>

<template>
  <div
    v-if="activeCount"
    class="flex flex-wrap items-center gap-2"
  >
    <h2 class="sr-only">
      Filtros activos
    </h2>
    <button
      v-for="chip in chips"
      :key="chip.key"
      type="button"
      class="inline-flex h-9 items-center gap-1.5 rounded-xl bg-accent/10 pl-3 pr-2 text-sm font-medium text-accent transition-[background-color,transform] hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.97]"
      :aria-label="`Quitar filtro ${chip.label}`"
      @click="chip.remove()"
    >
      {{ chip.label }}
      <Icon
        name="ph:x"
        class="size-3.5"
        aria-hidden="true"
      />
    </button>
    <button
      type="button"
      class="h-9 px-2 text-sm font-medium text-ink-muted underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
      @click="clearFilters()"
    >
      Limpiar filtros
    </button>
  </div>
</template>
