<script setup lang="ts">
import { SORT_OPTIONS } from '../constants'
import { useListingQuery } from '../composables/useListingQuery'
import type { ListingSort } from '../types'

defineProps<{
  totalItems: number | null
}>()

const emit = defineEmits<{ openFilters: [] }>()
const { state, activeCount, setSort } = useListingQuery()

const sort = computed({
  get: () => state.value.sort,
  set: value => setSort(value as ListingSort),
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <p
      class="text-sm text-ink-muted"
      aria-live="polite"
    >
      <template v-if="totalItems !== null">
        <span class="font-medium tabular-nums text-ink">{{ totalItems }}</span>
        {{ totalItems === 1 ? 'producto' : 'productos' }}
      </template>
    </p>

    <div class="flex items-center gap-2">
      <UiButton
        variant="secondary"
        icon="ph:sliders-horizontal"
        class="lg:hidden"
        @click="emit('openFilters')"
      >
        Filtros
        <span
          v-if="activeCount"
          class="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs font-semibold leading-5 text-accent-ink"
        >{{ activeCount }}</span>
      </UiButton>

      <label
        for="listing-sort"
        class="whitespace-nowrap text-sm text-ink-muted max-sm:sr-only"
      >Ordenar por</label>
      <UiSelect
        id="listing-sort"
        v-model="sort"
        class="w-auto min-w-48"
      >
        <option
          v-for="option in SORT_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </UiSelect>
    </div>
  </div>
</template>
