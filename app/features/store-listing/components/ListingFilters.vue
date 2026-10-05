<script setup lang="ts">
import { useListingQuery } from '../composables/useListingQuery'
import type { ListingFacets, PriceRangeKey } from '../types'

defineProps<{
  facets: ListingFacets
  /** Distingue los ids del panel lateral y del movil, que pueden convivir en el DOM. */
  idPrefix: string
}>()

const { state, toggleSize, toggleColor, setPrice, setOnSale } = useListingQuery()

const onSale = computed({
  get: () => state.value.onSale,
  set: value => setOnSale(value),
})

// Una opcion sin resultados se deshabilita, salvo que ya este activa (para poder quitarla)
const sizeDisabled = (value: string, count: number) => !count && !state.value.sizes.includes(value)
const colorDisabled = (value: string, count: number) => !count && !state.value.colors.includes(value)
const priceDisabled = (value: string, count: number) => !count && state.value.price !== value

/** Palomita oscura sobre colores claros (marfil, nude) y clara sobre los oscuros. */
function checkClass(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16))
  return (0.299 * r! + 0.587 * g! + 0.114 * b!) > 160 ? 'text-zinc-900' : 'text-zinc-50'
}
</script>

<template>
  <div class="grid gap-1">
    <details
      class="group/filter border-b border-line py-4"
      open
    >
      <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
        Talla
        <Icon
          name="ph:caret-down"
          class="size-4 text-ink-muted transition-transform duration-200 group-open/filter:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <p
        v-if="!facets.sizes.length"
        class="mt-3 text-sm text-ink-muted"
      >
        Sin tallas disponibles.
      </p>
      <ul
        v-else
        class="mt-4 grid grid-cols-4 gap-2"
      >
        <li
          v-for="size in facets.sizes"
          :key="size.value"
        >
          <button
            type="button"
            class="h-10 w-full rounded-xl border text-sm font-medium tabular-nums transition-[background-color,border-color,color,transform] focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            :class="state.sizes.includes(size.value) ? 'border-ink bg-ink text-surface' : 'border-line bg-surface-raised text-ink hover:border-ink/40'"
            :aria-pressed="state.sizes.includes(size.value)"
            :disabled="sizeDisabled(size.value, size.count)"
            :aria-label="`Talla ${size.label}, ${size.count} productos`"
            @click="toggleSize(size.value)"
          >
            {{ size.label }}
          </button>
        </li>
      </ul>
    </details>

    <details
      class="group/filter border-b border-line py-4"
      open
    >
      <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
        Color
        <Icon
          name="ph:caret-down"
          class="size-4 text-ink-muted transition-transform duration-200 group-open/filter:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <p
        v-if="!facets.colors.length"
        class="mt-3 text-sm text-ink-muted"
      >
        Sin colores disponibles.
      </p>
      <ul
        v-else
        class="mt-3 grid gap-0.5"
      >
        <li
          v-for="color in facets.colors"
          :key="color.value"
        >
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
            :aria-pressed="state.colors.includes(color.value)"
            :disabled="colorDisabled(color.value, color.count)"
            @click="toggleColor(color.value)"
          >
            <span
              class="grid size-6 shrink-0 place-items-center rounded-full ring-1 ring-ink/15 ring-offset-2 ring-offset-surface transition-shadow"
              :class="state.colors.includes(color.value) && 'ring-2 ring-ink'"
              :style="{ backgroundColor: color.hex }"
            >
              <Icon
                v-if="state.colors.includes(color.value)"
                name="ph:check-bold"
                :class="checkClass(color.hex)"
                class="size-3"
                aria-hidden="true"
              />
            </span>
            <span class="flex-1 text-ink">{{ color.label }}</span>
            <span class="tabular-nums text-ink-muted">{{ color.count }}</span>
          </button>
        </li>
      </ul>
    </details>

    <details
      class="group/filter border-b border-line py-4"
      open
    >
      <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
        Precio
        <Icon
          name="ph:caret-down"
          class="size-4 text-ink-muted transition-transform duration-200 group-open/filter:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ul
        class="mt-3 grid gap-0.5"
        role="radiogroup"
        aria-label="Rango de precio"
      >
        <li
          v-for="price in facets.prices"
          :key="price.value"
        >
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
            role="radio"
            :aria-checked="state.price === price.value"
            :disabled="priceDisabled(price.value, price.count)"
            @click="setPrice(price.value as PriceRangeKey)"
          >
            <span
              class="grid size-5 shrink-0 place-items-center rounded-full border transition-colors"
              :class="state.price === price.value ? 'border-accent' : 'border-line'"
              aria-hidden="true"
            >
              <span
                v-if="state.price === price.value"
                class="size-2.5 rounded-full bg-accent"
              />
            </span>
            <span class="flex-1 text-ink">{{ price.label }}</span>
            <span class="tabular-nums text-ink-muted">{{ price.count }}</span>
          </button>
        </li>
      </ul>
    </details>

    <div class="py-5">
      <UiSwitch
        :id="`${idPrefix}-on-sale`"
        v-model="onSale"
        label="Solo ofertas"
        :description="`${facets.onSaleCount} ${facets.onSaleCount === 1 ? 'producto' : 'productos'} con descuento`"
      />
    </div>
  </div>
</template>
